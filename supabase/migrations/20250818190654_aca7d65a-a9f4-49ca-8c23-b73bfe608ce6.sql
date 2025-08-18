-- Create secure function to update user profile
CREATE OR REPLACE FUNCTION public.update_current_user_profile(
  p_full_name text DEFAULT NULL,
  p_business_name text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_whatsapp text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_instagram text DEFAULT NULL,
  p_cep text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(p_full_name, full_name),
    business_name = COALESCE(p_business_name, business_name),
    bio = COALESCE(p_bio, bio),
    city = COALESCE(p_city, city),
    state = COALESCE(p_state, state),
    address = COALESCE(p_address, address),
    phone = COALESCE(p_phone, phone),
    whatsapp = COALESCE(p_whatsapp, whatsapp),
    website = COALESCE(p_website, website),
    instagram = COALESCE(p_instagram, instagram),
    cep = COALESCE(p_cep, cep),
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$function$;