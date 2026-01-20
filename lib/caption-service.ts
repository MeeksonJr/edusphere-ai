/**
 * Caption Generation Service
 * Generates captions from audio using transcription services
 */

export interface CaptionSegment {
  id: number
  start: number
  end: number
  text: string
  words?: Array<{
    word: string
    start: number
    end: number
  }>
}

export interface CaptionData {
  segments: CaptionSegment[]
  language: string
  duration: number
}

/**
 * Generate captions from audio URL
 * Supports multiple providers with fallback options
 */
export async function generateCaptions(audioUrl: string): Promise<CaptionData> {
  // Try Replicate Whisper first if API key is available
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      return await generateCaptionsReplicate(audioUrl)
    } catch (error) {
      console.warn("Replicate Whisper failed, trying alternative:", error)
    }
  }

  // Try Google Speech-to-Text if available
  if (process.env.GOOGLE_CLOUD_STT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      return await generateCaptionsGoogle(audioUrl)
    } catch (error) {
      console.warn("Google Speech-to-Text failed:", error)
    }
  }

  // Fallback: Return placeholder captions
  console.warn("No caption service configured, returning placeholder")
  return generatePlaceholderCaptions(audioUrl)
}

/**
 * Generate captions using Replicate Whisper
 */
async function generateCaptionsReplicate(audioUrl: string): Promise<CaptionData> {
  const Replicate = await import("replicate")
  const replicate = new Replicate.default({
    auth: process.env.REPLICATE_API_TOKEN!,
  })

  // Download audio file
  const audioResponse = await fetch(audioUrl)
  const audioBuffer = await audioResponse.arrayBuffer()

  // Run Whisper model
  const output = await replicate.run(
    "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8b2",
    {
      input: {
        audio: new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" }),
        model: "large-v3",
        translate: false,
        language: "en",
        temperature: 0,
        transcription: "plain text",
        suppress_tokens: "-1",
        logprob_threshold: -1,
        no_speech_threshold: 0.6,
        condition_on_previous_text: true,
        compression_ratio_threshold: 2.4,
        temperature_increment_on_fallback: 0.2,
      },
    }
  )

  // Parse Replicate output format
  const segments: CaptionSegment[] = []
  if (output && typeof output === "object" && "segments" in output) {
    const replicateSegments = (output as any).segments || []
    replicateSegments.forEach((seg: any, index: number) => {
      segments.push({
        id: index,
        start: seg.start || 0,
        end: seg.end || 0,
        text: seg.text || "",
        words: seg.words?.map((word: any) => ({
          word: word.word || "",
          start: word.start || 0,
          end: word.end || 0,
        })),
      })
    })
  }

  const duration = segments.length > 0 ? segments[segments.length - 1].end : 0

  return {
    segments,
    language: "en",
    duration,
  }
}

/**
 * Generate captions using Google Speech-to-Text
 */
async function generateCaptionsGoogle(audioUrl: string): Promise<CaptionData> {
  const { SpeechClient } = await import("@google-cloud/speech")

  const client = new SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    credentials: process.env.GOOGLE_CLOUD_STT_KEY
      ? JSON.parse(process.env.GOOGLE_CLOUD_STT_KEY)
      : undefined,
  })

  // Download audio
  const audioResponse = await fetch(audioUrl)
  const audioContent = await audioResponse.arrayBuffer()

  const request = {
    config: {
      encoding: "MP3" as const,
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
    },
    audio: {
      content: Buffer.from(audioContent).toString("base64"),
    },
  }

  const [response] = await client.recognize(request)

  const segments: CaptionSegment[] = []
  let segmentId = 0

  response.results?.forEach((result) => {
    result.alternatives?.forEach((alternative) => {
      if (alternative.words) {
        let currentSegment: CaptionSegment | null = null

        alternative.words.forEach((word) => {
          const start = word.startTime?.seconds || 0
          const end = word.endTime?.seconds || 0

          if (!currentSegment || start - (currentSegment.end || 0) > 2) {
            // Start new segment
            if (currentSegment) {
              segments.push(currentSegment)
            }
            currentSegment = {
              id: segmentId++,
              start,
              end,
              text: word.word || "",
              words: [],
            }
          } else {
            // Add to current segment
            if (currentSegment) {
              currentSegment.text += " " + (word.word || "")
              currentSegment.end = end
              currentSegment.words?.push({
                word: word.word || "",
                start,
                end,
              })
            }
          }
        })

        if (currentSegment) {
          segments.push(currentSegment)
        }
      }
    })
  })

  const duration = segments.length > 0 ? segments[segments.length - 1].end : 0

  return {
    segments,
    language: "en-US",
    duration,
  }
}

/**
 * Generate placeholder captions (for MVP when services aren't configured)
 */
function generatePlaceholderCaptions(audioUrl: string): CaptionData {
  // Return empty captions structure
  // In production, this should never be used
  return {
    segments: [],
    language: "en",
    duration: 0,
  }
}

/**
 * Convert captions to SRT format
 */
export function captionsToSRT(captions: CaptionData): string {
  return captions.segments
    .map((segment, index) => {
      const startTime = formatSRTTime(segment.start)
      const endTime = formatSRTTime(segment.end)
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`
    })
    .join("\n")
}

/**
 * Convert captions to WebVTT format
 */
export function captionsToWebVTT(captions: CaptionData): string {
  let vtt = "WEBVTT\n\n"
  captions.segments.forEach((segment) => {
    const startTime = formatWebVTTTime(segment.start)
    const endTime = formatWebVTTTime(segment.end)
    vtt += `${startTime} --> ${endTime}\n${segment.text}\n\n`
  })
  return vtt
}

/**
 * Format time for SRT (HH:MM:SS,mmm)
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`
}

/**
 * Format time for WebVTT (HH:MM:SS.mmm)
 */
function formatWebVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
}

