-- 🧪 SUPABASE STORAGE TEST & CLEANUP
-- Run this to verify your storage setup is working

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'violation-photos';

-- Check existing policies (should show the policies we created)
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- If you need to recreate policies (run only if having issues):
-- DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;

-- Then recreate them:
-- CREATE POLICY "Users can upload photos" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'violation-photos');

-- CREATE POLICY "Public can view photos" ON storage.objects
-- FOR SELECT TO public
-- USING (bucket_id = 'violation-photos');