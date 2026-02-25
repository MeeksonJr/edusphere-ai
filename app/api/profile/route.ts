import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/profile
 * Fetch the current user's profile
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()

        if (error) throw error

        return NextResponse.json({ profile })
    } catch (error: any) {
        console.error("Profile GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/profile
 * Update the current user's profile
 * Body: any profile column updates (full_name, username, avatar_url, display_name)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const updates = await request.json()

        // Only allow safe fields to be updated
        const allowed = ["full_name", "username", "avatar_url", "display_name"]
        const safeUpdates: Record<string, any> = { updated_at: new Date().toISOString() }
        for (const key of allowed) {
            if (updates[key] !== undefined) {
                safeUpdates[key] = updates[key]
            }
        }

        const { data: profile, error } = await (supabase
            .from("profiles") as any)
            .update(safeUpdates)
            .eq("id", user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ profile })
    } catch (error: any) {
        console.error("Profile PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
