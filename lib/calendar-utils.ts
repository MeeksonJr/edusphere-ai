export async function parseICalendar(icalString: string): Promise<{ events: any[]; error: string | null }> {
  try {
    // Basic validation
    if (!icalString.includes("BEGIN:VCALENDAR") || !icalString.includes("END:VCALENDAR")) {
      return { events: [], error: "Invalid iCalendar format" }
    }

    const vevents = icalString.split("BEGIN:VEVENT")
    const events = []

    for (let i = 1; i < vevents.length; i++) {
      const eventString = vevents[i]
      const endIndex = eventString.indexOf("END:VEVENT")
      if (endIndex === -1) continue

      const cleanEventString = eventString.substring(0, endIndex)

      // Extract event properties with more robust regex
      const titleMatch = cleanEventString.match(/SUMMARY(?:;[^:]*)?:([^\r\n]+)/)
      const startMatch = cleanEventString.match(/DTSTART(?:;[^:]*)?:([^\r\n]+)/)
      const endMatch = cleanEventString.match(/DTEND(?:;[^:]*)?:([^\r\n]+)/)
      const descriptionMatch = cleanEventString.match(/DESCRIPTION(?:;[^:]*)?:([^\r\n]+)/)
      const locationMatch = cleanEventString.match(/LOCATION(?:;[^:]*)?:([^\r\n]+)/)

      const title = titleMatch ? titleMatch[1].trim() : "Untitled Event"
      const start = startMatch ? parseICalDate(startMatch[1].trim()) : null
      const end = endMatch ? parseICalDate(endMatch[1].trim()) : start ? new Date(start.getTime() + 3600000) : null // Default to 1 hour after start
      const description = descriptionMatch
        ? descriptionMatch[1].trim().replace(/\\n/g, "\n").replace(/\\,/g, ",")
        : null
      const location = locationMatch ? locationMatch[1].trim() : null

      if (start) {
        events.push({
          title,
          start,
          end: end || new Date(start.getTime() + 3600000), // Ensure end time exists
          description,
          location,
        })
      }
    }

    return { events, error: null }
  } catch (error: any) {
    console.error("Error parsing iCalendar:", error)
    return { events: [], error: error.message }
  }
}

function parseICalDate(dateString: string): Date | null {
  try {
    // Handle different date formats
    if (dateString.includes("T")) {
      // Format with time component
      const year = Number.parseInt(dateString.substring(0, 4))
      const month = Number.parseInt(dateString.substring(4, 6)) - 1
      const day = Number.parseInt(dateString.substring(6, 8))

      let hour = 0,
        minute = 0,
        second = 0

      if (dateString.length >= 13) {
        hour = Number.parseInt(dateString.substring(9, 11))
        minute = Number.parseInt(dateString.substring(11, 13))
      }

      if (dateString.length >= 15) {
        second = Number.parseInt(dateString.substring(13, 15))
      }

      if (dateString.endsWith("Z")) {
        return new Date(Date.UTC(year, month, day, hour, minute, second))
      } else {
        return new Date(year, month, day, hour, minute, second)
      }
    } else {
      // Date only format
      const year = Number.parseInt(dateString.substring(0, 4))
      const month = Number.parseInt(dateString.substring(4, 6)) - 1
      const day = Number.parseInt(dateString.substring(6, 8))
      return new Date(year, month, day)
    }
  } catch (e) {
    console.error("Error parsing date:", e, dateString)
    return null
  }
}
