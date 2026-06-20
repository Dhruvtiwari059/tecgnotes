-- Security Fix: is_admin() function
-- Problem: SECURITY DEFINER function with mutable search_path allows search_path injection
-- Solution: Set search_path to empty, force fully qualified table references
-- Using CREATE OR REPLACE to avoid dependency issues

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$;

-- Security Fix: feedback table INSERT policy
-- Problem: Anonymous users can insert feedback without restriction, enabling spam
-- Solution: Require authentication. Authenticated users can submit feedback.

DROP POLICY IF EXISTS "anon_insert_feedback" ON public.feedback;

DROP POLICY IF EXISTS "authenticated_insert_feedback" ON public.feedback;
CREATE POLICY "authenticated_insert_feedback" ON public.feedback
  FOR INSERT TO authenticated WITH CHECK (true);

-- Remove SELECT access to feedback from anon/users (only admins should see it)
DROP POLICY IF EXISTS "anon_select_feedback" ON public.feedback;

DROP POLICY IF EXISTS "admin_select_feedback" ON public.feedback;
CREATE POLICY "admin_select_feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.is_admin());