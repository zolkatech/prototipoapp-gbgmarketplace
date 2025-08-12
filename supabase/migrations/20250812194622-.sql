-- Create a SECURITY DEFINER helper to avoid RLS permission issues when checking supplier ownership
create or replace function public.is_supplier_owned(_supplier_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = _supplier_id
      and p.user_id = auth.uid()
      and p.user_type = 'fornecedor'
  );
$$;

-- Update RLS policies to use the helper function instead of selecting from profiles directly
-- client_appointments
alter policy "Suppliers can manage own appointments"
  on public.client_appointments
  using (public.is_supplier_owned(supplier_id))
  with check (public.is_supplier_owned(supplier_id));

-- expenses
alter policy "Suppliers can manage own expenses"
  on public.expenses
  using (public.is_supplier_owned(supplier_id))
  with check (public.is_supplier_owned(supplier_id));

-- supplier_clients
alter policy "Suppliers can manage own clients"
  on public.supplier_clients
  using (public.is_supplier_owned(supplier_id));

-- supplier_financial_settings
alter policy "Suppliers can manage own financial settings"
  on public.supplier_financial_settings
  using (public.is_supplier_owned(supplier_id))
  with check (public.is_supplier_owned(supplier_id));

-- sales (manage and view)
alter policy "Suppliers can manage own sales"
  on public.sales
  using (public.is_supplier_owned(supplier_id));

alter policy "Suppliers can view own sales"
  on public.sales
  using (public.is_supplier_owned(supplier_id));

-- products (manage own products, keep public select policy as is)
alter policy "Suppliers can manage own products"
  on public.products
  using (public.is_supplier_owned(supplier_id))
  with check (public.is_supplier_owned(supplier_id));