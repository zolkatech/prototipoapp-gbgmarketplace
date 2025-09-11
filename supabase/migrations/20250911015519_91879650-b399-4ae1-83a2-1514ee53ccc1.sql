-- Security Fix: Replace the problematic profiles_public view with a secure approach
-- The current view doesn't have RLS policies which is the security concern

-- First, drop the existing view
DROP VIEW IF EXISTS public.profiles_public;

-- Create a secure RLS-enabled table instead of a view
-- This table will be automatically populated via a trigger and have proper RLS
CREATE TABLE IF NOT EXISTS public.profiles_public (
  id uuid PRIMARY KEY,
  business_name text,
  bio text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.profiles_public ENABLE ROW LEVEL SECURITY;

-- Create policies for the public profiles table
-- Anyone can read public profiles (this is intended for public supplier profiles)
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles_public 
FOR SELECT 
USING (true);

-- Only authenticated users can see profiles (more secure alternative)
-- You can uncomment this and comment the above if you want more restrictions
-- CREATE POLICY "Public profiles are viewable by authenticated users" 
-- ON public.profiles_public 
-- FOR SELECT 
-- USING (auth.role() = 'authenticated');

-- Suppliers can update their own public profile data
CREATE POLICY "Suppliers can update their own public profile" 
ON public.profiles_public 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = profiles_public.id 
    AND p.user_id = auth.uid() 
    AND p.user_type = 'fornecedor'
));

-- System can insert public profiles
CREATE POLICY "System can insert public profiles" 
ON public.profiles_public 
FOR INSERT 
WITH CHECK (true);

-- Create function to sync profiles to profiles_public
CREATE OR REPLACE FUNCTION public.sync_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Only sync supplier profiles to public view
  IF NEW.user_type = 'fornecedor' THEN
    INSERT INTO public.profiles_public (id, business_name, bio, avatar_url, updated_at)
    VALUES (NEW.id, NEW.business_name, NEW.bio, NEW.avatar_url, NEW.updated_at)
    ON CONFLICT (id) 
    DO UPDATE SET
      business_name = EXCLUDED.business_name,
      bio = EXCLUDED.bio,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = EXCLUDED.updated_at;
  ELSE
    -- Remove from public profiles if user is not a supplier
    DELETE FROM public.profiles_public WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically sync profiles
DROP TRIGGER IF EXISTS sync_public_profile_trigger ON public.profiles;
CREATE TRIGGER sync_public_profile_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_profile();

-- Handle deletions
CREATE OR REPLACE FUNCTION public.sync_public_profile_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.profiles_public WHERE id = OLD.id;
  RETURN OLD;
END;
$function$;

DROP TRIGGER IF EXISTS sync_public_profile_delete_trigger ON public.profiles;
CREATE TRIGGER sync_public_profile_delete_trigger
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_public_profile_delete();

-- Populate the table with existing supplier data
INSERT INTO public.profiles_public (id, business_name, bio, avatar_url, updated_at)
SELECT id, business_name, bio, avatar_url, updated_at 
FROM public.profiles 
WHERE user_type = 'fornecedor'
ON CONFLICT (id) DO NOTHING;