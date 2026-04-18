import { Mic, User, UserCircle } from "lucide-react"

/**
 * Central voice registry for Edusphere AI.
 *
 * Each voice maps a friendly key (stored in `courses.voice`) to an
 * Edge-TTS Neural voice ID and display metadata for the UI.
 *
 * 10 curated voices — 5 female, 5 male — covering a range of
 * accents and tones so creators can match their course personality.
 */

export interface VoiceDefinition {
  /** Stored in DB — lowercase, URL-safe */
  key: string
  /** Human-friendly label */
  label: string
  /** One-liner shown in the selector */
  description: string
  /** Edge-TTS Neural voice short name */
  edgeTTSVoice: string
  gender: "Female" | "Male"
  locale: string
  /** Suggested course styles / types this voice suits best */
  bestFor: string
}

export const VOICE_CATALOG: VoiceDefinition[] = [
  // ── Female voices ──────────────────────────────────────────────
  {
    key: "aria",
    label: "Aria",
    description: "Warm and clear — perfect for professional courses.",
    edgeTTSVoice: "en-US-AriaNeural",
    gender: "Female",
    locale: "en-US",
    bestFor: "Professional, General",
  },
  {
    key: "jenny",
    label: "Jenny",
    description: "Friendly and enthusiastic — great for quick explainers.",
    edgeTTSVoice: "en-US-JennyNeural",
    gender: "Female",
    locale: "en-US",
    bestFor: "Casual, Quick Explainer",
  },
  {
    key: "sonia",
    label: "Sonia",
    description: "Refined British accent — ideal for academic content.",
    edgeTTSVoice: "en-GB-SoniaNeural",
    gender: "Female",
    locale: "en-GB",
    bestFor: "Academic, Cinematic",
  },
  {
    key: "natasha",
    label: "Natasha",
    description: "Crisp Australian — brings energy and approachability.",
    edgeTTSVoice: "en-AU-NatashaNeural",
    gender: "Female",
    locale: "en-AU",
    bestFor: "Casual, Tutorial",
  },
  {
    key: "emma",
    label: "Emma",
    description: "Smooth and composed — polished storytelling voice.",
    edgeTTSVoice: "en-US-EmmaNeural",
    gender: "Female",
    locale: "en-US",
    bestFor: "Cinematic, Full Course",
  },
  // ── Male voices ────────────────────────────────────────────────
  {
    key: "guy",
    label: "Guy",
    description: "Confident and steady — built for tutorials.",
    edgeTTSVoice: "en-US-GuyNeural",
    gender: "Male",
    locale: "en-US",
    bestFor: "Professional, Tutorial",
  },
  {
    key: "christopher",
    label: "Christopher",
    description: "Authoritative and clear — suits formal academic lectures.",
    edgeTTSVoice: "en-US-ChristopherNeural",
    gender: "Male",
    locale: "en-US",
    bestFor: "Academic, Full Course",
  },
  {
    key: "ryan",
    label: "Ryan",
    description: "Warm British tone — engaging and conversational.",
    edgeTTSVoice: "en-GB-RyanNeural",
    gender: "Male",
    locale: "en-GB",
    bestFor: "Casual, Cinematic",
  },
  {
    key: "william",
    label: "William",
    description: "Bold Australian accent — energetic explanations.",
    edgeTTSVoice: "en-AU-WilliamNeural",
    gender: "Male",
    locale: "en-AU",
    bestFor: "Quick Explainer, Tutorial",
  },
  {
    key: "tony",
    label: "Tony",
    description: "Deep and dynamic — perfect for storytelling courses.",
    edgeTTSVoice: "en-US-TonyNeural",
    gender: "Male",
    locale: "en-US",
    bestFor: "Cinematic, Full Course",
  },
]

/** Look up a voice definition by its key (defaults to 'aria') */
export function getVoiceByKey(key: string | null | undefined): VoiceDefinition {
  return VOICE_CATALOG.find((v) => v.key === key) ?? VOICE_CATALOG[0]
}

/** For VisualSelect: returns options shaped correctly */
export function getVoiceSelectOptions() {
  return VOICE_CATALOG.map((v) => ({
    value: v.key,
    label: `${v.label}`,
    description: `${v.description} (${v.gender} · ${v.locale})`,
  }))
}
