import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/settings
 * Fetch the current user's settings
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data, error } = await (supabase
            .from("user_settings") as any)
            .select("settings")
            .eq("user_id", user.id)
            .single()

        if (error && error.code !== "PGRST116") throw error

        return NextResponse.json({ settings: (data as any)?.settings || {} })
    } catch (error: any) {
        console.error("Settings GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/settings
 * Merge new settings keys into existing user_settings JSONB
 * Body: { key1: value1, key2: value2, ... }
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const updates = await request.json()

        // Get existing settings
        const { data: existing } = await (supabase
            .from("user_settings") as any)
            .select("settings")
            .eq("user_id", user.id)
            .single()

        const mergedSettings = { ...((existing as any)?.settings || {}), ...updates }

        const { data, error } = await (supabase
            .from("user_settings") as any)
            .upsert({
                user_id: user.id,
                settings: mergedSettings,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" })
            .select("settings")
            .single()

        if (error) throw error

        return NextResponse.json({ settings: data?.settings || mergedSettings })
    } catch (error: any) {
        console.error("Settings PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
