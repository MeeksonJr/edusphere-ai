-- ============================================
-- Marketplace Architecture — Future-Ready Tables
-- ============================================

-- 1. Course marketplace listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  preview_modules INTEGER DEFAULT 1,
  total_enrollments INTEGER DEFAULT 0,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_listings_seller_idx ON marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_status_idx ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS marketplace_listings_category_idx ON marketplace_listings(category);
CREATE INDEX IF NOT EXISTS marketplace_listings_tags_idx ON marketplace_listings USING GIN(tags);
CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx ON marketplace_listings(created_at DESC);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published marketplace listings"
ON marketplace_listings FOR SELECT
USING (status = 'published' OR auth.uid() = seller_id);

CREATE POLICY "Sellers can manage own listings"
ON marketplace_listings FOR ALL
USING (auth.uid() = seller_id);

-- 2. Course reviews
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_review_per_listing UNIQUE (listing_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS course_reviews_listing_idx ON course_reviews(listing_id);
CREATE INDEX IF NOT EXISTS course_reviews_reviewer_idx ON course_reviews(reviewer_id);

ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
ON course_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can manage own reviews"
ON course_reviews FOR ALL
USING (auth.uid() = reviewer_id);

-- 3. Course enrollments (marketplace purchases / free enrollments)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_pct NUMERIC(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,
  amount_paid_cents INTEGER DEFAULT 0,
  CONSTRAINT unique_enrollment UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS course_enrollments_user_idx ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS course_enrollments_listing_idx ON course_enrollments(listing_id);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
ON course_enrollments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll themselves"
ON course_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress"
ON course_enrollments FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Creator payouts tracking
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method TEXT,
  reference_id TEXT,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS creator_payouts_creator_idx ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS creator_payouts_status_idx ON creator_payouts(status);

ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own payouts"
ON creator_payouts FOR SELECT
USING (auth.uid() = creator_id);

-- 5. Service role policies for all marketplace tables
CREATE POLICY "Service role manages marketplace_listings"
ON marketplace_listings
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages course_reviews"
ON course_reviews
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages course_enrollments"
ON course_enrollments
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages creator_payouts"
ON creator_payouts
USING (current_setting('role') = 'service_role' OR auth.jwt() ->> 'role' = 'service_role');
