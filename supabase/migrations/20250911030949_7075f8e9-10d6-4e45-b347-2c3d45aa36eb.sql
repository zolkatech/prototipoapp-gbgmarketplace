-- Remove the old version of update_current_user_profile function to resolve overloading conflict
DROP FUNCTION IF EXISTS public.update_current_user_profile(p_full_name text, p_business_name text, p_bio text, p_city text, p_state text, p_address text, p_phone text, p_whatsapp text, p_website text, p_instagram text, p_cep text);

-- Ensure we have only the complete version with all parameters
CREATE OR REPLACE FUNCTION public.update_current_user_profile(
  p_full_name text DEFAULT NULL::text, 
  p_business_name text DEFAULT NULL::text, 
  p_bio text DEFAULT NULL::text, 
  p_city text DEFAULT NULL::text, 
  p_state text DEFAULT NULL::text, 
  p_address text DEFAULT NULL::text, 
  p_phone text DEFAULT NULL::text, 
  p_whatsapp text DEFAULT NULL::text, 
  p_website text DEFAULT NULL::text, 
  p_instagram text DEFAULT NULL::text, 
  p_cep text DEFAULT NULL::text, 
  p_cpf_cnpj text DEFAULT NULL::text, 
  p_specialties text[] DEFAULT NULL::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    cpf_cnpj = COALESCE(p_cpf_cnpj, cpf_cnpj),
    specialties = COALESCE(p_specialties, specialties),
    updated_at = now()
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;
END;
$function$;