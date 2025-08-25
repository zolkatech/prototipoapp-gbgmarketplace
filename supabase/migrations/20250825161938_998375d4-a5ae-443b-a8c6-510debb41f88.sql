-- Adicionar campo para controlar primeiro login
ALTER TABLE public.profiles 
ADD COLUMN first_login boolean DEFAULT true;

-- Atualizar usuários existentes para marcar como não sendo primeiro login
UPDATE public.profiles 
SET first_login = false 
WHERE created_at < now();

-- Atualizar a função handle_new_user para não esperar mais os campos removidos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_type,
    phone,
    first_login
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'user_type',
    NEW.raw_user_meta_data ->> 'phone',
    true
  );
  RETURN NEW;
END;
$function$;