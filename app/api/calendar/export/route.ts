import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * GET /api/calendar/export
 * Generates an .ics file from user's calendar_events for download
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

        const { data: events } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("user_id", user.id)
            .order("start_time", { ascending: true })

        if (!events || events.length === 0) {
            return NextResponse.json({ error: "No events to export" }, { status: 404 })
        }

        // Build ICS file
        const icsLines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//EduSphere AI//Calendar Export//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            `X-WR-CALNAME:EduSphere AI Calendar`,
        ]

        for (const event of events) {
            const uid = `${event.id}@edusphere.ai`
            const dtstart = formatICSDate(event.start_time, event.all_day ?? false)
            const dtend = formatICSDate(event.end_time, event.all_day ?? false)
            const created = formatICSDate(event.created_at || new Date().toISOString(), false)

            icsLines.push("BEGIN:VEVENT")
            icsLines.push(`UID:${uid}`)

            if (event.all_day) {
                icsLines.push(`DTSTART;VALUE=DATE:${dtstart}`)
                icsLines.push(`DTEND;VALUE=DATE:${dtend}`)
            } else {
                icsLines.push(`DTSTART:${dtstart}`)
                icsLines.push(`DTEND:${dtend}`)
            }

            icsLines.push(`SUMMARY:${escapeICS(event.title)}`)

            if (event.description) {
                icsLines.push(`DESCRIPTION:${escapeICS(event.description)}`)
            }
            if (event.location) {
                icsLines.push(`LOCATION:${escapeICS(event.location)}`)
            }

            icsLines.push(`DTSTAMP:${created}`)
            icsLines.push("END:VEVENT")
        }

        icsLines.push("END:VCALENDAR")

        const icsContent = icsLines.join("\r\n")

        return new NextResponse(icsContent, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="edusphere-calendar.ics"`,
            },
        })
    } catch (error: any) {
        console.error("Calendar export error:", error)
        return NextResponse.json(
            { error: error.message || "Export failed" },
            { status: 500 }
        )
    }
}

function formatICSDate(dateStr: string, allDay: boolean): string {
    const d = new Date(dateStr)
    if (allDay) {
        const year = d.getUTCFullYear()
        const month = String(d.getUTCMonth() + 1).padStart(2, "0")
        const day = String(d.getUTCDate()).padStart(2, "0")
        return `${year}${month}${day}`
    }

    return d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")
}

function escapeICS(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n")
}
