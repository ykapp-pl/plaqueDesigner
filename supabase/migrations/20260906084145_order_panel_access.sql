create table public.order_panel_access (
  email text primary key check (email = lower(btrim(email)) and length(email) <= 320),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.order_panel_access enable row level security;
revoke all on public.order_panel_access from public, anon, authenticated;
grant select on public.order_panel_access to service_role;

-- Exact match after trimming surrounding whitespace, including legacy records.
create index projects_normalized_order_number_idx on public.projects (btrim(order_number), created_at desc, id desc);

create function public.order_panel_search(p_order_number text, p_offset integer default 0)
returns table (id uuid, created_at timestamptz, updated_at timestamptz, login text, order_number text, configuration jsonb)
language sql stable security invoker set search_path = ''
as $$
  select p.id, p.created_at, p.updated_at, p.login, p.order_number, p.configuration
  from public.projects p
  where btrim(p.order_number) = btrim(p_order_number)
    and length(btrim(p_order_number)) between 1 and 80
    and p_offset between 0 and 100000
  order by p.created_at desc, p.id desc
  limit 21 offset greatest(0, p_offset);
$$;
revoke all on function public.order_panel_search(text, integer) from public, anon, authenticated;
grant execute on function public.order_panel_search(text, integer) to service_role;
