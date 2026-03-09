-- Phase 3F Migration Script
-- Adds Support for Interactive Dashboard & Personalization

-- 1. Create `user_dashboard_preferences` table
CREATE TABLE IF NOT EXISTS public.user_dashboard_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    layout_config JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dashboard preferences"
    ON public.user_dashboard_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dashboard preferences"
    ON public.user_dashboard_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboard preferences"
    ON public.user_dashboard_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. Create `learning_analytics` table
CREATE TABLE IF NOT EXISTS public.learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic TEXT NOT NULL,
    time_spent_minutes INTEGER DEFAULT 0 NOT NULL,
    mastery_score INTEGER DEFAULT 0 NOT NULL CHECK (mastery_score >= 0 AND mastery_score <= 100),
    last_studied TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure users don't have duplicate analytics for the same topic
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_analytics_user_topic ON public.learning_analytics (user_id, topic);

ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning analytics"
    ON public.learning_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning analytics"
    ON public.learning_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning analytics"
    ON public.learning_analytics FOR UPDATE
    USING (auth.uid() = user_id);

-- Note: The `notifications` table already exists, so we don't need to create it again.

-- Function to update `updated_at` column for user_dashboard_preferences
CREATE OR REPLACE FUNCTION update_user_dashboard_preferences_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_dashboard_preferences_updated_at
    BEFORE UPDATE ON public.user_dashboard_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_dashboard_preferences_updated_at_column();
