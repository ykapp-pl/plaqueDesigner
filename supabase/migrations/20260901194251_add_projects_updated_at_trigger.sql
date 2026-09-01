create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;

create trigger projects_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();
