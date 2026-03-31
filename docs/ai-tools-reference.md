# AI Tools Integration — Test Results & Reference

**Tested:** March 31, 2026
**Project:** EduSphere AI

---

## 🔑 API Keys Configured

| Service | Env Variable | Status |
|---|---|---|
| Groq | `GROQ_API_KEY` | ✅ Active |
| Hugging Face | `HUGGING_FACE_TOKEN` / `HUGGING_FACE_API_KEY` | ✅ Active |
| Pollinations.AI | `POLLINATIONS_SECRET_KEY` / `POLLINATIONS_PUBLISHABLE_KEY` | ✅ Active |
| Google Gemini | `GEMINI_API_KEY` | ✅ Active (pre-existing) |
| ElevenLabs | `ELEVENLABS_API_KEY` | ✅ Active (pre-existing) |
| Edge-TTS | *(no key required)* | ✅ Always available |

---

## ✅ Groq — Fully Working

**Base URL:** `https://api.groq.com/openai/v1`
**Auth:** `Authorization: Bearer $GROQ_API_KEY`
**Rate Limit:** Free tier, ~14,400 requests/day per model

### Available Models (as of March 31, 2026)

| Model ID | Type | Speed | Best For |
|---|---|---|---|
| `llama-3.3-70b-versatile` | LLM | Fast | General generation, course content |
| `meta-llama/llama-4-scout-17b-16e-instruct` | LLM (Llama 4) | Very Fast | Quiz generation, tutoring (NEWER) |
| `llama-3.1-8b-instant` | LLM | Instant | Real-time chat, low latency |
| `qwen/qwen3-32b` | LLM | Fast | Reasoning, structured output |
| `moonshotai/kimi-k2-instruct` | LLM | Fast | Long-context, multi-step |
| `openai/gpt-oss-120b` | LLM | Moderate | Complex reasoning |
| `openai/gpt-oss-20b` | LLM | Fast | General tasks |
| `whisper-large-v3` | STT | Fast | High-accuracy transcription |
| `whisper-large-v3-turbo` | STT | Very Fast | Real-time transcription |
| `allam-2-7b` | LLM | Fast | Arabic language |
| `canopylabs/orpheus-v1-english` | TTS | - | Text-to-speech (English) |

### Test Results

```bash
# LLM Test (llama-3.3-70b-versatile)
✅ GROQ OK - Model: llama-3.3-70b-versatile | Response: "Hello, it is very nice"

# Llama 4 Scout Test
✅ GROQ LLAMA-4-SCOUT OK
  Model: meta-llama/llama-4-scout-17b-16e-instruct
  Tokens used: 313
  Successfully generated 3 JSON quiz questions about photosynthesis

# Whisper STT Test  
✅ GROQ WHISPER OK - Model: whisper-large-v3-turbo | Transcription working
```

### EduSphere Feature Mapping

| Feature | Recommended Groq Model |
|---|---|
| Course layout generation | `llama-3.3-70b-versatile` |
| Quiz question generation | `meta-llama/llama-4-scout-17b-16e-instruct` |
| AI Tutor real-time chat | `llama-3.1-8b-instant` (lowest latency) |
| Assignment AI feedback | `llama-3.3-70b-versatile` |
| Podcast script generation | `llama-3.3-70b-versatile` |
| Audio transcription (STT) | `whisper-large-v3-turbo` |

---

## ✅ Pollinations.AI — Fully Working (No Limits)

**Image Base URL:** `https://image.pollinations.ai/prompt/{encoded_prompt}`
**Text Base URL:** `https://text.pollinations.ai/{encoded_prompt}`
**Chat API:** `https://api.pollinations.ai/v1/chat/completions` (OpenAI-compat)
**Auth (images):** ⚡ No API key required — pure URL
**Auth (chat):** `Authorization: Bearer $POLLINATIONS_SECRET_KEY`

### Available Image Models

| Model | Quality | Speed |
|---|---|---|
| `flux` | ⭐⭐⭐⭐⭐ | Fast |
| `flux-realism` | ⭐⭐⭐⭐⭐ | Moderate |
| `flux-anime` | ⭐⭐⭐⭐ | Fast |
| `turbo` | ⭐⭐⭐ | Very Fast |

### Test Results

```bash
# Image Generation Test
URL: https://image.pollinations.ai/prompt/Educational+course+about+mathematics?width=512&height=512&model=flux&seed=42
Status: 200 OK
File size: 49KB — ✅ Real image generated

# Text Generation Test
URL: https://text.pollinations.ai/What%20is%202%2B2%3F%20Answer%20in%205%20words%20max
Response: "Two plus two is four." — ✅ Working
```

### Usage Pattern

```typescript
// Course cover image — returns URL directly, no upload needed
const imageUrl = generateCourseImageUrl("Introduction to Machine Learning")
// → "https://image.pollinations.ai/prompt/Educational%20course%20thumbnail..."

// Podcast cover
const podcastImg = generatePodcastImageUrl("The History of the Roman Empire")
```

### EduSphere Feature Mapping

| Feature | Usage |
|---|---|
| Course cover images | `generateCourseImageUrl(topic)` |
| Podcast cover images | `generatePodcastImageUrl(title)` |
| Resource thumbnails | `generateImageUrl(prompt, { model: "turbo" })` |
| Study group avatars | `generateImageUrl(subject + " icon", { width: 128, height: 128 })` |

---

## 🟡 Hugging Face — Partially Working (Free Tier Limits)

**API Base:** `https://router.huggingface.co/hf-inference/models`
> ⚠️ `api-inference.huggingface.co` is **deprecated** — use `router.huggingface.co` instead.

**Auth:** `Authorization: Bearer $HUGGING_FACE_TOKEN`
**Account:** `pandacode` (free plan)
**Free Credits:** ~$0.10/month for serverless inference

### Confirmed Working on Free Tier

| Model | Task | Test Result |
|---|---|---|
| `distilbert/distilbert-base-uncased-finetuned-sst-2-english` | Sentiment | ✅ Working |
| `facebook/bart-large-mnli` | Zero-shot Classification | ✅ Working (98.6% accurate) |
| `Helsinki-NLP/opus-mt-en-fr` | English→French Translation | ✅ Working |
| `Helsinki-NLP/opus-mt-en-es` | English→Spanish Translation | ✅ Expected working |
| `Helsinki-NLP/opus-mt-en-de` | English→German Translation | ✅ Expected working |
| `sshleifer/distilbart-cnn-12-6` | Summarization (lighter) | 🟡 Works (cold start ~45s) |
| `facebook/bart-large-cnn` | Summarization (heavy) | 🟡 Works (cold start ~2min) |

### Requires PRO Tier (Not Available Free)

| Model | Task | Why Needed |
|---|---|---|
| `mistralai/Mistral-7B-Instruct-v0.3` | LLM Chat | PRO only |
| `Qwen/Qwen2.5-7B-Instruct` | LLM Chat | PRO only |
| `openai/whisper-large-v3` | STT | PRO only (use Groq instead) |

### Test Results

```bash
# Sentiment Analysis
Input: "I love learning with EduSphere AI! The courses are amazing."
Output: POSITIVE (99.2%) — ✅

# Zero-Shot Classification
Input: "Student scored 95% on all quizzes"
Labels: ["excellent student", "struggling", "needs help"]
Output: excellent student (98.6%), needs help (0.97%), struggling (0.45%) — ✅

# Translation EN→FR
Input: "Hello student, welcome to your course."
Output: "Bonjour étudiant, bienvenue à votre cours." — ✅
```

### EduSphere Feature Mapping

| Feature | HF Model |
|---|---|
| Student feedback sentiment analysis | `distilbert-base-uncased-finetuned-sst-2-english` |
| Auto-classify resource difficulty | `facebook/bart-large-mnli` + labels: ["beginner","intermediate","advanced"] |
| Course content translation | `Helsinki-NLP/opus-mt-en-{fr,es,de,zh,ja}` |
| Study note summarization | `sshleifer/distilbart-cnn-12-6` |
| Teacher portal feedback analysis | `facebook/bart-large-mnli` |

> 💡 **Best Practice:** For LLM inference (chat, generation), use **Groq** — it's faster and
> has larger models for free. Use Hugging Face for **specialized pipelines** that don't need
> a general LLM (sentiment, classification, translation).

---

## 📁 Library Files

| File | Description |
|---|---|
| [`lib/huggingface.ts`](../lib/huggingface.ts) | HF inference service (sentiment, translation, classification, summarization) |
| [`lib/pollinations.ts`](../lib/pollinations.ts) | Pollinations image + text generation service |
| [`lib/tts-service.ts`](../lib/tts-service.ts) | TTS (ElevenLabs → Edge-TTS → Google fallback) |
| [`lib/course-processing.ts`](../lib/course-processing.ts) | Course slide + audio processing pipeline |
| [`lib/ai-service-wrapper.ts`](../lib/ai-service-wrapper.ts) | Unified AI provider router (Groq, Gemini, HF) |

---

## 🚫 Deprecated Endpoints

| Old | New |
|---|---|
| `api-inference.huggingface.co` | `router.huggingface.co/hf-inference/models` |

---

## 📊 Provider Decision Matrix

| Need | Use |
|---|---|
| Fast LLM chat (real-time) | Groq `llama-3.1-8b-instant` |
| High-quality LLM generation | Groq `llama-3.3-70b-versatile` |
| Multimodal / quiz generation | Groq `llama-4-scout-17b-16e-instruct` |
| Audio transcription | Groq `whisper-large-v3-turbo` |
| Image generation | Pollinations.AI (no key, free) |
| Text sentiment / classification | Hugging Face (free pipeline models) |
| Translation | Hugging Face `opus-mt-en-{lang}` |
| TTS narration | Edge-TTS (free) → ElevenLabs (premium) |
