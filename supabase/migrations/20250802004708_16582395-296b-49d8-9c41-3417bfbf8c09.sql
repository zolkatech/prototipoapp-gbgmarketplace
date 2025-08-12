-- Primeiro, vamos verificar se o trigger existe e criá-lo se necessário
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Agora vamos criar um perfil para o usuário que já existe mas não tem perfil
-- Baseado nos dados da network request, o user_id é: 687b046c-6eb8-4718-bfc9-590011f82970
INSERT INTO public.profiles (user_id, email, full_name, user_type)
SELECT 
  '687b046c-6eb8-4718-bfc9-590011f82970',
  'veronezelc6@gmail.com',
  'Lucas Veroneze Ramalho Resende',
  'fornecedor'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '687b046c-6eb8-4718-bfc9-590011f82970'
);