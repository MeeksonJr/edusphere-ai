# AI Models Update - Multi-Provider Fallback System

## Summary

Updated the AI service to support multiple Gemini models with automatic fallback, plus Groq as a final fallback option.

## Changes Made

### 1. Enhanced Gemini Model Support ✅

**File:** `lib/ai-service.ts`

- Updated `getGeminiModel()` to try multiple models in order:
  1. `gemini-2.5-flash` - Stable, fast, best price-performance
  2. `gemini-3-flash-preview` - Latest flash model
  3. `gemini-2.5-pro` - Stable pro model
  4. `gemini-3-pro-preview` - Latest pro model
  5. `gemini-2.0-flash` - Previous generation stable
  6. `gemini-pro` - Legacy stable model

- If one model fails, it automatically tries the next one
- Returns the first working model

### 2. Added Groq Support ✅

**File:** `lib/ai-service.ts`

- Added `generateGroqResponse()` function
- Supports multiple Groq models with fallback:
  1. `llama-3.3-70b-versatile` - Best quality
  2. `llama-3.1-8b-instant` - Fastest
  3. `gpt-oss-120b` - OpenAI OSS
  4. `gpt-oss-20b` - Smaller OpenAI OSS

### 3. Updated Course Generation API ✅

**File:** `app/api/courses/generate/route.ts`

- Implements 3-tier fallback system:
  1. **Primary:** Gemini (with internal model fallbacks)
  2. **Secondary:** Groq (if Gemini fails)
  3. **Tertiary:** Hugging Face (if both fail)

### 4. Updated Type Definitions ✅

**Files:** `lib/ai-service.ts`, `lib/ai-service-wrapper.ts`

- Added `"groq"` to `AIProvider` type
- Updated all type definitions to support Groq

### 5. Installed Groq SDK ✅

- Installed `groq-sdk` package via pnpm

## Environment Variables Required

Make sure these are set in `.env.local` and Vercel:

```env
# Gemini (Primary)
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Groq (Fallback)
GROQ_API_KEY=your-groq-api-key

# Hugging Face (Final Fallback)
HUGGING_FACE_API_KEY=your-huggingface-api-key
```

## How It Works

### Course Generation Flow

1. **User requests course generation**
2. **Try Gemini:**
   - Attempts `gemini-2.5-flash` first
   - If fails, tries `gemini-3-flash-preview`
   - Continues through all Gemini models
3. **If all Gemini models fail, try Groq:**
   - Attempts `llama-3.3-70b-versatile` first
   - If fails, tries `llama-3.1-8b-instant`
   - Continues through all Groq models
4. **If all fail, try Hugging Face:**
   - Uses `google/flan-t5-base` as fallback
5. **If all providers fail:**
   - Returns error with details

## Model Selection Priority

### Gemini Models (Primary)
1. `gemini-2.5-flash` ⭐ **Recommended** - Stable, fast, cost-effective
2. `gemini-3-flash-preview` - Latest features
3. `gemini-2.5-pro` - Best quality
4. `gemini-3-pro-preview` - Latest pro features
5. `gemini-2.0-flash` - Previous stable
6. `gemini-pro` - Legacy

### Groq Models (Secondary)
1. `llama-3.3-70b-versatile` ⭐ **Recommended** - Best quality
2. `llama-3.1-8b-instant` - Fastest
3. `gpt-oss-120b` - OpenAI OSS
4. `gpt-oss-20b` - Smaller OpenAI OSS

### Hugging Face (Tertiary)
- `google/flan-t5-base` - General purpose

## Benefits

1. **High Availability:** Multiple fallbacks ensure requests rarely fail
2. **Cost Optimization:** Uses fastest/cheapest models first
3. **Quality Assurance:** Falls back to higher quality models if needed
4. **Future-Proof:** Easy to add new models or providers

## Testing

To test the fallback system:

1. **Test Gemini:** Ensure `GEMINI_API_KEY` is set
2. **Test Groq Fallback:** Temporarily remove/invalidate `GEMINI_API_KEY`
3. **Test Hugging Face Fallback:** Remove both Gemini and Groq keys

## Notes

- The `user_settings` table was successfully created (SQL migration completed)
- All models use dynamic imports to avoid build-time issues
- Error messages are detailed to help with debugging
- All providers support system prompts and temperature control

## Next Steps

1. ✅ Run SQL migration for `user_settings` table (already done)
2. ✅ Test course generation with new fallback system
3. ✅ Monitor logs to see which models are being used
4. ⏳ Add monitoring/analytics for model usage
5. ⏳ Consider caching successful model selections

