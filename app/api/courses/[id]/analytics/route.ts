import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/courses/[id]/analytics
 * Track analytics events for a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { eventType, eventData } = body

    if (!eventType) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 }
      )
    }

    const validEventTypes = ["view", "complete", "quiz", "pause", "seek", "bookmark", "note", "resource_click"]
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      )
    }

    const { data: analytics, error } = await supabase
      .from("course_analytics")
      .insert([
        {
          course_id: params.id,
          user_id: user.id,
          event_type: eventType,
          event_data: eventData || {},
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error tracking analytics:", error)
      return NextResponse.json(
        { error: "Failed to track analytics" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analytics,
    })
  } catch (error: any) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/courses/[id]/analytics
 * Get analytics for a course (course owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get("eventType")
    const limit = parseInt(searchParams.get("limit") || "100")

    let query = supabase
      .from("course_analytics")
      .select("*")
      .eq("course_id", params.id)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (eventType) {
      query = query.eq("event_type", eventType)
    }

    const { data: analytics, error } = await query

    if (error) {
      console.error("Error fetching analytics:", error)
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
    }

    // Calculate summary statistics
    const summary = {
      totalEvents: analytics?.length || 0,
      byEventType: {} as Record<string, number>,
      uniqueUsers: new Set(analytics?.map((a) => a.user_id) || []).size,
    }

    analytics?.forEach((event) => {
      summary.byEventType[event.event_type] = (summary.byEventType[event.event_type] || 0) + 1
    })

    return NextResponse.json({
      analytics: analytics || [],
      summary,
    })
  } catch (error: any) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

