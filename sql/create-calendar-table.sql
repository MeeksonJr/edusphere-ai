-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  color TEXT,
  source TEXT,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own calendar events
CREATE POLICY "Users can view their own calendar events"
ON calendar_events FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own calendar events
CREATE POLICY "Users can insert their own calendar events"
ON calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own calendar events
CREATE POLICY "Users can update their own calendar events"
ON calendar_events FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own calendar events
CREATE POLICY "Users can delete their own calendar events"
ON calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all calendar events
CREATE POLICY "Service role can manage all calendar events"
ON calendar_events
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');
