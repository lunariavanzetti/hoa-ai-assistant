-- 🗄️ SUPABASE STORAGE SETUP
-- Run this in your Supabase SQL Editor to create the storage bucket for photo uploads

-- Create the violation-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'violation-photos',
  'violation-photos', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'violation-photos');

-- Create storage policy for public read access
CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'violation-photos');

-- Create storage policy for users to update their own photos
CREATE POLICY "Users can update their photos" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'violation-photos');

-- Create storage policy for users to delete their own photos
CREATE POLICY "Users can delete their photos" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'violation-photos');