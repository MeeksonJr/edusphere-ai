import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"
import { generateTTS, type TTSProvider } from "@/lib/tts-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check subscription tier for podcast access
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        const tier = profile?.subscription_tier || "free"
        if (tier === "free") {
            return NextResponse.json(
                { error: "Podcast generation requires a Student plan or higher" },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { topic, voiceId, voiceProvider, duration = "short" } = body

        if (!topic || typeof topic !== "string" || !topic.trim()) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 })
        }

        // Create podcast record in "generating" state
        const { data: podcast, error: insertError } = await (supabase as any)
            .from("podcasts")
            .insert({
                user_id: user.id,
                title: topic.substring(0, 200),
                topic,
                status: "generating",
                voice_id: voiceId || null,
                voice_provider: voiceProvider || "edge-tts",
            })
            .select()
            .single()

        if (insertError) {
            console.error("Failed to create podcast record:", insertError)
            return NextResponse.json(
                { error: "Failed to create podcast" },
                { status: 500 }
            )
        }

        // Generate script with AI (async — don't block the response)
        generatePodcastAsync(
            podcast.id,
            user.id,
            topic,
            duration,
            voiceId,
            voiceProvider as TTSProvider | undefined,
            req.headers.get("Cookie") || ""
        ).catch((err) => {
            console.error("Podcast generation failed:", err)
        })

        return NextResponse.json({
            success: true,
            podcastId: podcast.id,
            status: "generating",
            message: "Podcast generation started. Check back shortly.",
        })
    } catch (error: any) {
        console.error("Podcast API error:", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

/* ──────── Background generation ──────── */

async function generatePodcastAsync(
    podcastId: string,
    userId: string,
    topic: string,
    duration: "short" | "medium" | "long",
    voiceId?: string,
    voiceProvider?: TTSProvider,
    cookie?: string
) {
    // Admin client for background updates
    const { createClient: createAdmin } = await import("@supabase/supabase-js")
    const supabase = createAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
        // Determine segment count based on duration
        const segmentCount =
            duration === "short" ? 3 : duration === "medium" ? 6 : 10

        // Step 1: Generate podcast script via AI
        const scriptResult = await generateAIResponse({
            provider: "gemini",
            prompt: `Create a ${duration} educational podcast script about: "${topic}"

Requirements:
- Write an engaging, conversational podcast script as if a single host is teaching the audience
- Include an introduction, ${segmentCount} main content segments, and a conclusion
- Each segment should be 2-4 paragraphs
- Use clear, accessible language appropriate for learners
- Include interesting facts, examples, and analogies
- End with a summary of key takeaways

Return ONLY the full script text, no JSON or formatting markers. Use "---" on its own line to separate segments.`,
            systemPrompt:
                "You are an expert educational podcast host. Write engaging, clear, and informative podcast scripts that make complex topics accessible and interesting to a broad audience.",
            maxTokens: 4000,
            temperature: 0.7,
        })

        const script = scriptResult?.text || ""
        if (!script || script.length < 100) {
            throw new Error("AI failed to generate a sufficient podcast script")
        }

        // Update podcast with script
        await supabase
            .from("podcasts")
            .update({ script, title: extractTitle(topic, script) })
            .eq("id", podcastId)

        // Step 2: Generate audio from script using TTS
        const ttsResult = await generateTTS({
            text: script.replace(/---/g, " ").substring(0, 5000), // Remove segment markers, respect char limit
            voice: voiceId,
            provider: voiceProvider,
        })

        // Step 3: Upload audio to Supabase Storage
        const audioPath = `podcasts/${userId}/${podcastId}.mp3`
        const { error: uploadError } = await supabase.storage
            .from("course-media") // Reuse existing bucket
            .upload(audioPath, ttsResult.buffer, {
                contentType: "audio/mpeg",
                upsert: true,
            })

        if (uploadError) {
            console.error("Audio upload failed:", uploadError)
            throw new Error("Failed to upload podcast audio")
        }

        // Get public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from("course-media").getPublicUrl(audioPath)

        // Step 4: Mark as completed
        await supabase
            .from("podcasts")
            .update({
                status: "completed",
                audio_url: publicUrl,
                duration: Math.round(ttsResult.duration),
                updated_at: new Date().toISOString(),
            })
            .eq("id", podcastId)

        console.log(`Podcast ${podcastId} generated successfully`)
    } catch (error: any) {
        console.error(`Podcast ${podcastId} generation failed:`, error)
        await supabase
            .from("podcasts")
            .update({
                status: "failed",
                error_message: error.message || "Generation failed",
                updated_at: new Date().toISOString(),
            })
            .eq("id", podcastId)
    }
}

function extractTitle(topic: string, script: string): string {
    // Try to find a title from the first line of the script
    const firstLine = script.split("\n").find((l) => l.trim().length > 0)
    if (firstLine && firstLine.length < 100 && !firstLine.startsWith("---")) {
        return firstLine.replace(/^#+\s*/, "").trim()
    }
    return `Podcast: ${topic.substring(0, 150)}`
}
