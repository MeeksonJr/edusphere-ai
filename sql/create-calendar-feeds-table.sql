-- Create calendar_feeds table to persist imported feed URLs
CREATE TABLE IF NOT EXISTS calendar_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Imported Calendar',
  url TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on user_id + url to avoid duplicate feeds
ALTER TABLE calendar_feeds ADD CONSTRAINT calendar_feeds_user_url_unique UNIQUE (user_id, url);

-- Enable RLS
ALTER TABLE calendar_feeds ENABLE ROW LEVEL SECURITY;

-- Users can view their own feeds
CREATE POLICY "Users can view their own calendar feeds"
ON calendar_feeds FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own feeds
CREATE POLICY "Users can insert their own calendar feeds"
ON calendar_feeds FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own feeds
CREATE POLICY "Users can update their own calendar feeds"
ON calendar_feeds FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own feeds
CREATE POLICY "Users can delete their own calendar feeds"
ON calendar_feeds FOR DELETE
USING (auth.uid() = user_id);
