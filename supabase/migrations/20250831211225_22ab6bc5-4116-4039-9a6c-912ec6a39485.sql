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
$function$

-- Create secure RPC function for comprehensive profile updates
CREATE OR REPLACE FUNCTION public.update_current_user_profile_secure(
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
  p_cep text DEFAULT NULL,
  p_cpf_cnpj text DEFAULT NULL,
  p_specialties text[] DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Input validation
  IF p_email IS NOT NULL AND p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  IF p_phone IS NOT NULL AND p_phone != '' AND p_phone !~ '^\+?[0-9\s\-\(\)]+$' THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;
  
  IF p_website IS NOT NULL AND p_website != '' AND p_website !~ '^https?://' THEN
    RAISE EXCEPTION 'Website must start with http:// or https://';
  END IF;

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
  
  -- Log profile update for audit
  INSERT INTO public.audit_log (
    user_id,
    action,
    table_name,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    'UPDATE',
    'profiles', 
    jsonb_build_object('fields_updated', array_remove(array[
      CASE WHEN p_full_name IS NOT NULL THEN 'full_name' END,
      CASE WHEN p_business_name IS NOT NULL THEN 'business_name' END,
      CASE WHEN p_bio IS NOT NULL THEN 'bio' END,
      CASE WHEN p_city IS NOT NULL THEN 'city' END,
      CASE WHEN p_state IS NOT NULL THEN 'state' END,
      CASE WHEN p_address IS NOT NULL THEN 'address' END,
      CASE WHEN p_phone IS NOT NULL THEN 'phone' END,
      CASE WHEN p_whatsapp IS NOT NULL THEN 'whatsapp' END,
      CASE WHEN p_website IS NOT NULL THEN 'website' END,
      CASE WHEN p_instagram IS NOT NULL THEN 'instagram' END,
      CASE WHEN p_cep IS NOT NULL THEN 'cep' END,
      CASE WHEN p_cpf_cnpj IS NOT NULL THEN 'cpf_cnpj' END,
      CASE WHEN p_specialties IS NOT NULL THEN 'specialties' END
    ], NULL)),
    now()
  );
END;
$function$

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for audit log (only users can see their own logs)
CREATE POLICY "Users can view own audit logs" ON public.audit_log
FOR SELECT USING (auth.uid() = user_id);

-- Create function to validate CPF/CNPJ format
CREATE OR REPLACE FUNCTION public.validate_cpf_cnpj(input_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Remove non-digits
  input_text := regexp_replace(input_text, '[^0-9]', '', 'g');
  
  -- Check if it's a valid CPF (11 digits) or CNPJ (14 digits)
  IF length(input_text) = 11 THEN
    -- Basic CPF validation (not complete algorithm but format check)
    RETURN input_text ~ '^[0-9]{11}$' AND input_text != '11111111111' AND input_text != '00000000000';
  ELSIF length(input_text) = 14 THEN
    -- Basic CNPJ validation (format check)
    RETURN input_text ~ '^[0-9]{14}$' AND input_text != '11111111111111' AND input_text != '00000000000000';
  ELSE
    RETURN false;
  END IF;
END;
$function$

-- Create function to format phone numbers
CREATE OR REPLACE FUNCTION public.format_phone_number(phone_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
  -- Remove all non-digits first
  phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Format based on length
  IF length(phone_input) = 11 THEN
    -- Mobile: (XX) 9XXXX-XXXX
    RETURN format('(%s) %s%s-%s', 
      substring(phone_input, 1, 2),
      substring(phone_input, 3, 1),
      substring(phone_input, 4, 4),
      substring(phone_input, 8, 4)
    );
  ELSIF length(phone_input) = 10 THEN
    -- Landline: (XX) XXXX-XXXX
    RETURN format('(%s) %s-%s', 
      substring(phone_input, 1, 2),
      substring(phone_input, 3, 4),
      substring(phone_input, 7, 4)
    );
  ELSE
    -- Return original if format is not recognized
    RETURN phone_input;
  END IF;
END;
$function$