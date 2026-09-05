-- Opaque reusable offer links. Tokens are generated in the database, never in the public bundle.
create table public.offer_links (
  code text primary key default replace(gen_random_uuid()::text, '-', '') check (code ~ '^[a-f0-9]{32}$'),
  size_id text not null check (size_id in ('25x25','20x25','15x25','10x25','15x15','10x15')),
  background_enabled boolean not null,
  premium_available boolean not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (size_id, background_enabled, premium_available)
);
alter table public.offer_links enable row level security;
revoke all on public.offer_links from public, anon, authenticated;
grant select on public.offer_links to service_role;

insert into public.offer_links (size_id, background_enabled, premium_available)
select size_id, background_enabled, premium_available
from unnest(array['25x25','20x25','15x25','10x25','15x15','10x15']) as sizes(size_id)
cross join (values(false),(true)) as backgrounds(background_enabled)
cross join (values(false),(true)) as premiums(premium_available);
