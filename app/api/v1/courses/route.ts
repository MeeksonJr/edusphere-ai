import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validateApiKey, logApiUsage } from "@/lib/api-keys"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
    const start = Date.now()
    const validation = await validateApiKey(req)

    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.error },
            { status: validation.status }
        )
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { searchParams } = new URL(req.url)
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
        const offset = parseInt(searchParams.get("offset") || "0")

        const { data, error, count } = await supabase
            .from("courses")
            .select("id, title, type, style, status, estimated_duration, created_at", { count: "exact" })
            .eq("user_id", validation.userId!)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        const latency = Date.now() - start
        await logApiUsage(validation.keyId!, "/api/v1/courses", "GET", 200, latency)

        return NextResponse.json({
            data: data || [],
            pagination: {
                total: count || 0,
                limit,
                offset,
            },
        })
    } catch (error: any) {
        const latency = Date.now() - start
        await logApiUsage(validation.keyId!, "/api/v1/courses", "GET", 500, latency)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
