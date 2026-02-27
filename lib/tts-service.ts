/**
 * Text-to-Speech Service
 * Unified TTS interface with provider priority:
 *   1. ElevenLabs (Pro+ tiers) — premium voices
 *   2. Edge-TTS (all tiers) — free Microsoft voices, no API key
 *   3. Google Cloud TTS — legacy fallback (if credentials exist)
 */

import { generateElevenLabsTTS, getElevenLabsVoices } from "./elevenlabs"
import { generateEdgeTTS, getEdgeTTSVoices, EDGE_TTS_POPULAR_VOICES } from "./edge-tts"

export type TTSProvider = "elevenlabs" | "edge-tts" | "google-cloud"

export interface TTSOptions {
  text: string
  voice?: string
  provider?: TTSProvider
  rate?: string
  pitch?: string
}

export interface TTSResult {
  buffer: Buffer
  duration: number // estimated seconds
  format: "mp3" | "wav"
  provider: TTSProvider
}

export interface TTSVoiceInfo {
  id: string
  name: string
  provider: TTSProvider
  gender: string
  locale: string
  previewUrl?: string
  isPremium: boolean
}

/**
 * Generate TTS audio with automatic provider selection
 */
export async function generateTTS(options: TTSOptions): Promise<TTSResult> {
  const { text, voice, provider } = options

  // Estimate duration (avg 150 wpm)
  const wordCount = text.split(/\s+/).length
  const estimatedDuration = (wordCount / 150) * 60

  // 1. If ElevenLabs explicitly requested or available
  if (provider === "elevenlabs" || (!provider && process.env.ELEVENLABS_API_KEY)) {
    try {
      const result = await generateElevenLabsTTS({
        text,
        voiceId: voice, // ElevenLabs uses voice IDs
      })
      return {
        buffer: result.buffer,
        duration: estimatedDuration,
        format: "mp3",
        provider: "elevenlabs",
      }
    } catch (error) {
      console.warn("ElevenLabs TTS failed, falling back to Edge-TTS:", error)
    }
  }

  // 2. Edge-TTS (free, always available)
  if (provider === "edge-tts" || !provider) {
    try {
      const result = await generateEdgeTTS({
        text,
        voice: voice || "en-US-AriaNeural",
        rate: options.rate || "+0%",
        pitch: options.pitch || "+0Hz",
      })
      return {
        buffer: result.buffer,
        duration: estimatedDuration,
        format: "mp3",
        provider: "edge-tts",
      }
    } catch (error) {
      console.warn("Edge-TTS failed:", error)
    }
  }

  // 3. Google Cloud TTS (legacy fallback)
  if (process.env.GOOGLE_CLOUD_TTS_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await generateTTSGoogleCloud(text, voice, estimatedDuration)
    } catch (error) {
      console.warn("Google Cloud TTS failed:", error)
    }
  }

  throw new Error("All TTS providers failed. Check your configuration.")
}

/**
 * Get all available voices across providers
 */
export async function getAvailableVoices(tier: string = "free"): Promise<TTSVoiceInfo[]> {
  const voices: TTSVoiceInfo[] = []

  // ElevenLabs voices (Pro+ only)
  if (["pro", "family", "school", "ultimate"].includes(tier)) {
    try {
      const elVoices = await getElevenLabsVoices()
      voices.push(
        ...elVoices.map((v) => ({
          id: v.voice_id,
          name: v.name,
          provider: "elevenlabs" as TTSProvider,
          gender: v.labels?.gender || "Unknown",
          locale: v.labels?.accent || "en",
          previewUrl: v.preview_url,
          isPremium: true,
        }))
      )
    } catch {
      // Skip if ElevenLabs unavailable
    }
  }

  // Edge-TTS voices (always available)
  try {
    const edgeVoices = await getEdgeTTSVoices("en")
    voices.push(
      ...edgeVoices.map((v) => ({
        id: v.shortName,
        name: v.name,
        provider: "edge-tts" as TTSProvider,
        gender: v.gender,
        locale: v.locale,
        isPremium: false,
      }))
    )
  } catch {
    // Fallback to popular voices
    voices.push(
      ...EDGE_TTS_POPULAR_VOICES.map((v) => ({
        id: v.shortName,
        name: v.name,
        provider: "edge-tts" as TTSProvider,
        gender: v.gender,
        locale: v.locale,
        isPremium: false,
      }))
    )
  }

  return voices
}

/**
 * Legacy Google Cloud TTS fallback
 */
async function generateTTSGoogleCloud(
  text: string,
  voice: string | undefined,
  estimatedDuration: number
): Promise<TTSResult> {
  const { TextToSpeechClient } = await import("@google-cloud/text-to-speech")
  const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    credentials: process.env.GOOGLE_CLOUD_TTS_KEY
      ? JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY)
      : undefined,
  })

  const request = {
    input: { text },
    voice: {
      languageCode: "en-US",
      name: voice || "en-US-Neural2-D",
      ssmlGender: "NEUTRAL" as const,
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: 1.0,
      pitch: 0.0,
    },
  }

  const [response] = await client.synthesizeSpeech(request)
  if (!response.audioContent) {
    throw new Error("No audio content from Google Cloud TTS")
  }

  return {
    buffer: Buffer.from(response.audioContent),
    duration: estimatedDuration,
    format: "mp3",
    provider: "google-cloud",
  }
}
