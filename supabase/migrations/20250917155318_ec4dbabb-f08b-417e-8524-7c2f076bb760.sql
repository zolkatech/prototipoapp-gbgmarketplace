-- Fix favorites table RLS policies to work correctly with user authentication
-- Drop existing policies that are causing permission errors
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;

-- Create new simplified policies that use auth.uid() directly
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = favorites.user_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = favorites.user_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = favorites.user_id 
    AND p.user_id = auth.uid()
  )
);

-- Also ensure we have proper foreign key constraints
ALTER TABLE public.favorites 
ADD CONSTRAINT fk_favorites_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.favorites 
ADD CONSTRAINT fk_favorites_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create unique constraint to prevent duplicate favorites
ALTER TABLE public.favorites 
ADD CONSTRAINT unique_user_product_favorite 
UNIQUE (user_id, product_id);