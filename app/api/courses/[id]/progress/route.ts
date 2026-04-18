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
    const supabase = await createClient()
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
    const supabase = await createClient()
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

    let certificateAwarded = false
    let newCertificate = null

    // Check for course completion to trigger auto-certificates if the slide was just completed
    if (completed) {
      // 1. Get total slides in course
      const { count: totalSlides } = await supabase
        .from("course_slides")
        .select("id", { count: "exact", head: true })
        .eq("course_id", params.id)
        
      // 2. Get completed slides by user
      const { count: completedSlides } = await supabase
        .from("course_progress")
        .select("id", { count: "exact", head: true })
        .eq("course_id", params.id)
        .eq("user_id", user.id)
        .eq("completed", true)

      if (totalSlides && totalSlides > 0 && completedSlides === totalSlides) {
        // Course is 100% completed
        // 3. Check if certificate already exists
        const { data: existingCert } = await supabase
          .from("certificates")
          .select("id")
          .eq("course_id", params.id)
          .eq("user_id", user.id)
          .single()

        if (!existingCert) {
          // 4. Time to mint a certificate! First get course and user info
          const { data: courseData } = await supabase
            .from("courses")
            .select("title")
            .eq("id", params.id)
            .single()

          const { data: userData } = await (supabase as any)
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single()

          const recipientName = userData?.full_name || user.email?.split('@')[0] || "Student"
          const certNumber = `EDUSPHERE-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

          // 5. Create certificate
          const { data: createdCert, error: certError } = await supabase
            .from("certificates")
            .insert({
              user_id: user.id,
              course_id: params.id,
              title: courseData?.title || "Edusphere Course",
              description: `Successfully completed all modules of ${courseData?.title}`,
              certificate_number: certNumber,
              template_id: "course_completion",
              metadata: {
                recipient_name: recipientName,
                course_title: courseData?.title,
                student_avatar: userData?.avatar_url,
                total_slides: totalSlides,
                issue_date: new Date().toISOString()
              }
            })
            .select()
            .single()

          if (!certError) {
            certificateAwarded = true
            newCertificate = createdCert
          } else {
            console.error("[generate-certificate] Failed to insert:", certError)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      progress,
      certificateAwarded,
      certificate: newCertificate
    })
  } catch (error: any) {
    console.error("Progress API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

