import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/calendar-proxy?url=<ics_url>
 * Server-side proxy to fetch .ics calendar feeds.
 * Bypasses CORS restrictions that block browser-side fetches.
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const url = searchParams.get("url")

        if (!url) {
            return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 })
        }

        // Validate URL format
        try {
            new URL(url)
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
        }

        // Fetch the calendar feed server-side (no CORS)
        const response = await fetch(url, {
            headers: {
                "Accept": "text/calendar, text/plain, */*",
                "User-Agent": "EduSphere-AI/1.0",
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch calendar: ${response.status} ${response.statusText}` },
                { status: response.status }
            )
        }

        const text = await response.text()

        return new NextResponse(text, {
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
            },
        })
    } catch (error: any) {
        console.error("Calendar proxy error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
