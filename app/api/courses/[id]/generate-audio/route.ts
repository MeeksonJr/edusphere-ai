import { NextRequest, NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { generateTTS } from "@/lib/tts-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60 // Vercel hobby plan max

// Get a supabase client — tries service role first (bypasses RLS), falls back to anon
function getSupabaseAdmin() {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    // The sb_secret_ key can act as service role in some setups
    process.env.SUPABASE_SECRET_KEY
  if (!serviceRoleKey) {
    throw new Error("No Supabase admin key configured (SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = params.id
  const supabase = getSupabaseAdmin()

  console.log(`[generate-audio] Starting for course ${courseId}`)

  try {
    // 1. Mark course audio as processing
    await supabase
      .from("courses")
      .update({ audio_status: "processing" })
      .eq("id", courseId)

    // 2. Load all slides for this course
    const { data: slides, error: slidesError } = await supabase
      .from("course_slides")
      .select("id, slide_id, slide_type, content, order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true })

    if (slidesError) {
      throw new Error(`Failed to load slides: ${slidesError.message}`)
    }

    if (!slides || slides.length === 0) {
      console.warn(`[generate-audio] No slides found for course ${courseId}`)
      await supabase
        .from("courses")
        .update({ audio_status: "failed" })
        .eq("id", courseId)
      return NextResponse.json({ error: "No slides found" }, { status: 404 })
    }

    // 3. Load course layout to get narration scripts (stored in layout JSON)
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("layout")
      .eq("id", courseId)
      .single()

    if (courseError || !course?.layout) {
      throw new Error("Failed to load course layout")
    }

    // Build a map of slideId → narrationScript from the layout JSON
    const layout = course.layout as any
    const narrationMap: Record<string, string> = {}
    for (const chapter of layout.chapters || []) {
      for (const slide of chapter.slides || []) {
        if (slide.narrationScript) {
          narrationMap[slide.slideId] = slide.narrationScript
        }
      }
    }

    console.log(`[generate-audio] Processing ${slides.length} slides, narration map has ${Object.keys(narrationMap).length} entries`)

    let successCount = 0
    let failCount = 0

    // 4. Generate TTS for each slide
    for (const slide of slides) {
      // Skip title/transition slides — they typically have short or no narration
      if (slide.slide_type === "transition-slide") {
        console.log(`[generate-audio] Skipping transition slide ${slide.slide_id}`)
        continue
      }

      const narration = narrationMap[slide.slide_id]
      if (!narration || narration.trim().length < 10) {
        console.log(`[generate-audio] No narration for slide ${slide.slide_id}, skipping`)
        continue
      }

      try {
        console.log(`[generate-audio] Generating TTS for slide ${slide.slide_id} (${narration.length} chars)`)

        // Generate TTS audio
        const ttsResult = await generateTTS({
          text: narration.slice(0, 3000), // Cap to avoid TTS limits
          voice: "en-US-AriaNeural",      // Edge-TTS native voice name
          provider: "edge-tts",           // Use Edge-TTS directly (free, no API key)
        })

        if (!ttsResult.buffer || ttsResult.buffer.length === 0) {
          throw new Error("TTS returned empty buffer")
        }

        // Upload to Supabase Storage
        const storagePath = `courses/${courseId}/${slide.slide_id}.mp3`
        const { error: uploadError } = await supabase.storage
          .from("course-media")
          .upload(storagePath, ttsResult.buffer, {
            contentType: "audio/mpeg",
            upsert: true,
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("course-media")
          .getPublicUrl(storagePath)

        const audioUrl = urlData.publicUrl

        // Update slide record with audio URL and duration
        const { error: updateError } = await supabase
          .from("course_slides")
          .update({
            audio_url: audioUrl,
            audio_duration: Math.round(ttsResult.duration),
            updated_at: new Date().toISOString(),
          })
          .eq("id", slide.id)

        if (updateError) {
          throw new Error(`Slide update failed: ${updateError.message}`)
        }

        console.log(`[generate-audio] ✅ Slide ${slide.slide_id} audio saved: ${audioUrl}`)
        successCount++
      } catch (slideError: any) {
        console.error(`[generate-audio] ❌ Slide ${slide.slide_id} failed:`, slideError.message)
        failCount++
        // Continue with other slides — don't abort the whole batch
      }
    }

    // 5. Mark audio generation complete
    const finalStatus = successCount > 0 ? "completed" : "failed"
    await supabase
      .from("courses")
      .update({ audio_status: finalStatus })
      .eq("id", courseId)

    console.log(`[generate-audio] Done for course ${courseId}: ${successCount} success, ${failCount} failed → status: ${finalStatus}`)

    return NextResponse.json({
      success: true,
      courseId,
      slidesProcessed: successCount,
      slidesFailed: failCount,
      audioStatus: finalStatus,
    })
  } catch (error: any) {
    console.error(`[generate-audio] Fatal error for course ${courseId}:`, error.message)

    // Mark as failed
    try {
      await supabase
        .from("courses")
        .update({ audio_status: "failed" })
        .eq("id", courseId)
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
