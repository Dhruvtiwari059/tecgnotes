-- Storage policies for notes-files bucket
-- Allow public read (bucket is public, but we still need the policy)
DROP POLICY IF EXISTS "public_read_notes_files" ON storage.objects;
CREATE POLICY "public_read_notes_files" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'notes-files');

-- Allow admin uploads
DROP POLICY IF EXISTS "admin_insert_notes_files" ON storage.objects;
CREATE POLICY "admin_insert_notes_files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'notes-files' AND public.is_admin());

-- Allow admin deletes
DROP POLICY IF EXISTS "admin_delete_notes_files" ON storage.objects;
CREATE POLICY "admin_delete_notes_files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'notes-files' AND public.is_admin());