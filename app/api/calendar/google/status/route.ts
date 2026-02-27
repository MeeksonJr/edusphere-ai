import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * GET /api/calendar/google/status
 * Returns the user's Google Calendar integration status
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: integration } = await supabase
            .from("calendar_integrations")
            .select("id, provider, sync_enabled, last_synced_at, created_at")
            .eq("user_id", user.id)
            .eq("provider", "google")
            .single()

        return NextResponse.json({ integration: integration || null })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to get status" },
            { status: 500 }
        )
    }
}
