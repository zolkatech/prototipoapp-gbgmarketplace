-- Add unique constraint to prevent multiple reviews from same user to same supplier
ALTER TABLE reviews 
ADD CONSTRAINT unique_client_supplier_review 
UNIQUE (client_id, supplier_id);