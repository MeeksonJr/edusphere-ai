# Vercel Deployment Fix - maxDuration Limit

## Issue

**Error:** `Builder returned invalid maxDuration value for Serverless Function "api/courses/process". Serverless Functions must have a maxDuration between 1 and 60 for plan hobby.`

**Cause:** The `maxDuration` was set to 300 seconds (5 minutes), but Vercel's Hobby plan only allows 1-60 seconds.

## Solution

Changed `maxDuration` from 300 to 60 seconds (the maximum allowed for Hobby plan).

**File:** `app/api/courses/process/route.ts`

```typescript
export const maxDuration = 60 // Maximum allowed for Vercel Hobby plan (60 seconds)
```

## Considerations

### Current Limitation
- AI generation might take longer than 60 seconds for complex courses
- If generation exceeds 60 seconds, the function will timeout

### Workarounds

1. **Optimize AI Prompts:**
   - Reduce `maxTokens` for faster responses
   - Use faster models (Gemini Flash instead of Pro)
   - Simplify course structure requests

2. **Split Processing:**
   - Generate layout in chunks (one chapter at a time)
   - Use multiple API calls instead of one large call
   - Process chapters sequentially with status updates

3. **Upgrade Plan:**
   - Vercel Pro plan allows up to 300 seconds (5 minutes)
   - Vercel Enterprise allows up to 900 seconds (15 minutes)

4. **Alternative Solutions:**
   - Use Vercel Cron Jobs for background processing
   - Use external queue system (BullMQ, Inngest, etc.)
   - Use Supabase Edge Functions (60 second limit but separate from Vercel)

## Current Implementation

The process endpoint will:
1. Try to complete within 60 seconds
2. If it times out, the course status will remain "processing"
3. Frontend can poll for status updates
4. User can manually retry if needed

## Future Improvements

1. **Implement Chunked Processing:**
   ```typescript
   // Process one chapter at a time
   for (const chapter of layoutJson.chapters) {
     await processChapter(chapter)
     // Update progress
   }
   ```

2. **Add Progress Tracking:**
   - Store progress percentage in database
   - Update status as chapters complete
   - Allow resuming from last completed chapter

3. **Use Queue System:**
   - Integrate with Inngest or similar
   - Queue jobs that can run longer than 60 seconds
   - Better error handling and retries

## Testing

After deployment:
1. Test course generation with simple topics (should complete in < 60s)
2. Monitor Vercel logs for timeout errors
3. Test with complex topics to see if timeout occurs
4. Verify course status updates correctly
