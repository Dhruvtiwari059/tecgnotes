/*
# TechNotes Schema Creation

1. New Tables
- `admin_users` - Stores whitelisted Gmail accounts that can access the admin panel
- `branches` - University branches (CS, IT, AIML)
- `years` - Academic years (1st, 2nd, 3rd, 4th)
- `semesters` - Semesters linked to year and branch
- `subjects` - Subjects linked to semester
- `syllabus_units` - Unit-wise syllabus content per subject
- `notes` - PDF notes per unit
- `pyq` - Previous Year Question Papers with answer PDFs
- `dsa_topics` - DSA topics with notes and practice questions
- `placement_topics` - Placement topics by company and category
- `feedback` - Student feedback form submissions
- `gemini_keys` - API keys for AI chatbot with rotation

2. Security
- Enable RLS on all tables
- Public data (branches, years, semesters, subjects, notes, pyq, dsa_topics, placement_topics, feedback) is readable by all
- admin_users and gemini_keys are admin-only
- Notes, pyq, and other content tables allow admin write via is_admin() function
- Non-admin users can read all content

3. Important Notes
- Foreign key relationships cascade properly
- Indexes on frequently queried columns
- is_admin() helper function checks if current user is an admin
*/

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table: admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  added_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_admins" ON public.admin_users;
CREATE POLICY "admin_select_admins" ON public.admin_users
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_admins" ON public.admin_users;
CREATE POLICY "admin_insert_admins" ON public.admin_users
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_admins" ON public.admin_users;
CREATE POLICY "admin_update_admins" ON public.admin_users
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_admins" ON public.admin_users;
CREATE POLICY "admin_delete_admins" ON public.admin_users
  FOR DELETE TO authenticated USING (public.is_admin());

-- Table: branches
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_branches" ON public.branches;
CREATE POLICY "anon_select_branches" ON public.branches FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_branches" ON public.branches;
CREATE POLICY "admin_insert_branches" ON public.branches FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_branches" ON public.branches;
CREATE POLICY "admin_update_branches" ON public.branches FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_branches" ON public.branches;
CREATE POLICY "admin_delete_branches" ON public.branches FOR DELETE TO authenticated USING (public.is_admin());

-- Table: years
CREATE TABLE IF NOT EXISTS public.years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_years" ON public.years;
CREATE POLICY "anon_select_years" ON public.years FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_years" ON public.years;
CREATE POLICY "admin_insert_years" ON public.years FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_years" ON public.years;
CREATE POLICY "admin_update_years" ON public.years FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_years" ON public.years;
CREATE POLICY "admin_delete_years" ON public.years FOR DELETE TO authenticated USING (public.is_admin());

-- Table: semesters
CREATE TABLE IF NOT EXISTS public.semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_id uuid NOT NULL REFERENCES public.years(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_semesters" ON public.semesters;
CREATE POLICY "anon_select_semesters" ON public.semesters FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_semesters" ON public.semesters;
CREATE POLICY "admin_insert_semesters" ON public.semesters FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_semesters" ON public.semesters;
CREATE POLICY "admin_update_semesters" ON public.semesters FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_semesters" ON public.semesters;
CREATE POLICY "admin_delete_semesters" ON public.semesters FOR DELETE TO authenticated USING (public.is_admin());

-- Table: subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id uuid NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  slug text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subjects" ON public.subjects;
CREATE POLICY "anon_select_subjects" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_subjects" ON public.subjects;
CREATE POLICY "admin_insert_subjects" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_subjects" ON public.subjects;
CREATE POLICY "admin_update_subjects" ON public.subjects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_subjects" ON public.subjects;
CREATE POLICY "admin_delete_subjects" ON public.subjects FOR DELETE TO authenticated USING (public.is_admin());

-- Table: syllabus_units
CREATE TABLE IF NOT EXISTS public.syllabus_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number integer NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.syllabus_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_syllabus_units" ON public.syllabus_units;
CREATE POLICY "anon_select_syllabus_units" ON public.syllabus_units FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_syllabus_units" ON public.syllabus_units;
CREATE POLICY "admin_insert_syllabus_units" ON public.syllabus_units FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_syllabus_units" ON public.syllabus_units;
CREATE POLICY "admin_update_syllabus_units" ON public.syllabus_units FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_syllabus_units" ON public.syllabus_units;
CREATE POLICY "admin_delete_syllabus_units" ON public.syllabus_units FOR DELETE TO authenticated USING (public.is_admin());

-- Table: notes
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_number integer NOT NULL,
  title text NOT NULL,
  pdf_url text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notes" ON public.notes;
CREATE POLICY "anon_select_notes" ON public.notes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_notes" ON public.notes;
CREATE POLICY "admin_insert_notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_notes" ON public.notes;
CREATE POLICY "admin_update_notes" ON public.notes FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_notes" ON public.notes;
CREATE POLICY "admin_delete_notes" ON public.notes FOR DELETE TO authenticated USING (public.is_admin());

-- Table: pyq
CREATE TABLE IF NOT EXISTS public.pyq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  year text NOT NULL,
  pdf_url text NOT NULL,
  answer_pdf_url text,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE public.pyq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_pyq" ON public.pyq;
CREATE POLICY "anon_select_pyq" ON public.pyq FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_pyq" ON public.pyq;
CREATE POLICY "admin_insert_pyq" ON public.pyq FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_pyq" ON public.pyq;
CREATE POLICY "admin_update_pyq" ON public.pyq FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_pyq" ON public.pyq;
CREATE POLICY "admin_delete_pyq" ON public.pyq FOR DELETE TO authenticated USING (public.is_admin());

-- Table: dsa_topics
CREATE TABLE IF NOT EXISTS public.dsa_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes_pdf_url text,
  questions_pdf_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dsa_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dsa_topics" ON public.dsa_topics;
CREATE POLICY "anon_select_dsa_topics" ON public.dsa_topics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_dsa_topics" ON public.dsa_topics;
CREATE POLICY "admin_insert_dsa_topics" ON public.dsa_topics FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_dsa_topics" ON public.dsa_topics;
CREATE POLICY "admin_update_dsa_topics" ON public.dsa_topics FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_dsa_topics" ON public.dsa_topics;
CREATE POLICY "admin_delete_dsa_topics" ON public.dsa_topics FOR DELETE TO authenticated USING (public.is_admin());

-- Table: placement_topics
CREATE TABLE IF NOT EXISTS public.placement_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  pdf_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.placement_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_placement_topics" ON public.placement_topics;
CREATE POLICY "anon_select_placement_topics" ON public.placement_topics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_placement_topics" ON public.placement_topics;
CREATE POLICY "admin_insert_placement_topics" ON public.placement_topics FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_placement_topics" ON public.placement_topics;
CREATE POLICY "admin_update_placement_topics" ON public.placement_topics FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_placement_topics" ON public.placement_topics;
CREATE POLICY "admin_delete_placement_topics" ON public.placement_topics FOR DELETE TO authenticated USING (public.is_admin());

-- Table: feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_feedback" ON public.feedback;
CREATE POLICY "anon_select_feedback" ON public.feedback FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_feedback" ON public.feedback;
CREATE POLICY "anon_insert_feedback" ON public.feedback FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_feedback" ON public.feedback;
CREATE POLICY "admin_update_feedback" ON public.feedback FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_feedback" ON public.feedback;
CREATE POLICY "admin_delete_feedback" ON public.feedback FOR DELETE TO authenticated USING (public.is_admin());

-- Table: gemini_keys
CREATE TABLE IF NOT EXISTS public.gemini_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gemini_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_select_gemini_keys" ON public.gemini_keys;
CREATE POLICY "admin_select_gemini_keys" ON public.gemini_keys FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "admin_insert_gemini_keys" ON public.gemini_keys;
CREATE POLICY "admin_insert_gemini_keys" ON public.gemini_keys FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_update_gemini_keys" ON public.gemini_keys;
CREATE POLICY "admin_update_gemini_keys" ON public.gemini_keys FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "admin_delete_gemini_keys" ON public.gemini_keys;
CREATE POLICY "admin_delete_gemini_keys" ON public.gemini_keys FOR DELETE TO authenticated USING (public.is_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_unit ON public.notes(subject_id, unit_number);
CREATE INDEX IF NOT EXISTS idx_pyq_subject ON public.pyq(subject_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_unit_subject ON public.syllabus_units(subject_id);
CREATE INDEX IF NOT EXISTS idx_semester_year_branch ON public.semesters(year_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_gemini_keys_active ON public.gemini_keys(is_active);
