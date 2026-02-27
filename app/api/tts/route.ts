import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateTTS, getAvailableVoices, type TTSProvider } from "@/lib/tts-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/tts — Generate TTS audio
 * Body: { text, voice?, provider? }
 * Returns: audio/mpeg stream
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user's subscription tier
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        const tier = profile?.subscription_tier || "free"

        const body = await req.json()
        const { text, voice, provider } = body

        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { error: "Text is required" },
                { status: 400 }
            )
        }

        // Enforce text length limits
        const maxChars = tier === "free" ? 500 : 5000
        if (text.length > maxChars) {
            return NextResponse.json(
                { error: `Text exceeds ${maxChars} character limit for your plan` },
                { status: 400 }
            )
        }

        // Enforce provider access by tier
        let resolvedProvider: TTSProvider | undefined = provider
        if (provider === "elevenlabs" && !["pro", "family", "school", "ultimate"].includes(tier)) {
            return NextResponse.json(
                { error: "ElevenLabs voices require a Pro plan or higher" },
                { status: 403 }
            )
        }

        const result = await generateTTS({
            text,
            voice,
            provider: resolvedProvider,
        })

        // Return audio as streaming response
        return new Response(new Uint8Array(result.buffer), {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": result.buffer.length.toString(),
                "X-TTS-Provider": result.provider,
                "X-TTS-Duration": result.duration.toFixed(2),
            },
        })
    } catch (error: any) {
        console.error("TTS API error:", error)
        return NextResponse.json(
            { error: error.message || "TTS generation failed" },
            { status: 500 }
        )
    }
}

/**
 * GET /api/tts — List available voices for the user's tier
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        const tier = profile?.subscription_tier || "free"
        const voices = await getAvailableVoices(tier)

        return NextResponse.json({ voices, tier })
    } catch (error: any) {
        console.error("TTS voices error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to fetch voices" },
            { status: 500 }
        )
    }
}
