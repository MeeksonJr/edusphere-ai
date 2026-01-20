import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateQuestions, generateSlideQuestions, generateChapterQuestions } from "@/lib/question-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/courses/[id]/questions
 * Get all questions for a course
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
    const chapterId = searchParams.get("chapterId")

    let query = supabase
      .from("course_questions")
      .select("*")
      .eq("course_id", params.id)
      .order("order_index", { ascending: true })

    if (slideId) {
      query = query.eq("slide_id", slideId)
    }
    if (chapterId) {
      query = query.eq("chapter_id", chapterId)
    }

    const { data: questions, error } = await query

    if (error) {
      console.error("Error fetching questions:", error)
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }

    return NextResponse.json({ questions: questions || [] })
  } catch (error: any) {
    console.error("Questions API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses/[id]/questions
 * Generate or create questions
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

    // Verify course belongs to user
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id, layout")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json()
    const { action, slideId, chapterId, content, questionType, difficulty, count } = body

    if (action === "generate") {
      // Generate questions using AI
      let questions
      if (slideId && content) {
        // Generate questions for a specific slide
        const slide = findSlideInLayout(course.layout, slideId)
        questions = await generateSlideQuestions(
          content,
          slide?.narrationScript,
          count || 3
        )
      } else if (chapterId && content) {
        // Generate questions for a chapter
        questions = await generateChapterQuestions(content, count || 10)
      } else {
        return NextResponse.json(
          { error: "Content is required for question generation" },
          { status: 400 }
        )
      }

      // Save generated questions to database
      const questionsToInsert = questions.map((q, index) => ({
        course_id: params.id,
        slide_id: slideId || null,
        chapter_id: chapterId || null,
        question_type: q.questionType,
        question: q.question,
        options: q.options || null,
        correct_answer: q.correctAnswer,
        explanation: q.explanation || null,
        difficulty: q.difficulty,
        order_index: index,
      }))

      const { data: insertedQuestions, error: insertError } = await supabase
        .from("course_questions")
        .insert(questionsToInsert)
        .select()

      if (insertError) {
        console.error("Error saving questions:", insertError)
        return NextResponse.json(
          { error: "Failed to save questions" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        questions: insertedQuestions,
        message: `Generated ${questions.length} questions`,
      })
    } else if (action === "create") {
      // Manually create a question
      const { question, options, correctAnswer, explanation } = body

      if (!question || !correctAnswer) {
        return NextResponse.json(
          { error: "Question and correct answer are required" },
          { status: 400 }
        )
      }

      const { data: newQuestion, error: createError } = await supabase
        .from("course_questions")
        .insert([
          {
            course_id: params.id,
            slide_id: slideId || null,
            chapter_id: chapterId || null,
            question_type: questionType || "multiple-choice",
            question,
            options: options || null,
            correct_answer: correctAnswer,
            explanation: explanation || null,
            difficulty: difficulty || "medium",
          },
        ])
        .select()
        .single()

      if (createError) {
        console.error("Error creating question:", createError)
        return NextResponse.json(
          { error: "Failed to create question" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        question: newQuestion,
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Questions API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Helper function to find a slide in the course layout
 */
function findSlideInLayout(layout: any, slideId: string): any {
  if (!layout || !layout.chapters) return null

  for (const chapter of layout.chapters) {
    if (chapter.slides) {
      const slide = chapter.slides.find((s: any) => s.slideId === slideId)
      if (slide) return slide
    }
  }
  return null
}

