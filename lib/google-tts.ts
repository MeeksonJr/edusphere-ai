// @ts-ignore
import * as googleTTS from "google-tts-api"

export interface GoogleTTSOptions {
  text: string
  lang?: string
  slow?: boolean
}

export interface GoogleTTSResult {
  buffer: Buffer
  format: "mp3"
  duration: number
}

/**
 * Generate multi-part TTS audio using the free Google Translate API.
 * This automatically handles texts longer than 200 characters.
 */
export async function generateGoogleTTS(options: GoogleTTSOptions): Promise<GoogleTTSResult> {
  const { text, lang = "en", slow = false } = options

  // Calculate estimated duration (assume ~150 chunks per minute if string lengths matter, 
  // but word count is a safe metric)
  const wordCount = text.split(/\s+/).length
  const duration = (wordCount / 150) * 60

  try {
    // google-tts-api automatically splits long text into chunks
    const base64Chunks = await googleTTS.getAllAudioBase64(text, {
      lang,
      slow,
      host: "https://translate.google.com",
      splitPunct: ",.?",
    })

    // Decode base64 strings back to MP3 binary buffers
    const buffers = base64Chunks.map((chunk: { base64: string }) => Buffer.from(chunk.base64, "base64"))
    
    // Concatenate into a single continuous MP3 buffer
    const mergedBuffer = Buffer.concat(buffers)

    return {
      buffer: mergedBuffer,
      format: "mp3",
      duration,
    }
  } catch (error: any) {
    throw new Error(`Google TTS API failed: ${error.message}`)
  }
}
