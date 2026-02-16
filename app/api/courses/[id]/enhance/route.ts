import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60 // Vercel Hobby plan limit

/**
 * POST /api/courses/[id]/enhance
 * Enhance/expand an existing course with more content
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Enhance route called for course:", params.id)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get existing course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, user_id, layout, type, style, title")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const existingLayout = course.layout as any
    if (!existingLayout || !existingLayout.chapters) {
      return NextResponse.json(
        { error: "Course layout not found. Please generate the course first." },
        { status: 400 }
      )
    }

    // Update status to enhancing
    await supabase
      .from("courses")
      .update({ status: "processing" })
      .eq("id", params.id)

    console.log("Enhancing course with", existingLayout.chapters.length, "chapters")

    // Enhance each chapter with more slides and detailed content
    const enhancedChapters = []
    for (const chapter of existingLayout.chapters) {
      console.log(`Enhancing chapter: ${chapter.title}`)

      const enhancePrompt = `You are an expert course designer. Enhance the following chapter with more detailed content.

Existing Chapter:
Title: ${chapter.title}
Current slides: ${chapter.slides?.length || 0}

Course Type: ${course.type}
Style: ${course.style}

Requirements:
- Keep the existing slides but enhance their content with more detail
- Add 2-4 new slides to expand the chapter
- Each new slide should have: title, detailed content (4-6 sentences), narration script (2-3 sentences), estimated duration (45-90 seconds)
- Maintain consistency with the existing content
- Return ONLY valid JSON

Return the enhanced chapter in this format:
{
  "chapterId": "${chapter.chapterId}",
  "title": "${chapter.title}",
  "order": ${chapter.order},
  "slides": [
    // Include all existing slides (enhanced) plus new slides
    {
      "slideId": "uuid",
      "type": "content-slide",
      "content": {
        "title": "Enhanced Slide Title",
        "body": "Detailed content with 4-6 sentences...",
        "visualElements": ["bullet-list"]
      },
      "narrationScript": "Detailed narration with 2-3 sentences...",
      "estimatedDuration": 60
    }
  ]
}`

      try {
        // Use Groq first (faster)
        let enhancedChapterText: string
        try {
          const response = await generateAIResponse({
            provider: "groq",
            prompt: enhancePrompt,
            systemPrompt: "You are an expert course designer that enhances educational content.",
            temperature: 0.7,
            maxTokens: 3000,
          })
          enhancedChapterText = response.text
        } catch (groqError) {
          // Fallback to Gemini
          console.log("Groq failed, trying Gemini...")
          const response = await generateAIResponse({
            provider: "gemini",
            prompt: enhancePrompt,
            systemPrompt: "You are an expert course designer that enhances educational content.",
            temperature: 0.7,
            maxTokens: 3000,
          })
          enhancedChapterText = response.text
        }

        // Parse enhanced chapter
        const cleaned = enhancedChapterText
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim()

        const enhancedChapter = JSON.parse(cleaned)
        enhancedChapters.push(enhancedChapter)
      } catch (chapterError: any) {
        console.error(`Error enhancing chapter ${chapter.title}:`, chapterError)
        // Keep original chapter if enhancement fails
        enhancedChapters.push(chapter)
      }
    }

    // Recalculate total duration
    const totalDuration = enhancedChapters.reduce((total, chapter) => {
      return (
        total +
        (chapter.slides?.reduce((chapterTotal: number, slide: any) => {
          return chapterTotal + (slide.estimatedDuration || 30)
        }, 0) || 0)
      )
    }, 0)

    // Update course with enhanced layout
    const enhancedLayout = {
      ...existingLayout,
      chapters: enhancedChapters,
      estimatedDuration: totalDuration,
      enhanced: true,
      enhancedAt: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        layout: enhancedLayout,
        estimated_duration: totalDuration,
        status: "completed",
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating enhanced course:", updateError)
      await supabase
        .from("courses")
        .update({ status: "failed" })
        .eq("id", params.id)
      return NextResponse.json(
        { error: "Failed to update course with enhanced layout" },
        { status: 500 }
      )
    }

    console.log("Course enhanced successfully")

    return NextResponse.json({
      success: true,
      message: "Course enhanced successfully",
      chapters: enhancedChapters.length,
      totalSlides: enhancedChapters.reduce(
        (total, ch) => total + (ch.slides?.length || 0),
        0
      ),
    })
  } catch (error: any) {
    console.error("Enhance route error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

