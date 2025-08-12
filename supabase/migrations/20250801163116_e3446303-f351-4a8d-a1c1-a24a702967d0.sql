-- Add contact fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN whatsapp TEXT,
ADD COLUMN address TEXT,
ADD COLUMN website TEXT,
ADD COLUMN instagram TEXT;