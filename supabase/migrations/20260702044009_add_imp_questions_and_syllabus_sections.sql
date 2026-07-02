/*
# Add Imp Questions and Syllabus Sections

1. Changes to constraints
   - Update section check constraint to include 'imp_questions' and 'syllabus'
   - These are new content sections for important questions and syllabus content

2. Allowed section values now:
   - notes
   - pyq
   - dsa
   - placement
   - imp_questions (NEW)
   - syllabus (NEW)

3. Security
   - No changes to RLS policies, existing policies apply to new sections
   - All sections use the same anon + authenticated access as before
*/

-- Drop and recreate the section check constraint with new values
ALTER TABLE content_files DROP CONSTRAINT IF EXISTS content_files_section_check;
ALTER TABLE content_files ADD CONSTRAINT content_files_section_check
  CHECK ((section = ANY (ARRAY['notes'::text, 'pyq'::text, 'dsa'::text, 'placement'::text, 'imp_questions'::text, 'syllabus'::text])));