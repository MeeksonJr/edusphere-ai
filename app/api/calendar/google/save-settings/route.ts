import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * POST /api/calendar/google/save-settings
 * Update the save_to_db preference for Google Calendar integration.
 * When switching from true → false, removes stored google events.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const saveToDb = Boolean(body.save_to_db)

        // Get current integration
        const { data: integration, error: intError } = await supabase
            .from("calendar_integrations")
            .select("id, save_to_db")
            .eq("user_id", user.id)
            .eq("provider", "google")
            .single()

        if (intError || !integration) {
            return NextResponse.json(
                { error: "Google Calendar not connected" },
                { status: 404 }
            )
        }

        // Update preference
        const { error: updateErr } = await supabase
            .from("calendar_integrations")
            .update({ save_to_db: saveToDb })
            .eq("id", integration.id)

        if (updateErr) {
            return NextResponse.json(
                { error: "Failed to update preference" },
                { status: 500 }
            )
        }

        // If switching from save → don't save, clear stored google events
        if (integration.save_to_db && !saveToDb) {
            await supabase
                .from("calendar_events")
                .delete()
                .eq("user_id", user.id)
                .eq("source", "google")
        }

        return NextResponse.json({ success: true, save_to_db: saveToDb })
    } catch (error: any) {
        console.error("Save settings error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to update settings" },
            { status: 500 }
        )
    }
}
