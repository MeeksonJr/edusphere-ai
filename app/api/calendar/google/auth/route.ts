import { NextResponse } from "next/server"
import { getGoogleOAuthURL } from "@/lib/google-calendar"

/**
 * GET /api/calendar/google/auth
 * Redirects the user to Google's OAuth consent page
 */
export async function GET() {
    try {
        const url = getGoogleOAuthURL()
        return NextResponse.redirect(url)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to generate OAuth URL" },
            { status: 500 }
        )
    }
}
