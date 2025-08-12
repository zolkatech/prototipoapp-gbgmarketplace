-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category text NOT NULL DEFAULT 'ferramenta';

-- Add check constraint for valid categories
ALTER TABLE public.products 
ADD CONSTRAINT products_category_check 
CHECK (category IN ('ferradura', 'grosa', 'acessorio', 'ferramenta', 'cravo', 'sela', 'freio', 'estribo', 'outros'));