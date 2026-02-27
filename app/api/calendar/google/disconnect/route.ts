import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { revokeToken } from "@/lib/google-calendar"

/**
 * POST /api/calendar/google/disconnect
 * Revokes Google OAuth tokens and removes the integration
 */
export async function POST() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get existing integration
        const { data: integration } = await supabase
            .from("calendar_integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", "google")
            .single()

        if (integration) {
            // Revoke token with Google
            try {
                if (integration.access_token) {
                    await revokeToken(integration.access_token)
                }
            } catch (err) {
                // Non-critical — token may already be expired
                console.warn("Failed to revoke Google token:", err)
            }

            // Delete from DB
            await supabase
                .from("calendar_integrations")
                .delete()
                .eq("id", integration.id)

            // Optionally delete synced Google events
            await supabase
                .from("calendar_events")
                .delete()
                .eq("user_id", user.id)
                .eq("source", "google")
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Disconnect error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to disconnect" },
            { status: 500 }
        )
    }
}
