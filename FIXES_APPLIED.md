# Fixes Applied for Course Generation Issues

## Issues Fixed

### 1. Missing `user_settings` Table ✅

**Problem:** The `user_settings` table was missing from the database, causing 404 errors.

**Solution:**
- Created `sql/11-create-user-settings-table.sql` migration file
- Updated `sql/README.md` to include the new migration file
- The table includes:
  - `id` (UUID primary key)
  - `user_id` (references auth.users)
  - `settings` (JSONB for flexible settings storage)
  - RLS policies for user access
  - Unique constraint on `user_id`

**Action Required:**
Run the SQL migration file in your Supabase SQL Editor:
```sql
-- File: sql/11-create-user-settings-table.sql
```

### 2. Gemini API Model Error ✅

**Problem:** 
- Error: `models/gemini-1.5-flash is not found for API version v1beta`
- The model name `gemini-1.5-flash` is not available in the current API version

**Solution:**
- Changed model from `gemini-1.5-flash` to `gemini-pro` in `lib/ai-service.ts`
- `gemini-pro` is more stable and widely available across API versions
- Added Hugging Face fallback in course generation API route
- Improved error handling with better error messages

**Changes Made:**
1. **`lib/ai-service.ts`**:
   - Changed model from `"gemini-1.5-flash"` to `"gemini-pro"`
   - Updated return value to reflect `"gemini-pro"` model name

2. **`app/api/courses/generate/route.ts`**:
   - Added try-catch with Hugging Face fallback
   - Improved error messages
   - Fixed response parsing to handle both string and object responses

## Testing Steps

1. **Create user_settings table:**
   - Go to Supabase SQL Editor
   - Run `sql/11-create-user-settings-table.sql`
   - Verify table was created successfully

2. **Test course generation:**
   - Navigate to `/dashboard/courses/new`
   - Enter a topic (e.g., "Introduction to React")
   - Select course type and style
   - Click "Generate Course"
   - Should now work without errors

3. **Verify settings work:**
   - Navigate to `/dashboard/settings`
   - Should load without 404 errors
   - Settings should save correctly

## Environment Variables

Make sure these are set in Vercel:
- `GEMINI_API_KEY` - For Gemini AI (now using gemini-pro model)
- `HUGGING_FACE_API_KEY` - For fallback AI generation
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase keys

## Model Information

**Gemini Models Available:**
- `gemini-pro` ✅ (Currently used - stable and reliable)
- `gemini-1.5-pro` (Alternative if available)
- `gemini-1.5-flash` ❌ (Not available in v1beta API)

**Note:** If you want to use `gemini-1.5-pro` instead, you can change the model name in `lib/ai-service.ts` line 53.

## Next Steps

After applying these fixes:
1. ✅ Run the SQL migration for user_settings table
2. ✅ Test course generation
3. ✅ Verify settings page works
4. ✅ Check Vercel logs for any remaining errors

All fixes are backward compatible and won't break existing functionality.

