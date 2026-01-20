-- Create course_questions table
CREATE TABLE IF NOT EXISTS course_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slide_id TEXT, -- Optional - for slide-specific questions
  chapter_id TEXT, -- Optional - for chapter quizzes
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple-choice', 'true-false', 'short-answer', 'essay')),
  question TEXT NOT NULL,
  options JSONB, -- For multiple choice: ["option1", "option2", "option3", "option4"]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS course_questions_course_id_idx ON course_questions(course_id);
CREATE INDEX IF NOT EXISTS course_questions_slide_id_idx ON course_questions(slide_id);
CREATE INDEX IF NOT EXISTS course_questions_chapter_id_idx ON course_questions(chapter_id);
CREATE INDEX IF NOT EXISTS course_questions_question_type_idx ON course_questions(question_type);

-- Enable RLS
ALTER TABLE course_questions ENABLE ROW LEVEL SECURITY;

-- Users can view questions for their own courses
CREATE POLICY "Users can view questions for their own courses"
ON course_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_questions.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can insert questions for their own courses
CREATE POLICY "Users can insert questions for their own courses"
ON course_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_questions.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can update questions for their own courses
CREATE POLICY "Users can update questions for their own courses"
ON course_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_questions.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Users can delete questions for their own courses
CREATE POLICY "Users can delete questions for their own courses"
ON course_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_questions.course_id
    AND courses.user_id = auth.uid()
  )
);

-- Service role can manage all questions
CREATE POLICY "Service role can manage all questions"
ON course_questions
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

