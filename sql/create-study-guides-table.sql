-- Create study_guides table
CREATE TABLE IF NOT EXISTS study_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS study_guides_user_id_idx ON study_guides(user_id);
CREATE INDEX IF NOT EXISTS study_guides_subject_idx ON study_guides(subject);
CREATE INDEX IF NOT EXISTS study_guides_created_at_idx ON study_guides(created_at DESC);

-- Enable RLS
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;

-- Users can view their own study guides
CREATE POLICY "Users can view their own study guides"
ON study_guides FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own study guides
CREATE POLICY "Users can insert their own study guides"
ON study_guides FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own study guides
CREATE POLICY "Users can update their own study guides"
ON study_guides FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own study guides
CREATE POLICY "Users can delete their own study guides"
ON study_guides FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all study guides
CREATE POLICY "Service role can manage all study guides"
ON study_guides
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');
