/*
# Add DOC and PPT File Types

1. Changes to file_type check constraint
   - Add 'doc' and 'ppt' as valid file types for legacy Word/PowerPoint files

2. Allowed file_type values now:
   - pdf
   - image
   - file
   - text
   - docx
   - pptx
   - doc (NEW)
   - ppt (NEW)
*/

ALTER TABLE content_files DROP CONSTRAINT IF EXISTS content_files_file_type_check;
ALTER TABLE content_files ADD CONSTRAINT content_files_file_type_check
  CHECK ((file_type = ANY (ARRAY['pdf'::text, 'image'::text, 'file'::text, 'text'::text, 'docx'::text, 'pptx'::text, 'doc'::text, 'ppt'::text])));