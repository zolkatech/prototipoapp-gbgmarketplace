-- Add CEP field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN cep TEXT;