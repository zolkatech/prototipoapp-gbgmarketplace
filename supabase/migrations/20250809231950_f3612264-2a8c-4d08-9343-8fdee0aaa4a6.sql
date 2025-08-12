
-- 1) Criar trigger para criar perfis automaticamente no signup
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Triggers de updated_at para tabelas com a coluna updated_at
-- Perfis
drop trigger if exists set_timestamp_profiles on public.profiles;
create trigger set_timestamp_profiles
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Produtos
drop trigger if exists set_timestamp_products on public.products;
create trigger set_timestamp_products
  before update on public.products
  for each row execute function public.update_updated_at_column();

-- Clientes do fornecedor
drop trigger if exists set_timestamp_supplier_clients on public.supplier_clients;
create trigger set_timestamp_supplier_clients
  before update on public.supplier_clients
  for each row execute function public.update_updated_at_column();

-- Animais do cliente
drop trigger if exists set_timestamp_client_animals on public.client_animals;
create trigger set_timestamp_client_animals
  before update on public.client_animals
  for each row execute function public.update_updated_at_column();

-- Agendamentos
drop trigger if exists set_timestamp_client_appointments on public.client_appointments;
create trigger set_timestamp_client_appointments
  before update on public.client_appointments
  for each row execute function public.update_updated_at_column();

-- Despesas
drop trigger if exists set_timestamp_expenses on public.expenses;
create trigger set_timestamp_expenses
  before update on public.expenses
  for each row execute function public.update_updated_at_column();

-- Configurações financeiras do fornecedor
drop trigger if exists set_timestamp_supplier_financial_settings on public.supplier_financial_settings;
create trigger set_timestamp_supplier_financial_settings
  before update on public.supplier_financial_settings
  for each row execute function public.update_updated_at_column();

-- Comentários de produto
drop trigger if exists set_timestamp_product_comments on public.product_comments;
create trigger set_timestamp_product_comments
  before update on public.product_comments
  for each row execute function public.update_updated_at_column();

-- 3) Garantir integridade e unicidade em favoritos e curtidas
-- Remover duplicados em favorites
with ranked as (
  select
    id,
    user_id,
    product_id,
    created_at,
    row_number() over (partition by user_id, product_id order by created_at asc) as rn
  from public.favorites
)
delete from public.favorites f
using ranked r
where f.id = r.id
  and r.rn > 1;

-- Constraint única (unique index) em favorites
create unique index if not exists favorites_user_product_unique
  on public.favorites(user_id, product_id);

-- Remover duplicados em product_likes
with ranked as (
  select
    id,
    user_id,
    product_id,
    created_at,
    row_number() over (partition by user_id, product_id order by created_at asc) as rn
  from public.product_likes
)
delete from public.product_likes pl
using ranked r
where pl.id = r.id
  and r.rn > 1;

-- Constraint única (unique index) em product_likes
create unique index if not exists product_likes_user_product_unique
  on public.product_likes(user_id, product_id);

-- 4) Índices de performance
-- Products
create index if not exists idx_products_supplier_id on public.products(supplier_id);
create index if not exists idx_products_category on public.products(category);

-- Favorites
create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_product_id on public.favorites(product_id);

-- Product Likes
create index if not exists idx_product_likes_user_id on public.product_likes(user_id);
create index if not exists idx_product_likes_product_id on public.product_likes(product_id);

-- Reviews
create index if not exists idx_reviews_supplier_id on public.reviews(supplier_id);
create index if not exists idx_reviews_client_id on public.reviews(client_id);

-- Client Animals
create index if not exists idx_client_animals_client_id on public.client_animals(client_id);

-- Client Appointments
create index if not exists idx_client_appointments_supplier_id on public.client_appointments(supplier_id);
create index if not exists idx_client_appointments_client_id on public.client_appointments(client_id);
create index if not exists idx_client_appointments_date on public.client_appointments(appointment_date);

-- Expenses
create index if not exists idx_expenses_supplier_id on public.expenses(supplier_id);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date);

-- Sales
create index if not exists idx_sales_supplier_id on public.sales(supplier_id);
create index if not exists idx_sales_supplier_client_id on public.sales(supplier_client_id);
create index if not exists idx_sales_created_at on public.sales(created_at);

-- Supplier Clients
create index if not exists idx_supplier_clients_supplier_id on public.supplier_clients(supplier_id);
create index if not exists idx_supplier_clients_created_at on public.supplier_clients(created_at);

-- 5) Constraints de integridade leves e seguras
-- Avaliações: 1 a 5
alter table public.reviews
  add constraint reviews_rating_between_1_and_5
  check (rating >= 1 and rating <= 5) not valid;

alter table public.reviews
  validate constraint reviews_rating_between_1_and_5;

-- Desconto do produto: 0 a 99
alter table public.products
  add constraint products_discount_percentage_between_0_and_99
  check (discount_percentage is null or (discount_percentage >= 0 and discount_percentage <= 99)) not valid;

alter table public.products
  validate constraint products_discount_percentage_between_0_and_99;
