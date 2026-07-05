/*
# Update Storage Bucket Allowed Mime Types

1. Changes to notes-files storage bucket
   - Add support for Microsoft Office document mime types
   - Add docx, pptx, doc, ppt file types

2. New allowed mime types:
   - application/vnd.openxmlformats-officedocument.wordprocessingml.document (docx)
   - application/vnd.openxmlformats-officedocument.presentationml.presentation (pptx)
   - application/msword (doc)
   - application/vnd.ms-powerpoint (ppt)

3. Existing mime types retained:
   - application/pdf
   - image/png, image/jpeg, image/jpg, image/webp
*/

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.ms-powerpoint'
]
WHERE id = 'notes-files';