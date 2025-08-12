-- Adicionar coluna para opções de parcelamento na tabela products
ALTER TABLE public.products 
ADD COLUMN installment_options jsonb DEFAULT '{"max_installments": 3, "interest_free_installments": 3}'::jsonb;