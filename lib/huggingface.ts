/**
 * Hugging Face Inference Service
 * Uses the new router.huggingface.co endpoint (api-inference.huggingface.co is deprecated)
 *
 * Confirmed working free-tier models (tested March 31, 2026):
 *  - distilbert-base-uncased-finetuned-sst-2-english  → Sentiment analysis
 *  - Helsinki-NLP/opus-mt-en-{fr,es,de,zh,ja,ar,...}  → Translation
 *  - facebook/bart-large-mnli                          → Zero-shot classification
 *  - sshleifer/distilbart-cnn-12-6                     → Summarization (lighter)
 *
 * NOTE: Large LLMs (Mistral, Qwen, Llama) require HF PRO tier.
 * Use Groq for LLM inference — it's free and much faster.
 */

const HF_TOKEN = process.env.HUGGING_FACE_TOKEN || process.env.HUGGING_FACE_API_KEY || ""
const HF_BASE = "https://router.huggingface.co/hf-inference/models"

async function hfPost<T = any>(model: string, payload: object, timeoutMs = 30000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${HF_BASE}/${model}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HF ${model} error ${res.status}: ${err.slice(0, 200)}`)
    }

    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

export interface SentimentResult {
  label: "POSITIVE" | "NEGATIVE"
  score: number
}

/**
 * Analyze sentiment of student feedback, reviews, etc.
 * Returns POSITIVE or NEGATIVE with confidence score.
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const result = await hfPost<SentimentResult[][]>(
    "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
    { inputs: text }
  )
  // Result is [[{label, score}, {label, score}]]
  const candidates = Array.isArray(result[0]) ? result[0] : (result as any)
  return candidates.reduce((best: SentimentResult, c: SentimentResult) =>
    c.score > best.score ? c : best
  )
}

// ─── Zero-shot Classification ─────────────────────────────────────────────────

export interface ClassificationResult {
  sequence: string
  labels: string[]
  scores: number[]
}

/**
 * Classify text into one of the provided labels WITHOUT training.
 * Great for categorizing student performance, topics, difficulty levels.
 *
 * @example
 * classifyText("Student answered all questions correctly", ["mastery", "learning", "struggling"])
 */
export async function classifyText(
  text: string,
  candidateLabels: string[]
): Promise<ClassificationResult> {
  return hfPost<ClassificationResult>("facebook/bart-large-mnli", {
    inputs: text,
    parameters: { candidate_labels: candidateLabels },
  })
}

// ─── Translation ──────────────────────────────────────────────────────────────

export type TranslationLang = "fr" | "es" | "de" | "zh" | "ja" | "ar" | "pt" | "it" | "ru" | "ko"

/**
 * Translate English text to a target language using Helsinki-NLP opus-mt models.
 * All models are free and available on HF free tier.
 */
export async function translateText(
  text: string,
  targetLang: TranslationLang
): Promise<string> {
  const model = `Helsinki-NLP/opus-mt-en-${targetLang}`
  const result = await hfPost<{ translation_text: string }[]>(model, { inputs: text })
  if (!result[0]?.translation_text) throw new Error("Translation returned empty result")
  return result[0].translation_text
}

// ─── Summarization ────────────────────────────────────────────────────────────

/**
 * Summarize long text content (study notes, resources, chapter content).
 * Uses distilbart (lighter/faster than bart-large-cnn; still high quality).
 */
export async function summarizeText(
  text: string,
  options?: { maxLength?: number; minLength?: number }
): Promise<string> {
  const result = await hfPost<{ summary_text: string }[]>(
    "sshleifer/distilbart-cnn-12-6",
    {
      inputs: text.slice(0, 2000), // HF free tier caps payload
      parameters: {
        max_length: options?.maxLength ?? 100,
        min_length: options?.minLength ?? 30,
      },
    },
    45000 // Allow 45s for cold start
  )
  if (!result[0]?.summary_text) throw new Error("Summarization returned empty result")
  return result[0].summary_text
}
