# Database Setup Guide

This directory contains SQL migration files for setting up the EduSphere AI database schema.

## Execution Order

Execute the SQL files in the following order:

1. **01-create-profiles-table.sql** - User profiles table (required first)
2. **02-create-assignments-table.sql** - Assignments table
3. **03-create-ai-chats-table.sql** - AI chat history table
4. **04-create-flashcard-sets-table.sql** - Flashcard sets table
5. **05-create-study-resources-table.sql** - Study resources table
6. **06-create-contact-messages-table.sql** - Contact form messages table
7. **07-create-courses-table.sql** - Courses table (for video generation)
8. **08-create-render-jobs-table.sql** - Render jobs table (depends on courses)
9. **09-create-course-slides-table.sql** - Course slides table (depends on courses)
10. **10-create-storage-buckets.sql** - Storage buckets for file uploads
11. **11-create-user-settings-table.sql** - User settings table (Required for settings page)
12. **12-create-course-questions-table.sql** - Course questions table (NEW - For AI-generated quizzes)
13. **13-create-course-resources-table.sql** - Course resources table (NEW - For links and references)
14. **14-create-course-progress-table.sql** - Course progress tracking table (NEW - For user progress)
15. **15-create-course-analytics-table.sql** - Course analytics table (NEW - For tracking user behavior)
16. **create-study-guides-table.sql** - Study guides table (updated with RLS)

## How to Execute

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each SQL file (in order)
4. Click **Run** to execute
5. Check for any errors and report them

## Important Notes

- All tables include **Row Level Security (RLS)** policies
- Users can only access their own data
- Service role has full access for backend operations
- The `profiles` table has a trigger that automatically creates a profile when a user signs up
- Storage buckets are created for avatars and course media

## Environment Variables

Make sure you have these set in your `.env.local` and Vercel:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key

## Troubleshooting

If you encounter errors:

1. **Foreign key errors**: Make sure you've run the files in order
2. **RLS policy errors**: Check that you're running as a user with proper permissions
3. **Storage bucket errors**: Ensure you have storage enabled in your Supabase project

