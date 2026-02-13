# Timeout and Settings Fixes

## Issues Fixed

### 1. Settings Context - Duplicate Key Error ✅

**Problem:**
- 409 Conflict error: `duplicate key value violates unique constraint "user_settings_user_id_key"`
- 406 Not Acceptable error when fetching settings

**Solution:**
- Changed all `INSERT` operations to `UPSERT` with `onConflict: "user_id"`
- Handles race conditions where multiple requests try to create settings simultaneously
- Fixed TypeScript errors with proper Supabase upsert syntax

**Files Changed:**
- `contexts/settings-context.tsx`

### 2. Course Generation - 504 Gateway Timeout ✅

**Problem:**
- Course generation was taking longer than 10 seconds (Vercel's default timeout)
- AI generation was happening synchronously in the request handler

**Solution:**
- **Immediate Response:** Create course record with "pending" status and return immediately
- **Background Processing:** Move AI generation to `/api/courses/process` endpoint
- **Extended Timeout:** Set `maxDuration = 300` (5 minutes) for process endpoint
- **Status Updates:** Course status changes: `pending` → `processing` → `completed`/`failed`

**Files Changed:**
- `app/api/courses/generate/route.ts` - Now returns immediately
- `app/api/courses/process/route.ts` - Handles AI generation in background

## How It Works Now

### Course Generation Flow

1. **User submits course generation form**
2. **Generate endpoint (`/api/courses/generate`):**
   - Creates course record with "pending" status
   - Returns course ID immediately (< 1 second)
   - Triggers background processing (non-blocking)

3. **Process endpoint (`/api/courses/process`):**
   - Updates status to "processing"
   - Generates course layout using AI (can take 30-60 seconds)
   - Tries multiple AI providers with fallbacks:
     - Gemini (with model fallbacks)
     - Groq (if Gemini fails)
     - Hugging Face (if both fail)
   - Updates course with generated layout
   - Sets status to "completed" or "failed"

4. **Frontend:**
   - User is redirected to course detail page
   - Page polls for status updates
   - Shows progress indicator while processing

## Status States

- `pending` - Course created, waiting for AI generation
- `processing` - AI generation in progress
- `completed` - Course layout generated successfully
- `failed` - Generation failed (will show error message)

## Benefits

1. **No Timeouts:** Request returns in < 1 second
2. **Better UX:** User sees immediate feedback
3. **Resilient:** Multiple AI fallbacks ensure high success rate
4. **Scalable:** Can handle long-running operations without blocking

## Testing

1. **Test Settings:**
   - Navigate to `/dashboard/settings`
   - Should load without 406/409 errors
   - Changes should save successfully

2. **Test Course Generation:**
   - Navigate to `/dashboard/courses/new`
   - Enter a topic and generate
   - Should return immediately with course ID
   - Check course detail page - should show "processing" then "completed"

## Next Steps

- Add WebSocket or polling for real-time status updates
- Add retry logic for failed generations
- Add progress percentage for long operations
- Consider using a queue system (BullMQ) for production

