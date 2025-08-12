-- Criar perfil para o usuário existente que não tem perfil
INSERT INTO public.profiles (
  user_id, 
  email, 
  full_name, 
  user_type
)
VALUES (
  '2cbcccbb-286b-42df-a925-b01bb1703d33',
  'luquinha.vrr@gmail.com',
  'Teste Cliente',
  'cliente'
)
ON CONFLICT (user_id) DO NOTHING;