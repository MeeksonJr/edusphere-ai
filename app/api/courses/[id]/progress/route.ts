import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/courses/[id]/progress
 * Get user's progress for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slideId = searchParams.get("slideId")

    let query = supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", params.id)

    if (slideId) {
      query = query.eq("slide_id", slideId)
    }

    const { data: progress, error } = await query

    if (error) {
      console.error("Error fetching progress:", error)
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
    }

    // Calculate overall progress
    const totalProgress = progress?.length || 0
    const completedCount = progress?.filter((p) => p.completed).length || 0

    return NextResponse.json({
      progress: progress || [],
      totalSlides: totalProgress,
      completedSlides: completedCount,
      progressPercentage: totalProgress > 0 ? Math.round((completedCount / totalProgress) * 100) : 0,
    })
  } catch (error: any) {
    console.error("Progress API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/progress
 * Update user's progress for a course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { slideId, completed, timeSpent, lastPosition, quizScores, notes, bookmarks } = body

    // Upsert progress
    const { data: progress, error } = await supabase
      .from("course_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: params.id,
          slide_id: slideId || null,
          completed: completed ?? false,
          time_spent: timeSpent || 0,
          last_position: lastPosition || 0,
          quiz_scores: quizScores || {},
          notes: notes || null,
          bookmarks: bookmarks || [],
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,course_id,slide_id",
        }
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating progress:", error)
      return NextResponse.json(
        { error: "Failed to update progress" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error: any) {
    console.error("Progress API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

