-- Create ai_chats table
CREATE TABLE IF NOT EXISTS ai_chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS ai_chats_user_id_idx ON ai_chats(user_id);
CREATE INDEX IF NOT EXISTS ai_chats_created_at_idx ON ai_chats(created_at DESC);

-- Enable RLS
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Users can view their own chats
CREATE POLICY "Users can view their own chats"
ON ai_chats FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own chats
CREATE POLICY "Users can insert their own chats"
ON ai_chats FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own chats
CREATE POLICY "Users can update their own chats"
ON ai_chats FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own chats
CREATE POLICY "Users can delete their own chats"
ON ai_chats FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all chats
CREATE POLICY "Service role can manage all chats"
ON ai_chats
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

