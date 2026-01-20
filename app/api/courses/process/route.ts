import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"
import { generateSlideQuestions } from "@/lib/question-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60 // Maximum allowed for Vercel Hobby plan (60 seconds)

interface CourseLayout {
  courseId: string
  title: string
  type: string
  style: string
  estimatedDuration: number
  chapters: Array<{
    chapterId: string
    title: string
    order: number
    slides: Array<{
      slideId: string
      type: "title-slide" | "content-slide" | "transition-slide"
      content: {
        title: string
        body: string
        visualElements: string[]
      }
      narrationScript: string
      estimatedDuration: number
    }>
  }>
}

/**
 * API route to process course generation in the background
 * This handles AI generation asynchronously to avoid timeouts
 */
export async function POST(request: NextRequest) {
  let body: any = {}
  try {
    console.log("Process route called - starting course generation")
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("Process route: Unauthorized - no user")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    body = await request.json()
    const { courseId, topic, courseType, style } = body

    console.log("Process route: Processing course", { courseId, topic, courseType, style })

    if (!courseId) {
      console.error("Process route: Missing courseId")
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    // Verify course belongs to user
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id, status")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Update status to processing
    const { error: statusError } = await supabase
      .from("courses")
      .update({ status: "processing" })
      .eq("id", courseId)

    if (statusError) {
      console.error("Error updating status to processing:", statusError)
      return NextResponse.json(
        { error: "Failed to update course status" },
        { status: 500 }
      )
    }

    console.log("Status updated to processing, starting AI generation...")

    // Generate course layout using AI (this can take time)
    const systemPrompt = `You are an expert course designer. Generate a comprehensive course layout in JSON format based on the user's topic and requirements.

Requirements:
- Course type: ${courseType}
- Style: ${style}
- Generate a detailed course structure with chapters and slides
- Each slide should have: title, content (in markdown), narration script, and estimated duration
- Return ONLY valid JSON, no markdown formatting or code blocks

Course structure:
- For "quick-explainer": 1-3 chapters, 3-5 slides per chapter
- For "full-course": 5-20 chapters, 5-10 slides per chapter
- For "tutorial": 3-10 chapters, 3-7 slides per chapter

Generate unique IDs for courseId, chapterId, and slideId (use UUID format).

Return the JSON in this exact format:
{
  "courseId": "uuid",
  "title": "Course Title",
  "type": "${courseType}",
  "style": "${style}",
  "estimatedDuration": 1200,
  "chapters": [
    {
      "chapterId": "uuid",
      "title": "Chapter Title",
      "order": 1,
      "slides": [
        {
          "slideId": "uuid",
          "type": "title-slide",
          "content": {
            "title": "Slide Title",
            "body": "Slide content in markdown",
            "visualElements": ["bullet-list"]
          },
          "narrationScript": "Full narration text for this slide",
          "estimatedDuration": 45
        }
      ]
    }
  ]
}`

    const userPrompt = `Create a course about: ${topic}`

    // Generate layout with multiple fallbacks
    let aiResponseText: string
    let lastError: any = null

    // Try Gemini first (with internal model fallbacks)
    console.log("Attempting AI generation with Gemini...")
    try {
      const aiResponse = await generateAIResponse({
        provider: "gemini",
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4000,
      })
      aiResponseText = aiResponse.text
      console.log("Gemini generation successful, response length:", aiResponseText.length)
    } catch (geminiError: any) {
      console.error("Gemini AI generation error:", geminiError)
      lastError = geminiError

      // Try Groq as second fallback
      try {
        console.log("Falling back to Groq...")
        const groqResponse = await generateAIResponse({
          provider: "groq",
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 4000,
        })
        aiResponseText = groqResponse.text
      } catch (groqError: any) {
        console.error("Groq fallback also failed:", groqError)
        lastError = groqError

        // Try Hugging Face as final fallback
        try {
          console.log("Falling back to Hugging Face...")
          const hfResponse = await generateAIResponse({
            provider: "huggingface",
            prompt: `${systemPrompt}\n\n${userPrompt}`,
            systemPrompt: undefined,
            temperature: 0.7,
            maxTokens: 4000,
          })
          aiResponseText = hfResponse.text
        } catch (hfError: any) {
          console.error("All AI providers failed:", { geminiError, groqError, hfError })
          await supabase
            .from("courses")
            .update({ status: "failed" })
            .eq("id", courseId)
          return NextResponse.json(
            { 
              error: "Failed to generate course layout. All AI services are unavailable.",
              details: lastError?.message 
            },
            { status: 500 }
          )
        }
      }
    }

    // Parse AI response
    console.log("Parsing AI response...")
    let layoutJson: CourseLayout
    try {
      const cleanedResponse = aiResponseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      layoutJson = JSON.parse(cleanedResponse)
      console.log("Successfully parsed layout, chapters:", layoutJson.chapters?.length || 0)
    } catch (parseError: any) {
      console.error("Failed to parse AI response:", parseError)
      console.error("AI Response text (first 500 chars):", aiResponseText.substring(0, 500))
      await supabase
        .from("courses")
        .update({ status: "failed" })
        .eq("id", courseId)
      return NextResponse.json(
        { error: "Failed to generate valid course layout. The AI response was not in the expected format." },
        { status: 500 }
      )
    }

    // Validate layout structure
    if (!layoutJson.chapters || !Array.isArray(layoutJson.chapters) || layoutJson.chapters.length === 0) {
      console.error("Invalid layout structure - no chapters found")
      await supabase
        .from("courses")
        .update({ status: "failed" })
        .eq("id", courseId)
      return NextResponse.json(
        { error: "Generated layout is invalid - no chapters found" },
        { status: 500 }
      )
    }

    // Calculate total duration
    const totalDuration = layoutJson.chapters.reduce((total, chapter) => {
      return (
        total +
        (chapter.slides?.reduce((chapterTotal, slide) => {
          return chapterTotal + (slide.estimatedDuration || 30)
        }, 0) || 0)
      )
    }, 0)

    layoutJson.estimatedDuration = totalDuration

    console.log("Updating course with layout, duration:", totalDuration)

    // Update course with generated layout
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        title: layoutJson.title,
        layout: layoutJson,
        estimated_duration: totalDuration,
        status: "completed",
      })
      .eq("id", courseId)

    if (updateError) {
      console.error("Error updating course:", updateError)
      await supabase
        .from("courses")
        .update({ status: "failed" })
        .eq("id", courseId)
      return NextResponse.json(
        { error: "Failed to update course with generated layout", details: updateError.message },
        { status: 500 }
      )
    }

    console.log("Course updated successfully, status set to completed")

    // Generate questions for each slide (background task - don't await)
    generateQuestionsForCourse(supabase, courseId, layoutJson).catch((error) => {
      console.error("Error generating questions:", error)
      // Don't fail the request if question generation fails
    })

    return NextResponse.json({
      success: true,
      message: "Course layout generated successfully",
    })
  } catch (error: any) {
    console.error("Course processing error:", error)
    
    // Update course status to failed
    try {
      const supabase = createClient()
      await supabase
        .from("courses")
        .update({ status: "failed" })
        .eq("id", body?.courseId || "")
    } catch (updateError) {
      console.error("Failed to update course status:", updateError)
    }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Generate questions for all slides in a course (background task)
 */
async function generateQuestionsForCourse(
  supabase: any,
  courseId: string,
  layout: CourseLayout
) {
  try {
    if (!layout.chapters || layout.chapters.length === 0) {
      return
    }

    // Generate questions for each slide
    for (const chapter of layout.chapters) {
      if (!chapter.slides) continue

      for (const slide of chapter.slides) {
        // Skip title slides for questions
        if (slide.type === "title-slide" || slide.type === "transition-slide") {
          continue
        }

        try {
          const slideContent = slide.content?.body || ""
          const narrationScript = slide.narrationScript || ""

          if (!slideContent && !narrationScript) {
            continue
          }

          // Generate 2-3 questions per slide
          const questions = await generateSlideQuestions(
            slideContent,
            narrationScript,
            3
          )

          // Save questions to database
          if (questions.length > 0) {
            const questionsToInsert = questions.map((q: any, index: number) => ({
              course_id: courseId,
              slide_id: slide.slideId,
              chapter_id: chapter.chapterId,
              question_type: q.questionType,
              question: q.question,
              options: q.options || null,
              correct_answer: q.correctAnswer,
              explanation: q.explanation || null,
              difficulty: q.difficulty,
              order_index: index,
            }))

            await supabase.from("course_questions").insert(questionsToInsert)
          }
        } catch (slideError) {
          console.error(`Error generating questions for slide ${slide.slideId}:`, slideError)
          // Continue with next slide
        }
      }
    }

    console.log(`Generated questions for course ${courseId}`)
  } catch (error) {
    console.error("Error in generateQuestionsForCourse:", error)
    // Don't throw - this is a background task
  }
}

