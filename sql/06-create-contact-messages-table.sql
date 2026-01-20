-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS contact_messages_user_id_idx ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages(status);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_email_idx ON contact_messages(email);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own contact messages
CREATE POLICY "Users can view their own contact messages"
ON contact_messages FOR SELECT
USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Users can insert contact messages (including anonymous)
CREATE POLICY "Users can insert contact messages"
ON contact_messages FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Service role can manage all contact messages
CREATE POLICY "Service role can manage all contact messages"
ON contact_messages
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

