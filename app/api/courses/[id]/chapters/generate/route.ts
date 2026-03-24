import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { processCourse } from "@/lib/course-processing"

export const maxDuration = 60 // Allow maximum duration for generation

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the course
    const { data: course, error: courseError } = await (supabase as any)
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const body = await request.json()
    const { count = 1, context = "" } = body

    let validCount = parseInt(count, 10) || 1
    if (validCount < 1) validCount = 1
    if (validCount > 3) validCount = 3 // Limit to max 3 chapters per request to avoid timeout

    const currentLayout = course.layout as any || { chapters: [] }
    const existingChapters = currentLayout.chapters || []
    
    // Provide existing chapters context to AI
    const previousChaptersSummary = existingChapters.map((ch: any) => 
        `- Chapter ${ch.order || 0}: ${ch.title} (${ch.slides?.length || 0} topics)`
    ).join("\n")

    // Determine the next chapter order
    const startingOrder = existingChapters.length + 1

    let newChapters: any[] = []

    try {
      const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/api/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: `You are an expert course content creator. Generate ${validCount} NEW chapters for the course "${course.title}".

Existing Chapters so far:
${previousChaptersSummary || "None (this is the start of the course)"}

User Additional Instructions:
${context || "None"}

CRITICAL REQUIREMENTS:
1. Output exactly ${validCount} new chapter(s). Do NOT repeat existing chapters.
2. The next chapter should logically continue where the last one left off.
3. Each chapter should have 2-4 topics (slides).
4. Each slide must have SUBSTANTIAL, DETAILED content (150-300 words).
5. Slide content should flow logically.

Return a JSON array of chapter objects with this structure (no markdown fences, just pure JSON array):
[
  {
    "chapterId": "generate-uuid-here",
    "title": "New Chapter Title (e.g. Advanced Concepts)",
    "order": ${startingOrder},
    "slides": [
      {
        "slideId": "generate-uuid-here",
        "type": "content-slide",
        "content": {
          "title": "Topic Title",
          "body": "Detailed paragraph content...",
          "visualElements": []
        },
        "narrationScript": "Full narration script for this slide",
        "estimatedDuration": 30
      }
    ]
  }
]
`,
          systemPrompt: "You are an expert course AI. Generate structured JSON arrays of chapters containing real educational content. Output strictly JSON.",
          maxTokens: 5000,
        }),
      })

      const result = await aiResponse.json()
      if (!aiResponse.ok || !result.success) {
        throw new Error(result.error || "AI generation failed")
      }

      const jsonStr = result.data?.text?.match(/\[[\s\S]*\]/)?.[0] || "[]"
      newChapters = JSON.parse(jsonStr)

      // Validate chapters
      newChapters = newChapters.map((ch: any, i: number) => ({
        ...ch,
        chapterId: ch.chapterId || `chapter-${Date.now()}-${i}`,
        order: startingOrder + i,
        slides: ch.slides?.map((slide: Record<string, any>, j: number) => ({
            ...slide,
            slideId: slide.slideId || `slide-${Date.now()}-${i}-${j}`,
        })) || []
      }))

    } catch (aiError: any) {
      console.error("AI generation failed for chapters continuation:", aiError)
      return NextResponse.json({ error: aiError.message }, { status: 500 })
    }

    if (newChapters.length === 0) {
        return NextResponse.json({ error: "Failed to parse generated chapters" }, { status: 500 })
    }

    // Add the new chapter to the layout
    const updatedLayout = {
      ...currentLayout,
      chapters: [...existingChapters, ...newChapters],
    }

    // Calculate new total duration
    const totalDuration = updatedLayout.chapters.reduce((total: number, chapter: any) => {
      return total + (chapter.slides?.reduce((chapTotal: number, slide: any) => chapTotal + (slide.estimatedDuration || 30), 0) || 0)
    }, 0)

    // Update the course
    const { error: updateError } = await (supabase as any)
      .from("courses")
      .update({
        layout: updatedLayout,
        estimated_duration: totalDuration,
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating course:", updateError)
      return NextResponse.json({ error: "Failed to persist new chapters" }, { status: 500 })
    }

    // Trigger async background processing for slides and audio using fire-and-forget fallback or promise
    processCourse({ courseId: params.id, userId: user.id }).catch(err => console.error("Course processing error:", err))

    return NextResponse.json({
      success: true,
      message: `${newChapters.length} chapters added successfully. Audio generation has started.`,
      chapters: newChapters,
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
