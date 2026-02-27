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

  const errors: string[] = []

  // Build provider order based on request
  type ProviderAttempt = { name: TTSProvider; fn: () => Promise<TTSResult> }
  const providers: ProviderAttempt[] = []

  const tryElevenLabs = (): Promise<TTSResult> =>
    generateElevenLabsTTS({
      text,
      voiceId: voice,
    }).then((result) => ({
      buffer: result.buffer,
      duration: estimatedDuration,
      format: "mp3" as const,
      provider: "elevenlabs" as TTSProvider,
    }))

  const tryEdgeTTS = (): Promise<TTSResult> =>
    generateEdgeTTS({
      text,
      voice: voice || "en-US-AriaNeural",
      rate: options.rate || "+0%",
      pitch: options.pitch || "+0Hz",
    }).then((result) => ({
      buffer: result.buffer,
      duration: estimatedDuration,
      format: "mp3" as const,
      provider: "edge-tts" as TTSProvider,
    }))

  // Determine provider priority
  if (provider === "elevenlabs") {
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
  } else if (provider === "edge-tts") {
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
  } else {
    // No provider specified — try ElevenLabs first if key available, then edge-tts
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
  }

  // Try each provider in order
  for (const p of providers) {
    try {
      return await p.fn()
    } catch (error: any) {
      const msg = `${p.name} failed: ${error?.message || error}`
      console.warn(msg)
      errors.push(msg)
    }
  }

  // Google Cloud TTS (legacy fallback — last resort)
  if (process.env.GOOGLE_CLOUD_TTS_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await generateTTSGoogleCloud(text, voice, estimatedDuration)
    } catch (error: any) {
      const msg = `Google Cloud TTS failed: ${error?.message || error}`
      console.warn(msg)
      errors.push(msg)
    }
  }

  const details = errors.length > 0 ? " Details: " + errors.join(" | ") : ""
  throw new Error(`All TTS providers failed.${details}`)
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
