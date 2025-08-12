-- Restrict public access to sensitive personal data in profiles

-- 1) Drop overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- 2) Create safer policy: allow selecting rows for basic public info only (columns will be controlled via GRANTs)
CREATE POLICY "Public can view basic profile info"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- 3) Column-level privileges: revoke full read and only grant public columns
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, business_name, city, state, avatar_url, bio, website, instagram)
  ON public.profiles TO anon, authenticated;

-- 4) Full-profile access for the owner via RPC (bypasses column-level restrictions but filters by auth.uid())
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.*
  FROM public.profiles p
  WHERE p.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;
