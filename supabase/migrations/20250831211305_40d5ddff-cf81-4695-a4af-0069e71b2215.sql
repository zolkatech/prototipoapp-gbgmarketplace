-- Create secure RPC function for updating first_login status
CREATE OR REPLACE FUNCTION public.update_first_login_status(p_first_login boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    first_login = p_first_login,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$function$;