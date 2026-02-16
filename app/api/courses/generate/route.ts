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
    const supabase = await createClient()
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

    // Create course record immediately with pending status to avoid timeout
    // AI generation will happen in background processing
    // Use empty layout object to satisfy NOT NULL constraint
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert([
        {
          user_id: user.id,
          title: `Course: ${topic.substring(0, 100)}`, // Temporary title
          type: courseType,
          style: style,
          status: "pending",
          layout: {}, // Empty object - will be replaced in background processing
          estimated_duration: 0, // Will be calculated in background
        },
      ])
      .select()
      .single()

    if (courseError) {
      console.error("Database error:", courseError)
      return NextResponse.json({ error: "Failed to save course" }, { status: 500 })
    }

    // Trigger async processing immediately (don't wait for it)
    // This will generate the layout in the background
    fetch(`${requestUrl.origin}/api/courses/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("Cookie") || "",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({
        courseId: course.id,
        topic,
        courseType,
        style,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Process route returned error:", response.status, errorText)
          // Update course status to failed if processing fails
          await supabase
            .from("courses")
            .update({ status: "failed" })
            .eq("id", course.id)
        } else {
          console.log("Process route called successfully for course:", course.id)
        }
      })
      .catch((error) => {
        console.error("Error triggering background processing:", error)
        // Update course status to failed if processing trigger fails
        supabase
          .from("courses")
          .update({ status: "failed" })
          .eq("id", course.id)
          .catch(console.error)
      })

    // Don't await the processing - return immediately
    // The process endpoint will handle AI generation asynchronously

    return NextResponse.json({
      success: true,
      courseId: course.id,
      status: "pending",
      message: "Course generation started. It will be processed in the background.",
    })
  } catch (error: any) {
    console.error("Course generation error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

