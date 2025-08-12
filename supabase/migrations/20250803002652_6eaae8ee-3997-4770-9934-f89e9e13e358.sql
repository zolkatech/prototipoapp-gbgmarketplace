-- Verificar e atualizar a estrutura da tabela profiles para garantir compatibilidade
-- Esta migração garante que a tabela profiles tenha todas as colunas necessárias

-- Adicionar coluna specialties se não existir (como precaução)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'specialties' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN specialties TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Verificar se existe algum perfil sem user_id válido
UPDATE public.profiles 
SET specialties = COALESCE(specialties, '{}')
WHERE specialties IS NULL;

-- Criar índice para melhor performance nas consultas de perfis
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- Verificar que a função handle_new_user está funcional
-- Recriar a função para garantir que ela funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    user_type,
    cpf_cnpj,
    phone,
    city,
    specialties
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'user_type',
    NEW.raw_user_meta_data ->> 'cpf_cnpj',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'city',
    COALESCE(
      string_to_array(NEW.raw_user_meta_data ->> 'specialties', ','),
      '{}'::TEXT[]
    )
  );
  RETURN NEW;
END;
$$;