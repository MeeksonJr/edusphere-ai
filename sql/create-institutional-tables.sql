-- ===================================================
-- Phase 3C.3 — Institutional Tables
-- ===================================================

-- 1. Add institution columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS institution_role TEXT CHECK (institution_role IN ('student', 'teacher', 'admin')),
  ADD COLUMN IF NOT EXISTS institution_id UUID,
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- 2. Institutions
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'standard', 'premium')),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "institution_select" ON institutions FOR SELECT
  USING (id IN (SELECT institution_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "institution_insert" ON institutions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "institution_update" ON institutions FOR UPDATE
  USING (owner_id = auth.uid() OR id IN (
    SELECT institution_id FROM profiles WHERE id = auth.uid() AND institution_role = 'admin'
  ));

-- 3. Add FK to profiles
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_institution_fk
    FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  grade_level TEXT,
  description TEXT,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classes_select" ON classes FOR SELECT
  USING (
    institution_id IN (SELECT institution_id FROM profiles WHERE id = auth.uid())
    OR teacher_id = auth.uid()
    OR id IN (SELECT class_id FROM class_enrollments WHERE student_id = auth.uid())
  );

CREATE POLICY "classes_insert" ON classes FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "classes_update" ON classes FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "classes_delete" ON classes FOR DELETE
  USING (teacher_id = auth.uid());

-- 5. Class Enrollments
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE (class_id, student_id)
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_select" ON class_enrollments FOR SELECT
  USING (
    student_id = auth.uid()
    OR class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "enrollments_insert" ON class_enrollments FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "enrollments_delete" ON class_enrollments FOR DELETE
  USING (student_id = auth.uid() OR class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid()));

-- 6. Class Assignments
CREATE TABLE IF NOT EXISTS class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_points INTEGER DEFAULT 100,
  assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'quiz', 'exam', 'project', 'essay')),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE class_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_select" ON class_assignments FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = auth.uid())
  );

CREATE POLICY "assignments_insert" ON class_assignments FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "assignments_update" ON class_assignments FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE POLICY "assignments_delete" ON class_assignments FOR DELETE
  USING (teacher_id = auth.uid());

-- 7. Class Submissions
CREATE TABLE IF NOT EXISTS class_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES class_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  grade NUMERIC,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'late')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  graded_at TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id)
);

ALTER TABLE class_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "submissions_select" ON class_submissions FOR SELECT
  USING (
    student_id = auth.uid()
    OR assignment_id IN (SELECT id FROM class_assignments WHERE teacher_id = auth.uid())
  );

CREATE POLICY "submissions_insert" ON class_submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "submissions_update_student" ON class_submissions FOR UPDATE
  USING (student_id = auth.uid() AND status = 'submitted');

CREATE POLICY "submissions_update_teacher" ON class_submissions FOR UPDATE
  USING (assignment_id IN (SELECT id FROM class_assignments WHERE teacher_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_classes_institution ON classes(institution_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON class_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON class_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON profiles(institution_id);
