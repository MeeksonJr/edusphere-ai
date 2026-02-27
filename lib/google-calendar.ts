/**
 * Google Calendar API helper
 * Handles OAuth token management and calendar event operations
 */

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"

interface GoogleTokens {
    access_token: string
    refresh_token: string
    token_expires_at: string
}

interface GoogleCalendarEvent {
    id: string
    summary: string
    description?: string
    start: { dateTime?: string; date?: string; timeZone?: string }
    end: { dateTime?: string; date?: string; timeZone?: string }
    location?: string
    status?: string
    updated?: string
}

interface SyncResult {
    events: GoogleCalendarEvent[]
    nextSyncToken?: string
}

// ── OAuth Helpers ──────────────────────────────────────────

export function getGoogleOAuthURL(state?: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !redirectUri) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_REDIRECT_URI env vars")
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: [
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly",
        ].join(" "),
        access_type: "offline",
        prompt: "consent",
        ...(state ? { state } : {}),
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
}> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
            grant_type: "authorization_code",
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Token exchange failed: ${err}`)
    }

    return res.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    expires_in: number
}> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
        }),
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Token refresh failed: ${err}`)
    }

    return res.json()
}

export async function revokeToken(token: string): Promise<void> {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
}

// ── Token Management ───────────────────────────────────────

export async function getValidAccessToken(
    tokens: GoogleTokens,
    updateTokens: (newAccessToken: string, newExpiresAt: string) => Promise<void>
): Promise<string> {
    const expiresAt = new Date(tokens.token_expires_at)
    const now = new Date()

    // Refresh if token expires in less than 5 minutes
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        const refreshed = await refreshAccessToken(tokens.refresh_token)
        const newExpiresAt = new Date(
            Date.now() + refreshed.expires_in * 1000
        ).toISOString()

        await updateTokens(refreshed.access_token, newExpiresAt)
        return refreshed.access_token
    }

    return tokens.access_token
}

// ── Calendar Event Operations ──────────────────────────────

export async function fetchGoogleEvents(
    accessToken: string,
    calendarId: string = "primary",
    syncToken?: string
): Promise<SyncResult> {
    const allEvents: GoogleCalendarEvent[] = []
    let pageToken: string | undefined
    let nextSyncToken: string | undefined

    do {
        const params = new URLSearchParams({
            maxResults: "100",
            singleEvents: "true",
            orderBy: "startTime",
        })

        if (syncToken) {
            params.set("syncToken", syncToken)
        } else {
            // Initial full sync: get events from 3 months ago to 6 months ahead
            const timeMin = new Date()
            timeMin.setMonth(timeMin.getMonth() - 3)
            const timeMax = new Date()
            timeMax.setMonth(timeMax.getMonth() + 6)
            params.set("timeMin", timeMin.toISOString())
            params.set("timeMax", timeMax.toISOString())
        }

        if (pageToken) {
            params.set("pageToken", pageToken)
        }

        const res = await fetch(
            `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        )

        if (res.status === 410) {
            // Sync token expired — need full resync
            return fetchGoogleEvents(accessToken, calendarId)
        }

        if (!res.ok) {
            const err = await res.text()
            throw new Error(`Google Calendar API error: ${err}`)
        }

        const data = await res.json()
        allEvents.push(...(data.items || []))
        pageToken = data.nextPageToken
        nextSyncToken = data.nextSyncToken
    } while (pageToken)

    return { events: allEvents, nextSyncToken }
}

export async function pushEventToGoogle(
    accessToken: string,
    event: {
        title: string
        description?: string
        start_time: string
        end_time: string
        all_day?: boolean
        location?: string
    },
    calendarId: string = "primary"
): Promise<GoogleCalendarEvent> {
    const body: any = {
        summary: event.title,
        description: event.description || "",
        location: event.location || "",
    }

    if (event.all_day) {
        body.start = { date: event.start_time.split("T")[0] }
        body.end = { date: event.end_time.split("T")[0] }
    } else {
        body.start = { dateTime: event.start_time }
        body.end = { dateTime: event.end_time }
    }

    const res = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    )

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Failed to push event to Google Calendar: ${err}`)
    }

    return res.json()
}

export async function deleteGoogleEvent(
    accessToken: string,
    googleEventId: string,
    calendarId: string = "primary"
): Promise<void> {
    const res = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(googleEventId)}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
        }
    )

    if (!res.ok && res.status !== 404) {
        const err = await res.text()
        throw new Error(`Failed to delete Google event: ${err}`)
    }
}

// ── Conversion Helpers ─────────────────────────────────────

export function googleEventToLocal(ge: GoogleCalendarEvent) {
    const isAllDay = !!ge.start.date
    return {
        title: ge.summary || "(No title)",
        description: ge.description || null,
        start_time: isAllDay ? `${ge.start.date}T00:00:00Z` : ge.start.dateTime!,
        end_time: isAllDay ? `${ge.end.date}T23:59:59Z` : ge.end.dateTime!,
        all_day: isAllDay,
        location: ge.location || null,
        source: "google",
        external_id: ge.id,
        color: "#4285F4", // Google blue
    }
}
