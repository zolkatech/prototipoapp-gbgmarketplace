-- Update policy to allow INSERTs by suppliers on client_appointments
ALTER POLICY "Suppliers can manage own appointments"
ON public.client_appointments
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = client_appointments.supplier_id
      AND p.user_id = auth.uid()
      AND p.user_type = 'fornecedor'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = client_appointments.supplier_id
      AND p.user_id = auth.uid()
      AND p.user_type = 'fornecedor'
  )
);
