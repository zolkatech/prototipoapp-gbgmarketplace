-- 1) Remove overly permissive public SELECT on profiles and create a safe public view

-- Remove existing public SELECT policy (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Public can view basic profile info'
  ) THEN
    EXECUTE 'DROP POLICY "Public can view basic profile info" ON public.profiles';
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own profile (idempotent safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Optional: allow users to insert their own profile (kept as-is if present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace a public view exposing only non-sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  business_name,
  bio,
  avatar_url
FROM public.profiles;

-- Grant select on the safe view to anon and authenticated
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- Create a stable function to get a single public profile by id (optional helper)
CREATE OR REPLACE FUNCTION public.get_public_profile(_id uuid)
RETURNS TABLE (
  id uuid,
  business_name text,
  bio text,
  avatar_url text
) AS $$
  SELECT p.id, p.business_name, p.bio, p.avatar_url
  FROM public.profiles p
  WHERE p.id = _id
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public';

-- Keep existing RPC for full self profile (already present per project context)
-- CREATE OR REPLACE FUNCTION public.get_current_user_profile() ...

-- Ensure no public SELECT policy remains on base table
-- (No SELECT policies created here; full reads should go through RPC or admin roles)
