-- Create course_analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'complete', 'quiz', 'pause', 'seek', 'bookmark', 'note', 'resource_click')),
  event_data JSONB DEFAULT '{}', -- Additional event-specific data
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_analytics_course_id_idx ON course_analytics(course_id);
CREATE INDEX IF NOT EXISTS course_analytics_user_id_idx ON course_analytics(user_id);
CREATE INDEX IF NOT EXISTS course_analytics_event_type_idx ON course_analytics(event_type);
CREATE INDEX IF NOT EXISTS course_analytics_timestamp_idx ON course_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS course_analytics_course_user_idx ON course_analytics(course_id, user_id);

-- Enable RLS
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
ON course_analytics FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own analytics
CREATE POLICY "Users can insert their own analytics"
ON course_analytics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all analytics
CREATE POLICY "Service role can manage all analytics"
ON course_analytics
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

