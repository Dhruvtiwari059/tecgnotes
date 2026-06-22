-- 1. Fix feedback table: make email nullable and add IP tracking
ALTER TABLE feedback ALTER COLUMN email DROP NOT NULL;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS ip_address text;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_agent text;

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_feedback_ip_created ON feedback(ip_address, created_at);

-- Drop existing insert policy
DROP POLICY IF EXISTS authenticated_insert_feedback ON feedback;

-- Create new insert policy that allows both anonymous and authenticated users
CREATE POLICY "allow_insert_feedback" ON feedback FOR INSERT
  TO public WITH CHECK (true);

-- 2. Fix content_files: add default for file_type
ALTER TABLE content_files ALTER COLUMN file_type SET DEFAULT 'file';