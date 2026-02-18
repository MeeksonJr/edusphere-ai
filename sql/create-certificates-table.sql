-- Certificates table
-- Stores earned certificates for course completions, skill mastery, and achievements

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('course_completion', 'skill_mastery', 'achievement', 'custom')),
    verification_code TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates(user_id);
CREATE INDEX IF NOT EXISTS certificates_course_id_idx ON certificates(course_id);
CREATE INDEX IF NOT EXISTS certificates_verification_code_idx ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS certificates_type_idx ON certificates(type);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
ON certificates FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage certificates
CREATE POLICY "Service role manages certificates"
ON certificates FOR ALL
USING (true)
WITH CHECK (true);
