-- Criar políticas RLS para o bucket product-images

-- Política para permitir que fornecedores façam upload de suas próprias imagens de produtos
CREATE POLICY "Suppliers can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'fornecedor'
  )
);

-- Política para permitir que fornecedores vejam suas próprias imagens de produtos
CREATE POLICY "Suppliers can view their own product images" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'fornecedor'
  )
);

-- Política para permitir que fornecedores atualizem suas próprias imagens de produtos
CREATE POLICY "Suppliers can update their own product images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'fornecedor'
  )
);

-- Política para permitir que fornecedores deletem suas próprias imagens de produtos
CREATE POLICY "Suppliers can delete their own product images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'fornecedor'
  )
);

-- Política para permitir que todos vejam imagens de produtos (necessário para o marketplace)
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');