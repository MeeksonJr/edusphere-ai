import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { exchangeCodeForTokens } from "@/lib/google-calendar"

/**
 * GET /api/calendar/google/callback
 * Handles the OAuth callback from Google, stores tokens, and redirects to settings
 */
export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")

    if (error) {
        return NextResponse.redirect(
            new URL("/dashboard/settings?calendar_error=denied", request.url)
        )
    }

    if (!code) {
        return NextResponse.redirect(
            new URL("/dashboard/settings?calendar_error=no_code", request.url)
        )
    }

    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(
                new URL("/login?redirect=/dashboard/settings", request.url)
            )
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code)
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

        // Upsert into calendar_integrations
        const { error: dbError } = await supabase
            .from("calendar_integrations")
            .upsert(
                {
                    user_id: user.id,
                    provider: "google",
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    token_expires_at: expiresAt,
                    sync_enabled: true,
                },
                { onConflict: "user_id,provider" }
            )

        if (dbError) {
            console.error("Failed to store calendar integration:", dbError)
            return NextResponse.redirect(
                new URL("/dashboard/settings?calendar_error=db_error", request.url)
            )
        }

        return NextResponse.redirect(
            new URL("/dashboard/settings?calendar_connected=true", request.url)
        )
    } catch (err: any) {
        console.error("Google Calendar callback error:", err)
        return NextResponse.redirect(
            new URL("/dashboard/settings?calendar_error=token_exchange", request.url)
        )
    }
}
