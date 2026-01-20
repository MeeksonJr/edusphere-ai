-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  subject TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed')),
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS assignments_user_id_idx ON assignments(user_id);
CREATE INDEX IF NOT EXISTS assignments_status_idx ON assignments(status);
CREATE INDEX IF NOT EXISTS assignments_due_date_idx ON assignments(due_date);
CREATE INDEX IF NOT EXISTS assignments_subject_idx ON assignments(subject);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assignments
CREATE POLICY "Users can view their own assignments"
ON assignments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own assignments
CREATE POLICY "Users can insert their own assignments"
ON assignments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own assignments
CREATE POLICY "Users can update their own assignments"
ON assignments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own assignments
CREATE POLICY "Users can delete their own assignments"
ON assignments FOR DELETE
USING (auth.uid() = user_id);

-- Service role can manage all assignments
CREATE POLICY "Service role can manage all assignments"
ON assignments
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

