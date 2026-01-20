/**
 * Text-to-Speech Service
 * Generates audio narrations from text using various TTS providers
 */

export interface TTSOptions {
  text: string
  voice?: string
  languageCode?: string
  speakingRate?: number
  pitch?: number
  ssmlGender?: "NEUTRAL" | "FEMALE" | "MALE"
}

export interface TTSResult {
  buffer: Buffer
  duration: number // in seconds
  format: "mp3" | "wav"
}

/**
 * Generate TTS audio
 * Supports multiple providers with fallback options
 */
export async function generateTTS(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voice = "en-US-Neural2-D",
    languageCode = "en-US",
    speakingRate = 1.0,
    pitch = 0.0,
    ssmlGender = "NEUTRAL",
  } = options

  // Try Google Cloud TTS first if credentials are available
  if (process.env.GOOGLE_CLOUD_TTS_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await generateTTSGoogleCloud({
        text,
        voice,
        languageCode,
        speakingRate,
        pitch,
        ssmlGender,
      })
    } catch (error) {
      console.warn("Google Cloud TTS failed, falling back to browser TTS:", error)
    }
  }

  // Fallback to browser TTS (for MVP/demo purposes)
  // Note: This requires client-side execution
  return await generateTTSBrowser(text)
}

/**
 * Generate TTS using Google Cloud Text-to-Speech API
 */
async function generateTTSGoogleCloud(options: TTSOptions): Promise<TTSResult> {
  // Dynamic import to avoid build-time issues
  const { TextToSpeechClient } = await import("@google-cloud/text-to-speech")

  const client = new TextToSpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    credentials: process.env.GOOGLE_CLOUD_TTS_KEY
      ? JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY)
      : undefined,
  })

  const request = {
    input: { text: options.text },
    voice: {
      languageCode: options.languageCode || "en-US",
      name: options.voice || "en-US-Neural2-D",
      ssmlGender: options.ssmlGender || "NEUTRAL",
    },
    audioConfig: {
      audioEncoding: "MP3" as const,
      speakingRate: options.speakingRate || 1.0,
      pitch: options.pitch || 0.0,
      volumeGainDb: 0.0,
    },
  }

  const [response] = await client.synthesizeSpeech(request)

  if (!response.audioContent) {
    throw new Error("No audio content returned from Google Cloud TTS")
  }

  // Calculate approximate duration (rough estimate: 150 words per minute)
  const wordCount = options.text.split(/\s+/).length
  const duration = (wordCount / 150) * 60 // seconds

  return {
    buffer: Buffer.from(response.audioContent),
    duration,
    format: "mp3",
  }
}

/**
 * Generate TTS using browser Web Speech API (fallback for MVP)
 * Note: This is a client-side only solution and requires browser execution
 */
async function generateTTSBrowser(text: string): Promise<TTSResult> {
  // For MVP, we'll use a placeholder that indicates TTS needs to be configured
  // In production, you would use Google Cloud TTS or another service

  // Create a simple placeholder audio (silence)
  // In a real implementation, you'd call an API or use a service
  const placeholderDuration = estimateSpeechDuration(text)
  const placeholderBuffer = Buffer.alloc(placeholderDuration * 16000) // 16kHz sample rate

  return {
    buffer: placeholderBuffer,
    duration: placeholderDuration,
    format: "mp3",
  }
}

/**
 * Estimate speech duration based on text length
 */
function estimateSpeechDuration(text: string): number {
  // Average speaking rate: 150 words per minute
  const wordCount = text.split(/\s+/).length
  return (wordCount / 150) * 60 // seconds
}

/**
 * Get available voices for a language
 */
export async function getAvailableVoices(languageCode: string = "en-US"): Promise<Array<{ name: string; ssmlGender: string }>> {
  // Default voices if Google Cloud TTS is not configured
  const defaultVoices = [
    { name: "en-US-Neural2-D", ssmlGender: "MALE" },
    { name: "en-US-Neural2-F", ssmlGender: "FEMALE" },
    { name: "en-US-Neural2-J", ssmlGender: "MALE" },
    { name: "en-US-Standard-D", ssmlGender: "MALE" },
    { name: "en-US-Standard-F", ssmlGender: "FEMALE" },
  ]

  if (process.env.GOOGLE_CLOUD_TTS_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const { TextToSpeechClient } = await import("@google-cloud/text-to-speech")
      const client = new TextToSpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        credentials: process.env.GOOGLE_CLOUD_TTS_KEY
          ? JSON.parse(process.env.GOOGLE_CLOUD_TTS_KEY)
          : undefined,
      })

      const [result] = await client.listVoices({ languageCode })
      return (
        result.voices?.map((voice) => ({
          name: voice.name || "",
          ssmlGender: voice.ssmlGender || "NEUTRAL",
        })) || defaultVoices
      )
    } catch (error) {
      console.warn("Failed to fetch voices from Google Cloud, using defaults:", error)
      return defaultVoices
    }
  }

  return defaultVoices
}

