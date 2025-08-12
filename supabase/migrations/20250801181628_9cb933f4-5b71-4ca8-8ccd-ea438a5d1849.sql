-- Primeiro, vamos dropar a política existente que está causando o problema
DROP POLICY IF EXISTS "Users can create their own favorites" ON public.favorites;

-- Criar uma nova política corrigida que aceita o profile.id como user_id
CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (
  user_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

-- Também vamos corrigir as outras políticas para consistência
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (
  user_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (
  user_id IN (
    SELECT id 
    FROM profiles 
    WHERE user_id = auth.uid()
  )
);