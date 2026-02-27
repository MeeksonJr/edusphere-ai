import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
    getValidAccessToken,
    fetchGoogleEvents,
    pushEventToGoogle,
    googleEventToLocal,
} from "@/lib/google-calendar"

/**
 * POST /api/calendar/google/sync
 * Pull events from Google Calendar → upsert into calendar_events
 * Optionally push local events to Google
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

        // Get integration
        const { data: integration, error: intError } = await supabase
            .from("calendar_integrations")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", "google")
            .single()

        if (intError || !integration) {
            return NextResponse.json(
                { error: "Google Calendar not connected" },
                { status: 404 }
            )
        }

        // Get valid access token (auto-refreshes if expired)
        const accessToken = await getValidAccessToken(
            {
                access_token: integration.access_token!,
                refresh_token: integration.refresh_token!,
                token_expires_at: integration.token_expires_at!,
            },
            async (newAccessToken: string, newExpiresAt: string) => {
                await supabase
                    .from("calendar_integrations")
                    .update({
                        access_token: newAccessToken,
                        token_expires_at: newExpiresAt,
                    })
                    .eq("id", integration.id)
            }
        )

        // ── Pull from Google ────────────────────────────────────
        const { events: googleEvents, nextSyncToken } = await fetchGoogleEvents(
            accessToken,
            integration.google_calendar_id || "primary",
            integration.sync_token || undefined
        )

        let imported = 0
        let updated = 0

        for (const ge of googleEvents) {
            // Skip cancelled events
            if (ge.status === "cancelled") {
                // Delete locally if it exists
                await supabase
                    .from("calendar_events")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("external_id", ge.id)
                    .eq("source", "google")
                continue
            }

            const localEvent = googleEventToLocal(ge)

            // Check if event already exists
            const { data: existing } = await supabase
                .from("calendar_events")
                .select("id")
                .eq("user_id", user.id)
                .eq("external_id", ge.id)
                .eq("source", "google")
                .single()

            if (existing) {
                await supabase
                    .from("calendar_events")
                    .update({
                        ...localEvent,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", existing.id)
                updated++
            } else {
                await supabase.from("calendar_events").insert({
                    user_id: user.id,
                    ...localEvent,
                })
                imported++
            }
        }

        // ── Push local events to Google ─────────────────────────
        const { data: localOnly } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("user_id", user.id)
            .is("external_id", null)
            .neq("source", "google")

        let pushed = 0

        if (localOnly) {
            for (const event of localOnly) {
                try {
                    const googleEvent = await pushEventToGoogle(
                        accessToken,
                        {
                            ...event,
                            description: event.description ?? undefined,
                            location: event.location ?? undefined,
                            all_day: event.all_day ?? false,
                        },
                        integration.google_calendar_id || "primary"
                    )

                    // Update local event with Google's ID
                    await supabase
                        .from("calendar_events")
                        .update({
                            external_id: googleEvent.id,
                            source: "google",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", event.id)

                    pushed++
                } catch (err) {
                    console.error(`Failed to push event ${event.id} to Google:`, err)
                }
            }
        }

        // Update sync meta
        await supabase
            .from("calendar_integrations")
            .update({
                last_synced_at: new Date().toISOString(),
                ...(nextSyncToken ? { sync_token: nextSyncToken } : {}),
            })
            .eq("id", integration.id)

        return NextResponse.json({
            success: true,
            imported,
            updated,
            pushed,
            total_google_events: googleEvents.length,
        })
    } catch (error: any) {
        console.error("Calendar sync error:", error)
        return NextResponse.json(
            { error: error.message || "Sync failed" },
            { status: 500 }
        )
    }
}
