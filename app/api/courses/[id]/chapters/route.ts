import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const maxDuration = 30

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, topic } = body

    if (!title || !topic) {
      return NextResponse.json(
        { error: "Chapter title and topic are required" },
        { status: 400 }
      )
    }

    const currentLayout = course.layout as any || { chapters: [] }
    const existingChapters = currentLayout.chapters || []
    const newChapterOrder = existingChapters.length + 1

    // Generate chapter content using AI
    const response = await generateAIResponse({
      provider: "gemini",
      prompt: `Generate a chapter for a course about "${course.title}". 
      
Chapter Title: ${title}
Chapter Topic: ${topic}

Create a chapter with 3-5 slides covering this topic. Return a JSON object with this structure:
{
  "chapterId": "generate-uuid-here",
  "title": "${title}",
  "order": ${newChapterOrder},
  "slides": [
    {
      "slideId": "generate-uuid-here",
      "type": "title-slide",
      "content": {
        "title": "Slide Title",
        "body": "Slide content in markdown",
        "visualElements": []
      },
      "narrationScript": "Full narration text",
      "estimatedDuration": 30
    }
  ]
}

Return ONLY the JSON object, no markdown formatting.`,
      systemPrompt: "You are an educational AI assistant that creates course chapters. Return valid JSON only.",
      maxTokens: 2000,
    })

    let newChapter: any
    try {
      const jsonStr = response.text.match(/\{[\s\S]*\}/)?.[0] || "{}"
      newChapter = JSON.parse(jsonStr)
      
      // Ensure chapter has required fields
      if (!newChapter.chapterId) {
        newChapter.chapterId = `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      }
      newChapter.order = newChapterOrder
      newChapter.title = title

      // Ensure slides have required fields
      if (newChapter.slides && Array.isArray(newChapter.slides)) {
        newChapter.slides = newChapter.slides.map((slide: any, index: number) => ({
          ...slide,
          slideId: slide.slideId || `slide-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 9)}`,
          type: slide.type || "content-slide",
          content: slide.content || { title: "", body: "", visualElements: [] },
          narrationScript: slide.narrationScript || "",
          estimatedDuration: slide.estimatedDuration || 30,
        }))
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      // Create a basic chapter structure if parsing fails
      newChapter = {
        chapterId: `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: title,
        order: newChapterOrder,
        slides: [
          {
            slideId: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: "title-slide",
            content: {
              title: title,
              body: `This chapter covers ${topic}.`,
              visualElements: [],
            },
            narrationScript: `Welcome to ${title}. This chapter will cover ${topic}.`,
            estimatedDuration: 30,
          },
        ],
      }
    }

    // Add the new chapter to the layout
    const updatedLayout = {
      ...currentLayout,
      chapters: [...existingChapters, newChapter],
    }

    // Calculate new total duration
    const totalDuration = updatedLayout.chapters.reduce((total: number, chapter: any) => {
      return (
        total +
        (chapter.slides?.reduce((chapterTotal: number, slide: any) => {
          return chapterTotal + (slide.estimatedDuration || 30)
        }, 0) || 0)
      )
    }, 0)

    // Update the course
    const { error: updateError } = await supabase
      .from("courses")
      .update({
        layout: updatedLayout,
        estimated_duration: totalDuration,
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating course:", updateError)
      return NextResponse.json(
        { error: "Failed to update course with new chapter" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Chapter added successfully",
      chapter: newChapter,
      totalDuration,
    })
  } catch (error: any) {
    console.error("Add chapter error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

