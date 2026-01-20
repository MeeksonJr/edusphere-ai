import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { processCourse } from "@/lib/course-processing"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * API route to trigger background processing of a course
 * This is called after course layout is generated
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course belongs to user
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Trigger background processing (non-blocking)
    // In production, you might want to use a queue system like BullMQ or similar
    processCourse({
      courseId,
      userId: user.id,
    }).catch((error) => {
      console.error("Background processing error:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Course processing started",
    })
  } catch (error: any) {
    console.error("Course processing API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

