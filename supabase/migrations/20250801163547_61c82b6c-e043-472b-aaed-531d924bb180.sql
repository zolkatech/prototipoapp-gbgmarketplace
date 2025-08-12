-- Add new columns to products table for multiple images, discount, and delivery
ALTER TABLE public.products 
ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN discount_percentage INTEGER DEFAULT 0,
ADD COLUMN original_price NUMERIC,
ADD COLUMN delivery_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN delivers BOOLEAN DEFAULT true;

-- Update existing products to move current image_url to images array
UPDATE public.products 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' THEN ARRAY[image_url]
  ELSE ARRAY[]::TEXT[]
END;