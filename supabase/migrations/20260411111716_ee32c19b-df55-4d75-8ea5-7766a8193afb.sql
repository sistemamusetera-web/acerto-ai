
-- Create editais storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('editais', 'editais', false);

-- Users can upload their own files
CREATE POLICY "Users can upload editais"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'editais' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own files
CREATE POLICY "Users can view own editais"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'editais' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files
CREATE POLICY "Users can delete own editais"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'editais' AND auth.uid()::text = (storage.foldername(name))[1]);
