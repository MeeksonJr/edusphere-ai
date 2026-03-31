/**
 * Pollinations.AI Service
 * Free AI image and text generation — no usage limits, no API key required for images.
 * Secret key used for authenticated text generation (OpenAI-compatible chat endpoint).
 *
 * Confirmed working (tested March 31, 2026):
 *  - Image: https://image.pollinations.ai/prompt/{prompt}  → Flux model, unlimited
 *  - Text:  https://text.pollinations.ai/{prompt}          → Quick single-shot text
 *  - Chat:  https://api.pollinations.ai/v1/chat/completions → OpenAI-compat (with key)
 *
 * Docs: https://pollinations.ai/docs
 */

const POLLINATIONS_SECRET = process.env.POLLINATIONS_SECRET_KEY || ""
const POLLINATIONS_PK = process.env.POLLINATIONS_PUBLISHABLE_KEY || ""

// ─── Image Generation ─────────────────────────────────────────────────────────

export interface ImageGenerationOptions {
  width?: number
  height?: number
  model?: "flux" | "flux-realism" | "flux-anime" | "turbo"
  seed?: number
  noLogo?: boolean
  enhance?: boolean
}

/**
 * Generate an AI image from a text prompt using Pollinations Flux.
 * Returns a publicly accessible URL — no upload needed!
 *
 * @param prompt  - Description of the image to generate
 * @param options - Width, height, model variant, seed
 * @returns       - Direct image URL (jpeg)
 *
 * @example
 * generateImage("Digital art of mathematics equations on a dark background", { width: 512, height: 512 })
 */
export function generateImageUrl(
  prompt: string,
  options: ImageGenerationOptions = {}
): string {
  const {
    width = 512,
    height = 512,
    model = "flux",
    seed,
    noLogo = true,
    enhance = true,
  } = options

  const encoded = encodeURIComponent(prompt)
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    model,
    nologo: String(noLogo),
    enhance: String(enhance),
  })

  if (seed !== undefined) params.set("seed", String(seed))

  return `https://image.pollinations.ai/prompt/${encoded}?${params.toString()}`
}

/**
 * Fetch a generated image as a Buffer (for server-side upload to Supabase Storage).
 * Useful when you want to save the image permanently rather than using the live URL.
 */
export async function generateImageBuffer(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<Buffer> {
  const url = generateImageUrl(prompt, options)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Pollinations image generation failed: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ─── Text Generation (Simple) ─────────────────────────────────────────────────

/**
 * Quick single-shot text generation — no API key needed.
 * Great for simple one-off generations.
 */
export async function generateText(
  prompt: string,
  options?: { model?: string; seed?: number }
): Promise<string> {
  const params = new URLSearchParams({
    model: options?.model || "openai-fast",
    json: "false",
  })
  if (options?.seed !== undefined) params.set("seed", String(options.seed))

  const encoded = encodeURIComponent(prompt)
  const res = await fetch(
    `https://text.pollinations.ai/${encoded}?${params.toString()}`
  )
  if (!res.ok) throw new Error(`Pollinations text generation failed: ${res.status}`)
  return res.text()
}

// ─── Chat (OpenAI-compatible, uses secret key) ────────────────────────────────

export interface PollinationsMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Chat completion using Pollinations OpenAI-compatible endpoint.
 * Requires secret key for authenticated access.
 * Available models: "openai", "openai-fast", "mistral", "claude-hybridspace" etc.
 */
export async function pollinationsChat(
  messages: PollinationsMessage[],
  options?: { model?: string; seed?: number; temperature?: number }
): Promise<string> {
  const res = await fetch("https://api.pollinations.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POLLINATIONS_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options?.model || "openai-fast",
      messages,
      seed: options?.seed,
      temperature: options?.temperature ?? 0.7,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Pollinations chat error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ""
}

// ─── EduSphere-specific helpers ───────────────────────────────────────────────

/**
 * Generate a course cover image URL for a given topic.
 * Returns a direct, publicly accessible image URL.
 */
export function generateCourseImageUrl(topic: string, style = "professional"): string {
  const prompt = `Educational course thumbnail about ${topic}, modern ${style} design, clean flat art, vibrant colors, no text`
  return generateImageUrl(prompt, { width: 800, height: 450, model: "flux", enhance: true })
}

/**
 * Generate a podcast cover image URL for a given topic.
 */
export function generatePodcastImageUrl(title: string): string {
  const prompt = `Podcast cover art for "${title}", modern gradient design, microphone icon, professional, vibrant`
  return generateImageUrl(prompt, { width: 512, height: 512, model: "flux-realism" })
}
