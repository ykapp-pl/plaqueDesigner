create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  access_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  login text not null,
  order_number text not null,
  size_id text not null,
  configuration jsonb not null
);

create index if not exists projects_order_number_idx on public.projects(order_number);
create index if not exists projects_login_idx on public.projects(login);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

alter table public.projects enable row level security;
revoke all on table public.projects from anon, authenticated;
