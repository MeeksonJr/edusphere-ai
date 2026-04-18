import { generateElevenLabsTTS, getElevenLabsVoices } from "./elevenlabs"
import { generateEdgeTTS, getEdgeTTSVoices, EDGE_TTS_POPULAR_VOICES } from "./edge-tts"
import { generateGoogleTTS } from "./google-tts"
import { generateHuggingFaceTTS } from "./huggingface-tts"
import mp3Duration from "mp3-duration"

export type TTSProvider = "google-tts" | "huggingface" | "edge-tts" | "elevenlabs" | "google-cloud"

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
  format: "mp3" | "wav" | "flac"
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

  const tryGoogleTTS = async (): Promise<TTSResult> => {
    const res = await generateGoogleTTS({ text, lang: "en", slow: false })
    const duration = await mp3Duration(res.buffer)
    return { buffer: res.buffer, duration, format: res.format, provider: "google-tts" as TTSProvider }
  }

  const tryHuggingFace = async (): Promise<TTSResult> => {
    const res = await generateHuggingFaceTTS({ text })
    const duration = await mp3Duration(res.buffer)
    return { buffer: res.buffer, duration, format: res.format, provider: "huggingface" as TTSProvider }
  }

  const tryElevenLabs = async (): Promise<TTSResult> => {
    // Edge-TTS voices (e.g., 'en-US-AriaNeural') are invalid for ElevenLabs.
    const isEdgeVoice = voice && (voice.includes("-") || voice.includes("Neural"));
    const result = await generateElevenLabsTTS({
      text,
      voiceId: isEdgeVoice ? undefined : voice,
    })
    const duration = await mp3Duration(result.buffer)
    return {
      buffer: result.buffer,
      duration,
      format: "mp3" as const,
      provider: "elevenlabs" as TTSProvider,
    }
  }

  const tryEdgeTTS = async (): Promise<TTSResult> => {
    let lastError: any
    // Attempt Edge-TTS up to 3 times for resilience (Vercel networks can hiccup on Websockets)
    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        const result = await generateEdgeTTS({
          text,
          voice: voice || "en-US-AriaNeural",
          rate: options.rate || "+0%",
          pitch: options.pitch || "+0Hz",
        })
        const duration = await mp3Duration(result.buffer)
        return {
          buffer: result.buffer,
          duration,
          format: "mp3" as const,
          provider: "edge-tts" as TTSProvider,
        }
      } catch (err) {
        lastError = err
        await new Promise(r => setTimeout(r, 1000)) // wait 1s before retry
      }
    }
    throw lastError
  }

  // Set the specific order: 
  // 1. google-tts
  // 2. huggingface
  // 3. edge-tts
  // 4. elevenlabs

  // Build provider order: if a specific provider is requested, try it first
  // then add remaining providers as fallbacks for resilience.
  if (provider === "edge-tts") {
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    providers.push({ name: "google-tts", fn: tryGoogleTTS })
    if (process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY) providers.push({ name: "huggingface", fn: tryHuggingFace })
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
  } else if (provider === "google-tts") {
    providers.push({ name: "google-tts", fn: tryGoogleTTS })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    if (process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY) providers.push({ name: "huggingface", fn: tryHuggingFace })
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
  } else if (provider === "huggingface") {
    providers.push({ name: "huggingface", fn: tryHuggingFace })
    providers.push({ name: "google-tts", fn: tryGoogleTTS })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
  } else if (provider === "elevenlabs") {
    providers.push({ name: "elevenlabs", fn: tryElevenLabs })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    providers.push({ name: "google-tts", fn: tryGoogleTTS })
  } else {
    // Default fallback waterfall
    providers.push({ name: "google-tts", fn: tryGoogleTTS })
    if (process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY) providers.push({ name: "huggingface", fn: tryHuggingFace })
    providers.push({ name: "edge-tts", fn: tryEdgeTTS })
    if (process.env.ELEVENLABS_API_KEY) providers.push({ name: "elevenlabs", fn: tryElevenLabs })
  }

  // Try each provider in order
  for (const p of providers) {
    try {
      console.log(`[generate-audio] Attempting ${p.name}...`)
      return await p.fn()
    } catch (error: any) {
      const msg = `${p.name} failed: ${error?.message || error}`
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
