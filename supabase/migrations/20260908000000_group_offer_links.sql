-- Each link can expose a defined group of formats while keeping the offer policy server-side.
alter table public.offer_links
  add column allowed_size_ids text[];

alter table public.offer_links
  add column background_editable boolean not null default false;

update public.offer_links
set allowed_size_ids = array[size_id]
where allowed_size_ids is null;

alter table public.offer_links
  alter column allowed_size_ids set not null,
  alter column allowed_size_ids drop default;

alter table public.offer_links
  add constraint offer_links_allowed_size_ids_check
  check (
    cardinality(allowed_size_ids) > 0
    and allowed_size_ids <@ array[
      '25x25', '20x25', '25x20', '15x25', '25x15',
      '10x25', '15x15', '10x15', '15x10'
    ]::text[]
    and size_id = any(allowed_size_ids)
  );

alter table public.offer_links
  drop constraint if exists offer_links_size_id_background_enabled_premium_available_key;

create unique index offer_links_group_policy_key
  on public.offer_links (allowed_size_ids, background_enabled, background_editable, premium_available);

-- Supersede every former single-format link. Existing projects remain readable by ID and token.
update public.offer_links
set active = false
where active;

insert into public.offer_links (
  size_id,
  allowed_size_ids,
  background_enabled,
  background_editable,
  premium_available
)
values
  ('25x25', array['25x25', '20x25', '25x20'], false, false, false),
  ('25x25', array['25x25', '20x25', '25x20'], true,  true,  false),
  ('25x25', array['25x25', '20x25', '25x20'], true,  true,  true),
  ('15x25', array['15x25', '25x15', '10x25'], false, false, false),
  ('15x25', array['15x25', '25x15', '10x25'], true,  true,  false),
  ('15x25', array['15x25', '25x15', '10x25'], true,  true,  true),
  ('15x15', array['15x15', '10x15', '15x10'], false, false, false),
  ('15x15', array['15x15', '10x15', '15x10'], true,  true,  false),
  ('15x15', array['15x15', '10x15', '15x10'], true,  true,  true);
