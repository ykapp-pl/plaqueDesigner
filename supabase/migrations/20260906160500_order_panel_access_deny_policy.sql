create policy order_panel_access_no_client_access
on public.order_panel_access
for all
to anon, authenticated
using (false)
with check (false);
