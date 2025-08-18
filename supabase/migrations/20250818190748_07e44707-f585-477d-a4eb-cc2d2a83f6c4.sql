-- Create secure function to update avatar URL
CREATE OR REPLACE FUNCTION public.update_current_user_avatar(
  p_avatar_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    avatar_url = p_avatar_url,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$function$;