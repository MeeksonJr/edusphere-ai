-- Create course_resources table
CREATE TABLE IF NOT EXISTS course_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slide_id TEXT, -- Optional - for slide-specific resources
  resource_type TEXT NOT NULL CHECK (resource_type IN ('link', 'video', 'article', 'book', 'paper', 'documentation', 'tool')),
  title TEXT NOT NULL,
  url TEXT,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_resources_course_id_idx ON course_resources(course_id);
CREATE INDEX IF NOT EXISTS course_resources_slide_id_idx ON course_resources(slide_id);
CREATE INDEX IF NOT EXISTS course_resources_resource_type_idx ON course_resources(resource_type);

-- Enable RLS
ALTER TABLE course_resources ENABLE ROW LEVEL SECURITY;

-- Users can view resources for their own courses
CREATE POLICY "Users can view resources for their own courses"
ON course_resources FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_resources.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can insert resources for their own courses
CREATE POLICY "Users can insert resources for their own courses"
ON course_resources FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_resources.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can update resources for their own courses
CREATE POLICY "Users can update resources for their own courses"
ON course_resources FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_resources.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can delete resources for their own courses
CREATE POLICY "Users can delete resources for their own courses"
ON course_resources FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_resources.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Service role can manage all resources
CREATE POLICY "Service role can manage all resources"
ON course_resources
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

