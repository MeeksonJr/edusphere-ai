-- Fix storage RLS policies for course-media bucket
-- This allows users to upload to {user_id}/resources/ folder structure

-- Drop existing policies if they exist (for course-media bucket)
DROP POLICY IF EXISTS "Users can upload course media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their course media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their course media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view course media" ON storage.objects;

-- New policies that allow user-specific folders
-- Allow authenticated users to upload course media in their user folder
-- Path structure: {user_id}/resources/{filename} or {user_id}/{filename}
CREATE POLICY "Users can upload course media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their course media
CREATE POLICY "Users can update their course media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their course media
CREATE POLICY "Users can delete their course media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to course media
CREATE POLICY "Public can view course media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-media');

