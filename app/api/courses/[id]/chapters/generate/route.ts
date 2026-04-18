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
      // Import AI wrapper dynamically or at top-level
      const { generateAIResponse } = await import("@/lib/ai-service-wrapper")

      const courseStyle = course.style || "professional"
      const courseType = course.type || "full-course"

      const toneGuide: Record<string, string> = {
        professional: "Use a confident, polished, corporate tone. Be direct and authoritative while remaining approachable.",
        academic: "Use a scholarly, structured, formal tone. Include precise terminology and logical flow as if lecturing at a university.",
        cinematic: "Use a dramatic, storytelling tone. Build suspense, paint vivid pictures, and make every sentence feel like narration from a documentary.",
        casual: "Use a warm, conversational, friendly tone. Speak as if chatting with a friend over coffee. Use contractions and everyday language.",
      }
      const toneInstruction = toneGuide[courseStyle] || toneGuide.professional

      const result = await generateAIResponse({
        provider: "gemini",
        prompt: `You are an expert course content creator AND a professional voice-over scriptwriter. Generate ${validCount} NEW chapters for the course "${course.title}".

Existing Chapters so far:
${previousChaptersSummary || "None (this is the start of the course)"}

User Additional Instructions:
${context || "None"}

Course Style: ${courseStyle}
Course Type: ${courseType}

CRITICAL REQUIREMENTS:
1. Output exactly ${validCount} new chapter(s). Do NOT repeat existing chapters.
2. The next chapter should logically continue where the last one left off.
3. Each chapter should have 2-4 topics (slides).
4. Each slide must have SUBSTANTIAL, DETAILED content (150-300 words).
5. Slide content should flow logically.

NARRATION SCRIPT RULES (THIS IS CRITICAL):
The "narrationScript" field will be read aloud by a text-to-speech engine and is the primary learning experience.
- Write 80-150 words per slide. Never write less than 60 words.
- Write in flowing, natural paragraphs — NOT bullet points or lists.
- ${toneInstruction}
- Expand well beyond the slide "body" content. Teach, explain, give examples, and add context.
- Avoid reading slide titles or saying "In this slide..." — jump directly into the teaching.
- Use smooth transitions between ideas. The listener should feel like they're in a real lecture.
- Never include markdown, special characters, or formatting in narrationScript — only plain spoken text.

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
        "narrationScript": "Write 80-150 words of flowing, natural speech here. Sound like a real teacher speaking to students.",
        "estimatedDuration": 60
      }
    ]
  }
]
`,
        systemPrompt: "You are an expert course AI and professional scriptwriter. Generate structured JSON arrays of chapters containing real educational content with rich, spoken narration scripts. Output strictly JSON.",
        maxTokens: 5000,
      })

      if (!result || !result.text) {
        throw new Error("AI generation failed or returned empty")
      }

      const jsonStr = result.text.match(/\[[\s\S]*\]/)?.[0] || "[]"
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

    // Trigger async background processing for slides and audio      // Generate audio/images in the background (fire and forget) so we don't block the request and cause Vercel to timeout
      processCourse({ courseId: params.id, userId: user.id }).catch(err => console.error("Background processing error:", err))

      return NextResponse.json({ 
        success: true, 
        message: "Chapters added and audio generation started in background.",
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
