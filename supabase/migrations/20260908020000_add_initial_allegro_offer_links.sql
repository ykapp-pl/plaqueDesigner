-- Dedicated links keep each Allegro offer locked to the size the buyer purchased.
insert into public.offer_links (
  size_id,
  allowed_size_ids,
  background_enabled,
  background_editable,
  premium_available
)
values
  ('25x25', array['25x25'], true, true, false),
  ('15x25', array['15x25'], true, true, false),
  ('15x15', array['15x15'], true, true, false);
