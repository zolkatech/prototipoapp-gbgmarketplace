-- Fix RLS policies for reviews table to avoid permission issues with profiles table

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Clients can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

-- Create new policies that use auth.uid() directly instead of checking profiles table
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Review authors can update own reviews"
ON reviews FOR UPDATE
USING (
  client_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);