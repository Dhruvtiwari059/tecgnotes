/*
# Fix file_type check constraint to include 'text'

1. Changes
- Drop the existing check constraint `content_files_file_type_check`
- Add new check constraint that includes 'text' as a valid file_type value
- Allowed values: 'pdf', 'image', 'file', 'text'
*/