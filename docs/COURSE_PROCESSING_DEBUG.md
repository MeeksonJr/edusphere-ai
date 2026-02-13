# Course Processing Debug Guide

## Issue: Courses Stuck in "Processing" Status

### Symptoms
- Course status remains "processing"
- Layout column is empty `{}`
- Estimated duration, thumbnail, and video_url are empty
- Other columns have data

### Root Causes

1. **Process Route Not Being Called**
   - The fetch from `/api/courses/generate` to `/api/courses/process` might be failing silently
   - Authentication cookies might not be passed correctly
   - Network errors might not be caught

2. **AI Generation Failing**
   - All AI providers (Gemini, Groq, Hugging Face) might be failing
   - API keys might be missing or invalid
   - Response might be malformed

3. **JSON Parsing Failing**
   - AI response might not be valid JSON
   - Response might be wrapped in markdown code blocks incorrectly
   - Response structure might not match expected format

4. **Database Update Failing**
   - RLS policies might be blocking the update
   - Layout JSON might be too large
   - Database connection might be timing out

### Debugging Steps

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for `/api/courses/process` logs
   - Check for errors or timeouts

2. **Check Browser Console**
   - Open browser DevTools → Network tab
   - Look for `/api/courses/process` request
   - Check response status and body

3. **Check Database**
   - Verify course record exists
   - Check if status is "processing" or "failed"
   - Check if layout column has any data

4. **Test Process Route Directly**
   ```bash
   curl -X POST https://your-domain.com/api/courses/process \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{
       "courseId": "your-course-id",
       "topic": "Test Topic",
       "courseType": "quick-explainer",
       "style": "professional"
     }'
   ```

### Enhanced Logging Added

The following console.log statements have been added to help debug:

- `Process route called - starting course generation`
- `Process route: Processing course { courseId, topic, courseType, style }`
- `Status updated to processing, starting AI generation...`
- `Attempting AI generation with Gemini...`
- `Gemini generation successful, response length: X`
- `Parsing AI response...`
- `Successfully parsed layout, chapters: X`
- `Updating course with layout, duration: X`
- `Course updated successfully, status set to completed`

### Common Fixes

1. **If Process Route Not Called:**
   - Check if fetch is being made (check Network tab)
   - Verify cookies are being passed
   - Check CORS settings

2. **If AI Generation Fails:**
   - Verify API keys in `.env.local`
   - Check AI service logs
   - Try a simpler prompt

3. **If JSON Parsing Fails:**
   - Check AI response format
   - Verify response is valid JSON
   - Check for markdown code block wrapping

4. **If Database Update Fails:**
   - Check RLS policies
   - Verify user has permission
   - Check for JSON size limits

### Next Steps

1. Check Vercel function logs for the process route
2. Look for the console.log statements above
3. Verify API keys are set correctly
4. Test with a simple course type first (quick-explainer)

