/**
 * ElevenLabs TTS API Wrapper
 * Premium TTS voices for Pro+ tier users
 */

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"

export interface ElevenLabsVoice {
    voice_id: string
    name: string
    category: string
    labels: Record<string, string>
    preview_url: string
}

export interface ElevenLabsTTSOptions {
    text: string
    voiceId?: string
    modelId?: string
    stability?: number
    similarityBoost?: number
    style?: number
    speakerBoost?: boolean
}

export interface ElevenLabsTTSResult {
    buffer: Buffer
    format: "mp3"
}

// Default voice: "Rachel" — a warm, clear female voice
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"

/**
 * Generate TTS audio using ElevenLabs API
 */
export async function generateElevenLabsTTS(
    options: ElevenLabsTTSOptions
): Promise<ElevenLabsTTSResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
        throw new Error("ELEVENLABS_API_KEY is not set")
    }

    const {
        text,
        voiceId = DEFAULT_VOICE_ID,
        modelId = "eleven_turbo_v2_5",
        stability = 0.5,
        similarityBoost = 0.75,
        style = 0.0,
        speakerBoost = true,
    } = options

    const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: modelId,
                voice_settings: {
                    stability,
                    similarity_boost: similarityBoost,
                    style,
                    use_speaker_boost: speakerBoost,
                },
            }),
        }
    )

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(
            `ElevenLabs API error (${response.status}): ${errorBody}`
        )
    }

    const arrayBuffer = await response.arrayBuffer()
    return {
        buffer: Buffer.from(arrayBuffer),
        format: "mp3",
    }
}

/**
 * Get available ElevenLabs voices
 */
export async function getElevenLabsVoices(): Promise<ElevenLabsVoice[]> {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
        return []
    }

    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
            headers: { "xi-api-key": apiKey },
        })

        if (!response.ok) {
            console.error("Failed to fetch ElevenLabs voices:", response.status)
            return []
        }

        const data = await response.json()
        return (data.voices || []).map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            category: v.category || "premade",
            labels: v.labels || {},
            preview_url: v.preview_url || "",
        }))
    } catch (error) {
        console.error("Error fetching ElevenLabs voices:", error)
        return []
    }
}

/**
 * Get remaining ElevenLabs character quota
 */
export async function getElevenLabsQuota(): Promise<{
    characterCount: number
    characterLimit: number
    remaining: number
} | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return null

    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
            headers: { "xi-api-key": apiKey },
        })

        if (!response.ok) return null

        const data = await response.json()
        return {
            characterCount: data.character_count || 0,
            characterLimit: data.character_limit || 0,
            remaining: (data.character_limit || 0) - (data.character_count || 0),
        }
    } catch {
        return null
    }
}
