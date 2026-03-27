create table if not exists public.user_policy_acceptances (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  policy_key text not null default 'privacy_policy',
  accepted_at timestamptz not null default now(),
  ip_address text null,
  created_at timestamptz not null default now(),
  unique (user_id, policy_key)
);

alter table public.user_policy_acceptances enable row level security;

create policy "Allow all access to user_policy_acceptances"
on public.user_policy_acceptances
for all
using (true)
with check (true);