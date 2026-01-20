-- Create course_slides table
CREATE TABLE IF NOT EXISTS course_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id UUID,
  slide_id UUID,
  slide_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  template_data JSONB,
  audio_url TEXT,
  audio_duration INTEGER, -- in seconds
  caption_data JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_slides_course_id_idx ON course_slides(course_id);
CREATE INDEX IF NOT EXISTS course_slides_chapter_id_idx ON course_slides(chapter_id);
CREATE INDEX IF NOT EXISTS course_slides_order_index_idx ON course_slides(course_id, order_index);

-- Enable RLS
ALTER TABLE course_slides ENABLE ROW LEVEL SECURITY;

-- Users can view slides for their own courses
CREATE POLICY "Users can view slides for their courses"
ON course_slides FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_slides.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can insert slides for their own courses
CREATE POLICY "Users can insert slides for their courses"
ON course_slides FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_slides.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can update slides for their own courses
CREATE POLICY "Users can update slides for their courses"
ON course_slides FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_slides.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can delete slides for their own courses
CREATE POLICY "Users can delete slides for their courses"
ON course_slides FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_slides.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Service role can manage all course slides
CREATE POLICY "Service role can manage all course slides"
ON course_slides
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

