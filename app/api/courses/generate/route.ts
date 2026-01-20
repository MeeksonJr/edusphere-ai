import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url)
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { topic, courseType, style } = body

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Generate course layout using AI
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

    // Generate layout
    const aiResponse = await generateAIResponse({
      provider: "gemini",
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Parse AI response (handle markdown code blocks if present)
    let layoutJson: CourseLayout
    try {
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      layoutJson = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      return NextResponse.json(
        { error: "Failed to generate valid course layout. Please try again." },
        { status: 500 }
      )
    }

    // Calculate total duration
    const totalDuration = layoutJson.chapters.reduce((total, chapter) => {
      return (
        total +
        chapter.slides.reduce((chapterTotal, slide) => {
          return chapterTotal + (slide.estimatedDuration || 30)
        }, 0)
      )
    }, 0)

    layoutJson.estimatedDuration = totalDuration

    // Save course to database
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          user_id: user.id,
          title: layoutJson.title,
          type: layoutJson.type,
          style: layoutJson.style,
          status: "processing",
          layout: layoutJson,
          estimated_duration: totalDuration,
        },
      ])
      .select()
      .single()

    if (courseError) {
      console.error("Database error:", courseError)
      return NextResponse.json({ error: "Failed to save course" }, { status: 500 })
    }

    // Trigger async processing
    // Call the process endpoint to start background processing
    try {
      const processResponse = await fetch(`${requestUrl.origin}/api/courses/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("Cookie") || "",
        },
        body: JSON.stringify({ courseId: course.id }),
      })

      if (!processResponse.ok) {
        console.warn("Failed to trigger background processing, but course was created")
      }
    } catch (processError) {
      console.error("Error triggering background processing:", processError)
      // Don't fail the request if processing trigger fails
    }

    return NextResponse.json({
      success: true,
      courseId: course.id,
      status: "processing",
    })
  } catch (error: any) {
    console.error("Course generation error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

