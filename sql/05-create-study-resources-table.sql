-- Create study_resources table
CREATE TABLE IF NOT EXISTS study_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  content TEXT NOT NULL,
  resource_type TEXT DEFAULT 'notes' CHECK (resource_type IN ('notes', 'summary', 'guide', 'cheat-sheet', 'other')),
  tags TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS study_resources_user_id_idx ON study_resources(user_id);
CREATE INDEX IF NOT EXISTS study_resources_subject_idx ON study_resources(subject);
CREATE INDEX IF NOT EXISTS study_resources_resource_type_idx ON study_resources(resource_type);
CREATE INDEX IF NOT EXISTS study_resources_created_at_idx ON study_resources(created_at DESC);
CREATE INDEX IF NOT EXISTS study_resources_tags_idx ON study_resources USING GIN(tags);

-- Enable RLS
ALTER TABLE study_resources ENABLE ROW LEVEL SECURITY;

-- Users can view their own study resources
CREATE POLICY "Users can view their own study resources"
ON study_resources FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own study resources
CREATE POLICY "Users can insert their own study resources"
ON study_resources FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own study resources
CREATE POLICY "Users can update their own study resources"
ON study_resources FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own study resources
CREATE POLICY "Users can delete their own study resources"
ON study_resources FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all study resources
CREATE POLICY "Service role can manage all study resources"
ON study_resources
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

