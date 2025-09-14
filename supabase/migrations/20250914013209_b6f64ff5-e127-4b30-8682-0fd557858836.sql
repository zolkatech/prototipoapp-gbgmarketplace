-- Add subscription plan field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_plan text DEFAULT 'gratuito' CHECK (subscription_plan IN ('gratuito', 'pro'));