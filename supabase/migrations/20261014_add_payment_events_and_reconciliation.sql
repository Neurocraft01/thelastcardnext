alter table public.payments enable row level security;

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments for select
  using (
    exists (
      select 1
      from public.orders
      where public.orders.order_id = public.payments.order_id
        and public.orders.user_id = auth.uid()
    )
  );

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'superadmin'));

drop policy if exists "payments_write_service_role" on public.payments;
create policy "payments_write_service_role"
  on public.payments for all
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'razorpay',
  provider_event_id text not null,
  event_type text not null,
  payment_id text,
  order_id text,
  signature text,
  payload jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists idx_payment_events_created_at on public.payment_events(created_at desc);
create index if not exists idx_payment_events_processed on public.payment_events(processed, created_at desc);
create index if not exists idx_payment_events_payment_id on public.payment_events(payment_id);

alter table public.payment_events enable row level security;

drop policy if exists "payment_events_select_superadmin" on public.payment_events;
create policy "payment_events_select_superadmin"
  on public.payment_events for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

drop policy if exists "payment_events_write_service_role" on public.payment_events;
create policy "payment_events_write_service_role"
  on public.payment_events for all
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');

create table if not exists public.reconciliation_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  run_by text,
  metadata jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_reconciliation_jobs_created_at on public.reconciliation_jobs(created_at desc);
create index if not exists idx_reconciliation_jobs_status on public.reconciliation_jobs(status, created_at desc);

alter table public.reconciliation_jobs enable row level security;

drop policy if exists "reconciliation_jobs_select_superadmin" on public.reconciliation_jobs;
create policy "reconciliation_jobs_select_superadmin"
  on public.reconciliation_jobs for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

drop policy if exists "reconciliation_jobs_write_service_role" on public.reconciliation_jobs;
create policy "reconciliation_jobs_write_service_role"
  on public.reconciliation_jobs for all
  using ((auth.jwt() ->> 'role') = 'service_role')
  with check ((auth.jwt() ->> 'role') = 'service_role');
