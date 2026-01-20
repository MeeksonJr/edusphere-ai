-- Fix for course_progress table - Drop existing policies and recreate
-- Run this if you got an error about policies already existing

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON course_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON course_progress;
DROP POLICY IF EXISTS "Service role can manage all progress" ON course_progress;

-- Recreate policies
CREATE POLICY "Users can view their own progress"
ON course_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON course_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON course_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON course_progress FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all progress"
ON course_progress
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

