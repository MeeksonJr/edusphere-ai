/**
 * Course Processing Service
 * Handles background processing of course generation including:
 * - Slide template generation
 * - Audio narration generation
 * - Caption generation and synchronization
 */

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export interface CourseProcessingOptions {
  courseId: string
  userId: string
}

export interface ProcessingProgress {
  stage: "slides" | "audio" | "captions" | "complete"
  progress: number // 0-100
  message: string
}

/**
 * Process course after layout generation
 * This function handles the async processing of slides, audio, and captions
 */
export async function processCourse(options: CourseProcessingOptions): Promise<void> {
  const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

  try {
    // Update course status to processing
    await supabase
      .from("courses")
      .update({ status: "processing" })
      .eq("id", options.courseId)

    // Get course data
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", options.courseId)
      .single()

    if (courseError || !course) {
      throw new Error("Course not found")
    }

    const layout = course.layout as any

    if (!layout || !layout.chapters) {
      throw new Error("Invalid course layout")
    }

    // Stage 1: Generate slide templates
    await processSlides(options.courseId, layout, supabase)

    // Stage 2: Generate audio narrations
    await processAudio(options.courseId, layout, supabase)

    // Stage 3: Generate captions
    await processCaptions(options.courseId, layout, supabase)

    // Mark course as completed
    await supabase
      .from("courses")
      .update({ status: "completed" })
      .eq("id", options.courseId)
  } catch (error: any) {
    console.error("Course processing error:", error)
    // Mark course as failed
    await supabase
      .from("courses")
      .update({
        status: "failed",
      })
      .eq("id", options.courseId)
    throw error
  }
}

/**
 * Process and generate slide templates
 */
async function processSlides(
  courseId: string,
  layout: any,
  supabase: any
): Promise<void> {
  console.log(`Processing slides for course ${courseId}`)

  for (const chapter of layout.chapters || []) {
    for (const slide of chapter.slides || []) {
      // Generate slide template data
      const templateData = {
        type: slide.type,
        content: slide.content,
        style: layout.style || "professional",
        animations: generateSlideAnimations(slide.type),
      }

      // Save slide to database
      await supabase.from("course_slides").insert({
        course_id: courseId,
        chapter_id: chapter.chapterId,
        slide_id: slide.slideId,
        slide_type: slide.type,
        content: slide.content,
        template_data: templateData,
        order_index: slide.order || 0,
      })
    }
  }
}

/**
 * Process and generate audio narrations
 */
async function processAudio(
  courseId: string,
  layout: any,
  supabase: any
): Promise<void> {
  console.log(`Processing audio for course ${courseId}`)

  // Import TTS service dynamically
  const { generateTTS } = await import("./tts-service")

  for (const chapter of layout.chapters || []) {
    for (const slide of chapter.slides || []) {
      if (!slide.narrationScript) continue

      try {
        // Generate audio using TTS service
        const audioData = await generateTTS({
          text: slide.narrationScript,
          voice: "en-US-Neural2-D",
          languageCode: "en-US",
        })

        // Upload to Supabase Storage
        const audioPath = `courses/${courseId}/chapters/${chapter.chapterId}/narration_${slide.slideId}.mp3`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("course-media")
          .upload(audioPath, audioData.buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          })

        if (uploadError) {
          console.error(`Failed to upload audio for slide ${slide.slideId}:`, uploadError)
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("course-media").getPublicUrl(audioPath)

        // Update slide with audio URL and duration
        await supabase
          .from("course_slides")
          .update({
            audio_url: publicUrl,
            audio_duration: audioData.duration,
          })
          .eq("course_id", courseId)
          .eq("slide_id", slide.slideId)
      } catch (error) {
        console.error(`Failed to generate audio for slide ${slide.slideId}:`, error)
        // Continue with other slides even if one fails
      }
    }
  }
}

/**
 * Process and generate captions
 */
async function processCaptions(
  courseId: string,
  layout: any,
  supabase: any
): Promise<void> {
  console.log(`Processing captions for course ${courseId}`)

  // Import caption service dynamically
  const { generateCaptions } = await import("./caption-service")

  for (const chapter of layout.chapters || []) {
    const chapterAudioFiles: Array<{ slideId: string; audioUrl: string }> = []

    // Collect all audio files for this chapter
    for (const slide of chapter.slides || []) {
      const { data: slideData } = await supabase
        .from("course_slides")
        .select("audio_url")
        .eq("course_id", courseId)
        .eq("slide_id", slide.slideId)
        .single()

      if (slideData?.audio_url) {
        chapterAudioFiles.push({
          slideId: slide.slideId,
          audioUrl: slideData.audio_url,
        })
      }
    }

    // Generate captions for each audio file
    for (const audioFile of chapterAudioFiles) {
      try {
        const captions = await generateCaptions(audioFile.audioUrl)

        // Update slide with caption data
        await supabase
          .from("course_slides")
          .update({
            caption_data: captions,
          })
          .eq("course_id", courseId)
          .eq("slide_id", audioFile.slideId)
      } catch (error) {
        console.error(`Failed to generate captions for slide ${audioFile.slideId}:`, error)
        // Continue with other slides even if one fails
      }
    }
  }
}

/**
 * Generate slide animations based on slide type
 */
function generateSlideAnimations(slideType: string): any {
  const animations: Record<string, any> = {
    "title-slide": {
      entrance: "fadeIn",
      exit: "fadeOut",
      duration: 30, // frames
    },
    "content-slide": {
      entrance: "slideInRight",
      exit: "slideOutLeft",
      duration: 20,
      textReveal: "wordByWord",
    },
    "transition-slide": {
      entrance: "fadeIn",
      exit: "fadeOut",
      duration: 15,
    },
  }

  return animations[slideType] || animations["content-slide"]
}

