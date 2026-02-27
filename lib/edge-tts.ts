/**
 * Edge-TTS Wrapper
 * Free Microsoft Edge TTS for non-premium users
 * Uses the edge-tts npm package (no API key needed)
 */

import { tts, getVoices, type Voice } from "edge-tts"

export interface EdgeTTSVoice {
    name: string
    shortName: string
    gender: string
    locale: string
}

export interface EdgeTTSOptions {
    text: string
    voice?: string
    rate?: string   // e.g. "+10%", "-20%"
    pitch?: string  // e.g. "+5Hz", "-5Hz"
    volume?: string // e.g. "+10%", "-10%"
}

export interface EdgeTTSResult {
    buffer: Buffer
    format: "mp3"
}

// Default: neutral English voice
const DEFAULT_VOICE = "en-US-AriaNeural"

/**
 * Popular free Edge-TTS voices for quick selection
 */
export const EDGE_TTS_POPULAR_VOICES: EdgeTTSVoice[] = [
    { name: "Aria (US Female)", shortName: "en-US-AriaNeural", gender: "Female", locale: "en-US" },
    { name: "Guy (US Male)", shortName: "en-US-GuyNeural", gender: "Male", locale: "en-US" },
    { name: "Jenny (US Female)", shortName: "en-US-JennyNeural", gender: "Female", locale: "en-US" },
    { name: "Tony (US Male)", shortName: "en-US-TonyNeural", gender: "Male", locale: "en-US" },
    { name: "Sonia (UK Female)", shortName: "en-GB-SoniaNeural", gender: "Female", locale: "en-GB" },
    { name: "Ryan (UK Male)", shortName: "en-GB-RyanNeural", gender: "Male", locale: "en-GB" },
    { name: "Natasha (AU Female)", shortName: "en-AU-NatashaNeural", gender: "Female", locale: "en-AU" },
    { name: "William (AU Male)", shortName: "en-AU-WilliamNeural", gender: "Male", locale: "en-AU" },
]

/**
 * Generate TTS audio using Edge-TTS (free, no API key)
 */
export async function generateEdgeTTS(options: EdgeTTSOptions): Promise<EdgeTTSResult> {
    const {
        text,
        voice = DEFAULT_VOICE,
        rate = "+0%",
        pitch = "+0Hz",
        volume = "+0%",
    } = options

    const audioBuffer = await tts(text, {
        voice,
        rate,
        pitch,
        volume,
    })

    return {
        buffer: Buffer.from(audioBuffer),
        format: "mp3",
    }
}

/**
 * List all available Edge-TTS voices for a locale
 */
export async function getEdgeTTSVoices(locale?: string): Promise<EdgeTTSVoice[]> {
    try {
        const voices = await getVoices()
        const filtered = locale
            ? voices.filter((v: Voice) => v.Locale?.startsWith(locale))
            : voices

        return filtered.map((v: Voice) => ({
            name: v.FriendlyName || v.ShortName,
            shortName: v.ShortName,
            gender: v.Gender || "Unknown",
            locale: v.Locale || "",
        }))
    } catch (error) {
        console.error("Failed to get Edge-TTS voices:", error)
        return EDGE_TTS_POPULAR_VOICES
    }
}
