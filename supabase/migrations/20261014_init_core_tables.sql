create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer',
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  designation text,
  company text,
  card_design text,
  quantity integer not null check (quantity > 0),
  address_line_1 text not null,
  city text not null,
  state text not null,
  pin_code text not null,
  payment_ref text unique not null,
  payment_order_id text not null,
  payment_status text not null,
  amount numeric(10,2) not null,
  profile_image_url text,
  cover_image_url text,
  qr_image_url text,
  card_design_image_url text,
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(order_id) on delete set null,
  razorpay_order_id text not null,
  razorpay_payment_id text unique not null,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  status text not null,
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_type text not null,
  secure_url text not null,
  public_id text not null,
  bytes integer not null,
  resource_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_email on public.orders(email);
create index if not exists idx_assets_user_id on public.assets(user_id);
create index if not exists idx_payments_order_id on public.payments(order_id);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.assets enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "assets_select_own" on public.assets;
create policy "assets_select_own"
  on public.assets for select
  using (auth.uid() = user_id);
