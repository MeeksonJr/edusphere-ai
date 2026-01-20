-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-course', 'quick-explainer', 'tutorial', 'other')),
  style TEXT CHECK (style IN ('professional', 'cinematic', 'casual', 'academic')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  layout JSONB NOT NULL DEFAULT '{}',
  estimated_duration INTEGER, -- in seconds
  final_video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS courses_user_id_idx ON courses(user_id);
CREATE INDEX IF NOT EXISTS courses_status_idx ON courses(status);
CREATE INDEX IF NOT EXISTS courses_type_idx ON courses(type);
CREATE INDEX IF NOT EXISTS courses_created_at_idx ON courses(created_at DESC);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own courses
CREATE POLICY "Users can view their own courses"
ON courses FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own courses
CREATE POLICY "Users can insert their own courses"
ON courses FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own courses
CREATE POLICY "Users can update their own courses"
ON courses FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete their own courses"
ON courses FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all courses
CREATE POLICY "Service role can manage all courses"
ON courses
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

