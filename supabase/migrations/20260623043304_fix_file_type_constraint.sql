/*
# Fix file_type check constraint to include 'text'

1. Changes
- Drop the existing check constraint `content_files_file_type_check`
- Add new check constraint that includes 'text' as a valid file_type value
- Allowed values: 'pdf', 'image', 'file', 'text'
*/

-- Drop the existing check constraint
ALTER TABLE content_files DROP CONSTRAINT IF EXISTS content_files_file_type_check;

-- Add new check constraint that includes 'text' as a valid type
ALTER TABLE content_files ADD CONSTRAINT content_files_file_type_check
  CHECK (file_type IN ('pdf', 'image', 'file', 'text'));