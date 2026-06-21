-- Storage bucket for file uploads
-- Note: Storage bucket creation is done via Supabase dashboard or API
-- Here we just prepare the table structure

-- Table: content_files
-- Stores uploaded PDFs and images for Notes, PYQ, DSA, and Placement sections
CREATE TABLE IF NOT EXISTS public.content_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('notes', 'pyq', 'dsa', 'placement')),
  subject_name text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf', 'image')),
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now(),
  
  -- For notes/pyq: link to specific subject
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  
  -- For notes: unit number
  unit_number integer,
  
  -- For pyq: year of question paper
  pyq_year text,
  
  -- For pyq: answer PDF URL (optional)
  answer_pdf_url text,
  
  -- For dsa: notes PDF and questions PDF are separate fields
  is_notes_pdf boolean DEFAULT false,
  is_questions_pdf boolean DEFAULT false,
  
  -- For placement: company and category
  company text,
  category text
);

ALTER TABLE public.content_files ENABLE ROW LEVEL SECURITY;

-- Index for faster queries by section
CREATE INDEX IF NOT EXISTS idx_content_files_section ON public.content_files(section);
CREATE INDEX IF NOT EXISTS idx_content_files_subject ON public.content_files(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_files_subject_name ON public.content_files(subject_name);

-- RLS Policies: Public read for all, admin-only write
DROP POLICY IF EXISTS "public_select_content_files" ON public.content_files;
CREATE POLICY "public_select_content_files" ON public.content_files
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_content_files" ON public.content_files;
CREATE POLICY "admin_insert_content_files" ON public.content_files
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_content_files" ON public.content_files;
CREATE POLICY "admin_update_content_files" ON public.content_files
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_content_files" ON public.content_files;
CREATE POLICY "admin_delete_content_files" ON public.content_files
  FOR DELETE TO authenticated USING (public.is_admin());