-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) VALUES ('product-videos', 'product-videos', true);

-- Create policies for video uploads
CREATE POLICY "Video uploads are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-videos');

CREATE POLICY "Users can upload their own videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-videos' AND auth.uid()::text = (storage.foldername(name))[1]);