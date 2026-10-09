-- ==============================================================================
-- AutoDrift: Supabase Storage Setup for Car Size Images
-- Bucket Name: 'car-size-images'
-- File size limit: 2MB (2,097,152 bytes)
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- ==============================================================================

-- 1. Create or update the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-size-images',
  'car-size-images',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Public car-size-images read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin car-size-images insert access" ON storage.objects;
DROP POLICY IF EXISTS "Admin car-size-images update access" ON storage.objects;
DROP POLICY IF EXISTS "Admin car-size-images delete access" ON storage.objects;

-- 3. Policy: Anyone can view/read images in the car-size-images bucket (Public access)
CREATE POLICY "Public car-size-images read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'car-size-images');

-- 4. Policy: Authenticated admins can upload images
CREATE POLICY "Admin car-size-images insert access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-size-images');

-- 5. Policy: Authenticated admins can update images
CREATE POLICY "Admin car-size-images update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'car-size-images')
WITH CHECK (bucket_id = 'car-size-images');

-- 6. Policy: Authenticated admins can delete images
CREATE POLICY "Admin car-size-images delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'car-size-images');
