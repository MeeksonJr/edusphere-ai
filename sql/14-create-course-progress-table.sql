-- Create course_progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slide_id TEXT, -- Optional - for slide-specific progress
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- seconds
  last_position INTEGER DEFAULT 0, -- frame number in Remotion
  quiz_scores JSONB DEFAULT '{}', -- Store quiz results: {"questionId": "score"}
  notes TEXT,
  bookmarks JSONB DEFAULT '[]', -- Array of slide IDs or timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id, slide_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_progress_user_id_idx ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS course_progress_course_id_idx ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS course_progress_user_course_idx ON course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS course_progress_completed_idx ON course_progress(completed);

-- Enable RLS
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON course_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
ON course_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON course_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
ON course_progress FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all progress
CREATE POLICY "Service role can manage all progress"
ON course_progress
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

