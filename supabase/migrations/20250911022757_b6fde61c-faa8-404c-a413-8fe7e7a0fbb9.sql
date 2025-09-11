-- Remove a constraint existente de categoria
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;

-- Adiciona uma nova constraint que inclui todas as categorias de produtos e serviços
ALTER TABLE public.products ADD CONSTRAINT products_category_check 
CHECK (category IN (
  -- Categorias de produtos
  'servico', 'ferradura', 'grosa', 'acessorio', 'ferramenta', 'cravo', 'sela', 'freio', 'estribo', 'cuidados', 'outros',
  -- Categorias de serviços
  'ferrageamento', 'veterinario', 'dentista-equino', 'fisioterapia', 'quiropratia', 'acupuntura', 'exame-radiografico', 'ultrassom', 'treinamento', 'doma', 'transporte', 'pensao', 'tosquia', 'banho-tosa', 'casco-podologia', 'nutricao', 'reproducao', 'inseminacao', 'coleta-semen', 'exame-gestacao', 'parto-assistencia'
));