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
    const { title, topicCount } = body

    if (!title) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 }
      )
    }

    // Validate and limit topic count (1-5)
    let validTopicCount = parseInt(topicCount, 10) || 3
    if (validTopicCount < 1) validTopicCount = 1
    if (validTopicCount > 5) validTopicCount = 5

    const currentLayout = course.layout as any || { chapters: [] }
    const existingChapters = currentLayout.chapters || []
    const newChapterOrder = existingChapters.length + 1

    // Generate chapter content using AI via API route (with fallback)
    let response: any
    try {
      const aiResponse = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: `You are an expert course content creator. Generate a comprehensive, detailed chapter for a course about "${course.title}".

Chapter Title: ${title}
Number of Topics: ${validTopicCount}

CRITICAL REQUIREMENTS:
1. Create ${validTopicCount} distinct, well-developed topics that are directly related to "${title}"
2. Each topic must have SUBSTANTIAL, DETAILED content - not placeholders or generic statements
3. Each slide should contain 3-5 paragraphs of actual educational content with specific examples, explanations, and context
4. Content must be informative, educational, and provide real value - like a professional course
5. Slides should flow logically from one topic to the next, building upon previous concepts
6. Use specific examples, case studies, or real-world applications where relevant
7. Each slide's body content should be at least 200-300 words of actual educational material
8. Narration scripts should be natural, engaging, and match the slide content

For each topic, create:
- A title slide introducing the topic (with meaningful content, not just "Topic X: Introduction")
- 2-3 content slides with detailed explanations, examples, and context
- Smooth transitions between topics

Return a JSON object with this structure:
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
          systemPrompt: "You are an expert educational content creator. Your chapters must contain REAL, DETAILED educational content - never use placeholders like 'This is topic 1 of 5' or 'Here are the key details for topic X'. Every slide must have substantial, informative content that teaches the user. Return valid JSON only.",
          maxTokens: 4000,
        }),
      })

      const result = await aiResponse.json()
      if (!aiResponse.ok || !result.success) {
        throw new Error(result.error || "AI generation failed")
      }

      response = { text: result.data?.text || "" }
    } catch (aiError: any) {
      console.error("AI generation error, using fallback:", aiError)
      // Fallback: Create basic chapter structure with requested number of topics
      const fallbackSlides: any[] = [
        {
          slideId: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: "title-slide",
          content: {
            title: title,
            body: `This chapter covers ${validTopicCount} main topics.`,
            visualElements: [],
          },
          narrationScript: `Welcome to ${title}. This chapter will cover ${validTopicCount} important topics.`,
          estimatedDuration: 30,
        },
      ]

      // Add slides for each topic
      for (let i = 1; i <= validTopicCount; i++) {
        fallbackSlides.push(
          {
            slideId: `slide-${Date.now()}-${i}-1-${Math.random().toString(36).substring(2, 9)}`,
            type: "content-slide",
            content: {
              title: `Topic ${i}: Introduction`,
              body: `This is topic ${i} of ${validTopicCount} in this chapter.`,
              visualElements: [],
            },
            narrationScript: `Let's begin with topic ${i}.`,
            estimatedDuration: 30,
          },
          {
            slideId: `slide-${Date.now()}-${i}-2-${Math.random().toString(36).substring(2, 9)}`,
            type: "content-slide",
            content: {
              title: `Topic ${i}: Details`,
              body: `Here are the key details for topic ${i}.`,
              visualElements: [],
            },
            narrationScript: `Now let's explore the details of topic ${i}.`,
            estimatedDuration: 30,
          }
        )
      }

      response = {
        text: JSON.stringify({
          chapterId: `chapter-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: title,
          order: newChapterOrder,
          slides: fallbackSlides,
        }),
      }
    }

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

