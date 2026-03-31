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
        const { topic, speakers = [], duration = "short", backgroundMusic = "none", speakingRate = "1.0" } = body

        if (!topic || typeof topic !== "string" || !topic.trim()) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 })
        }
        
        if (speakers.length === 0) {
            speakers.push({ name: "Host", voiceId: "", provider: "edge-tts" })
        }

        // Step 1.5: Generate cover image
        const { generatePodcastImageUrl } = await import("@/lib/pollinations")
        const coverImageUrl = generatePodcastImageUrl(topic)

        // Create podcast record in "generating" state
        const { data: podcast, error: insertError } = await (supabase as any)
            .from("podcasts")
            .insert({
                user_id: user.id,
                title: topic.substring(0, 200),
                topic,
                status: "generating",
                voice_id: speakers[0].voiceId || null,
                voice_provider: speakers[0].provider || "edge-tts",
                background_music: backgroundMusic,
                speaking_rate: speakingRate,
                cover_image_url: coverImageUrl
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

        // Generate script with AI (await to prevent Vercel terminating the process)
        await generatePodcastAsync(
            podcast.id,
            user.id,
            topic,
            duration,
            speakers,
            speakingRate,
            req.headers.get("Cookie") || ""
        )

        return NextResponse.json({
            success: true,
            podcastId: podcast.id,
            status: "completed",
            message: "Podcast generated successfully.",
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
    speakers: any[],
    speakingRate: string,
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
            
        const speakersText = speakers.map((s: any, i: number) => `${s.name} (Speaker ${i+1})`).join(", ")

        // Step 1: Generate podcast script via AI
        const scriptResult = await generateAIResponse({
            provider: "gemini",
            prompt: `Create a ${duration} educational podcast script about: "${topic}"

Requirements:
- Write an engaging, conversational podcast script featuring the following speakers: ${speakersText}
- Include an introduction, ${segmentCount} main content segments, and a conclusion
- Each segment should be 2-4 short paragraphs of dialogue between the speakers
- The dialogue should flow naturally with interruptions, agreements, and questions
- Format the script STRICTLY as a JSON array of dialogue objects. Do NOT use markdown code blocks.

REQUIRED JSON FORMAT:
[
  { "speaker": "Speaker Name", "text": "Welcome to the podcast..." },
  { "speaker": "Another Speaker", "text": "Thanks for having me!" }
]`,
            systemPrompt:
                "You are an expert educational podcast host and producer. Write engaging, clear, and informative podcast scripts. Output STRICTLY in the requested JSON array format.",
            maxTokens: 5000,
            temperature: 0.7,
        })

        const scriptStr = scriptResult?.text || ""
        const jsonMatch = scriptStr.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            throw new Error("AI failed to output valid JSON for the script")
        }
        
        const scriptJson = JSON.parse(jsonMatch[0])
        if (!Array.isArray(scriptJson) || scriptJson.length === 0) {
            throw new Error("AI generated an empty script")
        }

        const scriptText = scriptJson.map((line: any) => `**${line.speaker}**: ${line.text}`).join("\n\n")

        // Update podcast with script
        await supabase
            .from("podcasts")
            .update({ script: scriptText, title: extractTitle(topic, scriptText) })
            .eq("id", podcastId)

        // Step 2: Generate audio from script using TTS
        let audioBuffers: Buffer[] = []
        let totalDuration = 0

        // Convert speaking rate to Edge-TTS format
        let rateStr = "+0%"
        if (speakingRate === "0.75") rateStr = "-25%"
        if (speakingRate === "1.25") rateStr = "+25%"
        if (speakingRate === "1.5") rateStr = "+50%"

        for (const line of scriptJson) {
            const speakerInfo = speakers.find((s: any) => s.name.toLowerCase().includes(line.speaker.toLowerCase()) || line.speaker.toLowerCase().includes(s.name.toLowerCase())) || speakers[0]
            
            const ttsResult = await generateTTS({
                text: line.text.substring(0, 3000), // Safety clip
                voice: speakerInfo.voiceId,
                provider: speakerInfo.provider,
                rate: rateStr
            })
            
            audioBuffers.push(ttsResult.buffer)
            totalDuration += ttsResult.duration
        }
        
        const finalBuffer = Buffer.concat(audioBuffers)

        // Step 3: Upload audio to Supabase Storage
        const audioPath = `podcasts/${userId}/${podcastId}.mp3`
        const { error: uploadError } = await supabase.storage
            .from("course-media") // Reuse existing bucket
            .upload(audioPath, finalBuffer, {
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
                duration: Math.round(totalDuration),
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
