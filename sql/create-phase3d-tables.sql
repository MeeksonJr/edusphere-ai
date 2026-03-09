-- ============================================
-- Phase 3D: Productivity & Gamification Tables
-- ============================================

-- 1. Study Sessions (Pomodoro history)
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL DEFAULT 25,
    session_type TEXT NOT NULL DEFAULT 'work' CHECK (session_type IN ('work', 'short_break', 'long_break')),
    xp_earned INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    completed BOOLEAN NOT NULL DEFAULT true,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own study sessions"
    ON study_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
    ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
    ON study_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_completed_at ON study_sessions(completed_at DESC);

-- 2. Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN (
        'flashcard_review', 'quiz_complete', 'study_time',
        'course_progress', 'note_create', 'ai_chat', 'resource_add'
    )),
    title TEXT NOT NULL,
    description TEXT,
    target_value INTEGER NOT NULL DEFAULT 1,
    current_value INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    xp_reward INTEGER NOT NULL DEFAULT 25,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, challenge_date, challenge_type)
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily challenges"
    ON daily_challenges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily challenges"
    ON daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily challenges"
    ON daily_challenges FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_daily_challenges_user_date ON daily_challenges(user_id, challenge_date);

-- 3. Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    favicon_url TEXT,
    tags TEXT[] DEFAULT '{}',
    folder TEXT DEFAULT 'Unsorted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks"
    ON bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
    ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks"
    ON bookmarks FOR UPDATE
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
    ON bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_folder ON bookmarks(user_id, folder);
CREATE INDEX idx_bookmarks_tags ON bookmarks USING GIN(tags);
