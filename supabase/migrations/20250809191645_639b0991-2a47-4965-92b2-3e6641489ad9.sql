
-- 1) Enums
create type public.payment_method as enum ('pix','dinheiro','cartao','boleto');
create type public.expense_category as enum ('combustivel_deslocamento','material','alimentacao','impostos','outros');

-- 2) Ampliar tabela de vendas (sales)
alter table public.sales
  add column payment_method public.payment_method,
  add column supplier_client_id uuid,
  add column appointment_id uuid;

alter table public.sales
  add constraint sales_supplier_client_id_fkey
  foreign key (supplier_client_id) references public.supplier_clients(id) on delete set null;

alter table public.sales
  add constraint sales_appointment_id_fkey
  foreign key (appointment_id) references public.client_appointments(id) on delete set null;

-- 3) Tabela de despesas
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null,
  category public.expense_category not null,
  amount numeric not null check (amount >= 0),
  description text,
  expense_date timestamptz not null default now(),
  sale_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expenses
  add constraint expenses_supplier_id_fkey
  foreign key (supplier_id) references public.profiles(id) on delete cascade;

alter table public.expenses
  add constraint expenses_sale_id_fkey
  foreign key (sale_id) references public.sales(id) on delete set null;

create index expenses_supplier_id_idx on public.expenses (supplier_id);
create index expenses_expense_date_idx on public.expenses (expense_date);

-- 4) Configurações financeiras por fornecedor (taxa de imposto)
create table public.supplier_financial_settings (
  supplier_id uuid primary key,
  tax_rate numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.supplier_financial_settings
  add constraint supplier_financial_settings_supplier_id_fkey
  foreign key (supplier_id) references public.profiles(id) on delete cascade;

-- 5) Row Level Security
alter table public.expenses enable row level security;
alter table public.supplier_financial_settings enable row level security;

create policy "Suppliers can manage own expenses"
on public.expenses
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = expenses.supplier_id
      and p.user_id = auth.uid()
      and p.user_type = 'fornecedor'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = expenses.supplier_id
      and p.user_id = auth.uid()
      and p.user_type = 'fornecedor'
  )
);

create policy "Suppliers can manage own financial settings"
on public.supplier_financial_settings
for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = supplier_financial_settings.supplier_id
      and p.user_id = auth.uid()
      and p.user_type = 'fornecedor'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = supplier_financial_settings.supplier_id
      and p.user_id = auth.uid()
      and p.user_type = 'fornecedor'
  )
);

-- 6) Triggers para updated_at
create trigger set_timestamp_expenses
before update on public.expenses
for each row execute procedure public.update_updated_at_column();

create trigger set_timestamp_supplier_financial_settings
before update on public.supplier_financial_settings
for each row execute procedure public.update_updated_at_column();

-- 7) Índices úteis em sales
create index sales_supplier_id_created_at_idx on public.sales (supplier_id, created_at);
create index sales_payment_method_idx on public.sales (payment_method);
