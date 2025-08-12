-- Criar tabela para curtidas em produtos
CREATE TABLE IF NOT EXISTS public.product_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Criar tabela para comentários em produtos
CREATE TABLE IF NOT EXISTS public.product_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_comments ENABLE ROW LEVEL SECURITY;

-- Policies para curtidas
CREATE POLICY "Users can view all likes" ON public.product_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own likes" ON public.product_likes
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own likes" ON public.product_likes
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policies para comentários
CREATE POLICY "Users can view all comments" ON public.product_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" ON public.product_comments
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON public.product_comments
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own comments" ON public.product_comments
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_product_comments_updated_at
  BEFORE UPDATE ON public.product_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();