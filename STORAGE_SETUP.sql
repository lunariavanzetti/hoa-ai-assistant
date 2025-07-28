-- Supabase Storage Setup for Photo Uploads
-- Run these commands in your Supabase SQL Editor

-- 1. Create the violation-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'violation-photos',
  'violation-photos', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for the bucket
-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'violation-photos');

-- Allow authenticated users to view photos
CREATE POLICY "Authenticated users can view photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'violation-photos');

-- Allow authenticated users to delete their photos
CREATE POLICY "Authenticated users can delete photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'violation-photos');

-- Allow public access to view photos (for sharing violation letters)
CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'violation-photos');