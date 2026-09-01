create policy "deny direct project access"
  on public.projects
  for all
  to anon, authenticated
  using (false)
  with check (false);
