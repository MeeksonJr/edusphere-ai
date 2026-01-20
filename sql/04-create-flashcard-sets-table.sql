-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  cards JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS flashcard_sets_user_id_idx ON flashcard_sets(user_id);
CREATE INDEX IF NOT EXISTS flashcard_sets_subject_idx ON flashcard_sets(subject);
CREATE INDEX IF NOT EXISTS flashcard_sets_created_at_idx ON flashcard_sets(created_at DESC);

-- Enable RLS
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;

-- Users can view their own flashcard sets
CREATE POLICY "Users can view their own flashcard sets"
ON flashcard_sets FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own flashcard sets
CREATE POLICY "Users can insert their own flashcard sets"
ON flashcard_sets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own flashcard sets
CREATE POLICY "Users can update their own flashcard sets"
ON flashcard_sets FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own flashcard sets
CREATE POLICY "Users can delete their own flashcard sets"
ON flashcard_sets FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all flashcard sets
CREATE POLICY "Service role can manage all flashcard sets"
ON flashcard_sets
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

