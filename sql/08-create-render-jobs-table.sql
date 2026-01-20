-- Create render_jobs table
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  render_id TEXT, -- Remotion Lambda render ID or browser render identifier
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'rendering', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS render_jobs_course_id_idx ON render_jobs(course_id);
CREATE INDEX IF NOT EXISTS render_jobs_status_idx ON render_jobs(status);
CREATE INDEX IF NOT EXISTS render_jobs_render_id_idx ON render_jobs(render_id);
CREATE INDEX IF NOT EXISTS render_jobs_created_at_idx ON render_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view render jobs for their own courses
CREATE POLICY "Users can view render jobs for their courses"
ON render_jobs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = render_jobs.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Service role can manage all render jobs
CREATE POLICY "Service role can manage all render jobs"
ON render_jobs
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

