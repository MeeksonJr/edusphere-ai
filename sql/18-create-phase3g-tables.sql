-- Phase 3G: Parent & Teacher Portals Database Tables

-- 1. Add account_type to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'student' CHECK (account_type IN ('student', 'teacher', 'parent'));

-- 2. Create tables
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'linked', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(parent_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.classroom_students (
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (classroom_id, student_id)
);


-- 3. Enable RLS
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;


-- 4. Policies for parent_student_links
-- Drop policies if they exist to be safe when rerunning
DROP POLICY IF EXISTS "Parents can view their links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can view links directed at them" ON public.parent_student_links;
DROP POLICY IF EXISTS "Parents can request links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can update their links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Parents can delete their links" ON public.parent_student_links;
DROP POLICY IF EXISTS "Students can delete their links" ON public.parent_student_links;

CREATE POLICY "Parents can view their links" ON public.parent_student_links
    FOR SELECT USING (auth.uid() = parent_id);
    
CREATE POLICY "Students can view links directed at them" ON public.parent_student_links
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Parents can request links" ON public.parent_student_links
    FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Students can update their links" ON public.parent_student_links
    FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Parents can delete their links" ON public.parent_student_links
    FOR DELETE USING (auth.uid() = parent_id);

CREATE POLICY "Students can delete their links" ON public.parent_student_links
    FOR DELETE USING (auth.uid() = student_id);


-- 5. Policies for classrooms
DROP POLICY IF EXISTS "Teachers can view their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can create classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can delete their own classrooms" ON public.classrooms;

CREATE POLICY "Teachers can view their own classrooms" ON public.classrooms
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view enrolled classrooms" ON public.classrooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classroom_students
            WHERE classroom_students.classroom_id = classrooms.id
            AND classroom_students.student_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can create classrooms" ON public.classrooms
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own classrooms" ON public.classrooms
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classrooms" ON public.classrooms
    FOR DELETE USING (auth.uid() = teacher_id);


-- 6. Policies for classroom_students
DROP POLICY IF EXISTS "Teachers can view their students" ON public.classroom_students;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.classroom_students;
DROP POLICY IF EXISTS "Students can join classrooms" ON public.classroom_students;
DROP POLICY IF EXISTS "Teachers or students can remove enrollments" ON public.classroom_students;

CREATE POLICY "Teachers can view their students" ON public.classroom_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE classrooms.id = classroom_students.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own enrollments" ON public.classroom_students
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can join classrooms" ON public.classroom_students
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers or students can remove enrollments" ON public.classroom_students
    FOR DELETE USING (
        auth.uid() = student_id OR
        EXISTS (
            SELECT 1 FROM public.classrooms
            WHERE classrooms.id = classroom_students.classroom_id
            AND classrooms.teacher_id = auth.uid()
        )
    );
