-- Create storage buckets for file uploads
-- Note: This requires running in Supabase SQL Editor with proper permissions

-- Create avatars bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create course-media bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-media', 'course-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Storage policies for course-media bucket
-- Allow authenticated users to upload course media for their courses
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

