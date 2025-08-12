-- Add location and reminder fields, adjust default status, and add index for faster queries
ALTER TABLE public.client_appointments
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS reminder_email_sent_at timestamp with time zone;

-- Set a better default for status
ALTER TABLE public.client_appointments
  ALTER COLUMN status SET DEFAULT 'agendado';

-- Backfill null statuses to 'agendado' to keep consistency
UPDATE public.client_appointments
SET status = 'agendado'
WHERE status IS NULL;

-- Helpful index for supplier agenda views
CREATE INDEX IF NOT EXISTS idx_client_appointments_supplier_date
  ON public.client_appointments (supplier_id, appointment_date DESC);
