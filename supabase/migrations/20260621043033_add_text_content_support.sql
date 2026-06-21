-- Add content_type and text_content columns to content_files table
ALTER TABLE public.content_files 
ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'file' CHECK (content_type IN ('file', 'text')),
ADD COLUMN IF NOT EXISTS text_content text;

-- Update the file_type check constraint to allow null for text content
ALTER TABLE public.content_files DROP CONSTRAINT IF EXISTS content_files_file_type_check;
ALTER TABLE public.content_files ADD CONSTRAINT content_files_file_type_check 
  CHECK (file_type IS NULL OR file_type IN ('pdf', 'image'));

-- Make file_url nullable for text content
ALTER TABLE public.content_files ALTER COLUMN file_url DROP NOT NULL;