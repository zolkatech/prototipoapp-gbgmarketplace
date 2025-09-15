-- Insert some sample products for testing favorites functionality
-- First, ensure we have a test supplier profile

-- Insert a test supplier if it doesn't exist
INSERT INTO profiles (
  id,
  user_id, 
  email,
  full_name,
  business_name,
  user_type,
  city,
  state,
  bio,
  phone,
  whatsapp,
  avatar_url
) VALUES (
  '9a123288-3dae-4683-914b-06969e67ec1d',
  '9a123288-3dae-4683-914b-06969e67ec1d',
  'fornecedor@test.com',
  'João Silva',
  'Zolka Equipamentos',
  'fornecedor',
  'Resende',
  'RJ',
  'Fornecedor especializado em equipamentos equinos de alta qualidade',
  '(24) 99999-9999',
  '24999999999',
  'https://api.dicebear.com/7.x/initials/svg?seed=Zolka'
) ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  bio = EXCLUDED.bio,
  city = EXCLUDED.city,
  state = EXCLUDED.state;

-- Insert some sample products
INSERT INTO products (
  id,
  supplier_id,
  name,
  description,
  price,
  original_price,
  discount_percentage,
  category,
  image_url,
  images,
  delivers,
  delivery_locations,
  installment_options
) VALUES 
(
  'ace0d6b4-5406-411a-8d2c-167a120c19e2',
  '9a123288-3dae-4683-914b-06969e67ec1d',
  'Partos de equinos',
  'Partos de equinos de alta qualidade, resistentes e duradouros.',
  149.96,
  199.96,
  25,
  'ferramenta',
  'https://source.unsplash.com/seed/equinos1/800x800?horse',
  ARRAY['https://source.unsplash.com/seed/equinos1/800x800?horse', 'https://source.unsplash.com/seed/equinos2/800x800?horseshoe'],
  true,
  ARRAY['Resende', 'Rio de Janeiro', 'São Paulo'],
  '{"max_installments": 3, "interest_free_installments": 3}'::jsonb
),
(
  'b1234567-8901-2345-6789-012345678901',
  '9a123288-3dae-4683-914b-06969e67ec1d',
  'Ferradura Premium em Aço',
  'Ferradura de aço forjado para cavalos, garantindo durabilidade e conforto.',
  89.90,
  120.00,
  25,
  'ferradura',
  'https://source.unsplash.com/seed/ferradura1/800x800?horseshoe',
  ARRAY['https://source.unsplash.com/seed/ferradura1/800x800?horseshoe'],
  true,
  ARRAY['Resende', 'Rio de Janeiro'],
  '{"max_installments": 3, "interest_free_installments": 3}'::jsonb
),
(
  'c2345678-9012-3456-7890-123456789012',
  '9a123288-3dae-4683-914b-06969e67ec1d',
  'Sela Western Couro Legítimo',
  'Sela western de couro legítimo, ideal para montaria e competições.',
  1299.90,
  1599.90,
  19,
  'sela',
  'https://source.unsplash.com/seed/sela1/800x800?saddle',
  ARRAY['https://source.unsplash.com/seed/sela1/800x800?saddle'],
  true,
  ARRAY['Resende', 'Rio de Janeiro', 'São Paulo', 'Minas Gerais'],
  '{"max_installments": 12, "interest_free_installments": 6}'::jsonb
),
(
  'd3456789-0123-4567-8901-234567890123',
  '9a123288-3dae-4683-914b-06969e67ec1d',
  'Serviço de Casqueamento',
  'Serviço profissional de casqueamento e cuidados com os cascos.',
  180.00,
  null,
  0,
  'servico',
  'https://source.unsplash.com/seed/casqueamento1/800x800?hoof',
  ARRAY['https://source.unsplash.com/seed/casqueamento1/800x800?hoof'],
  false,
  ARRAY['Resende', 'Volta Redonda', 'Barra Mansa'],
  '{"max_installments": 1, "interest_free_installments": 1}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price;