create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  target_type text,
  target_id text,
  request_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_logs_select_superadmin" on public.audit_logs;
create policy "audit_logs_select_superadmin"
  on public.audit_logs for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');
