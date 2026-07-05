/*
# Add DOCX and PPTX File Type Support

1. Changes to constraints
   - Update file_type check constraint to include 'docx' and 'pptx'
   - These are new file types for Word documents and PowerPoint presentations

2. Allowed file_type values now:
   - pdf (existing)
   - image (existing)
   - file (existing, generic)
   - text (existing, for text content)
   - docx (NEW)
   - pptx (NEW)

3. Security
   - No changes to RLS policies
   - Existing policies apply to new file types
*/

-- Drop and recreate the file_type check constraint with new values
ALTER TABLE content_files DROP CONSTRAINT IF EXISTS content_files_file_type_check;
ALTER TABLE content_files ADD CONSTRAINT content_files_file_type_check
  CHECK ((file_type = ANY (ARRAY['pdf'::text, 'image'::text, 'file'::text, 'text'::text, 'docx'::text, 'pptx'::text])));