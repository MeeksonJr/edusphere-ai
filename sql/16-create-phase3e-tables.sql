-- Phase 3E Migration Script
-- Adds Support for Study Groups, AI Chat History, and Public Profiles

-- 1. Modify existing `profiles` table to support public profiles and unique usernames
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create an index to quickly lookup users by username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);


-- 2. Create `study_groups` table
CREATE TABLE IF NOT EXISTS study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for study_groups:
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view a group (to join it via invite code)
CREATE POLICY "Users can view all study groups"
    ON study_groups FOR SELECT
    USING (auth.role() = 'authenticated');

-- Authenticated users can create groups
CREATE POLICY "Users can create study groups"
    ON study_groups FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Only the creator can update the group
CREATE POLICY "Creators can update study groups"
    ON study_groups FOR UPDATE
    USING (auth.uid() = created_by);

-- Only the creator can delete the group
CREATE POLICY "Creators can delete study groups"
    ON study_groups FOR DELETE
    USING (auth.uid() = created_by);


-- 3. Create `study_group_members` table (Junction table)
CREATE TABLE IF NOT EXISTS study_group_members (
    group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- RLS for study_group_members
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

-- Users can see members of groups they are in, OR members can see anyone. 
-- Let's make it so authenticated users can see group memberships (so leaderboards work easily).
CREATE POLICY "Users can view group members"
    ON study_group_members FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can join a group (insert themselves)
CREATE POLICY "Users can join groups"
    ON study_group_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can leave a group
CREATE POLICY "Users can leave groups"
    ON study_group_members FOR DELETE
    USING (auth.uid() = user_id);


-- 4. Create `ai_chats` table to save AI Tutor history
CREATE TABLE IF NOT EXISTS ai_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- To group messages into a specific conversation thread
    message_role TEXT NOT NULL CHECK (message_role IN ('user', 'model', 'system', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index to quickly load a user's specific chat session
CREATE INDEX IF NOT EXISTS idx_ai_chats_session ON ai_chats(user_id, session_id);

-- RLS for ai_chats:
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;

-- Users can only view their own chat history
CREATE POLICY "Users can view their own ai chats"
    ON ai_chats FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only insert their own chat messages
CREATE POLICY "Users can insert their own ai chats"
    ON ai_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);


-- Function to update `updated_at` column for study_groups
CREATE OR REPLACE FUNCTION update_study_groups_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_groups_updated_at
    BEFORE UPDATE ON study_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_study_groups_updated_at_column();
