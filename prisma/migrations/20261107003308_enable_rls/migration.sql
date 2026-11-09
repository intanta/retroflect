-- Enable RLS for Retro table, no priviledges except SELECT for anon (this is temporary)
alter table public."Retro" enable row level security;
revoke all on table public."Retro" from anon, authenticated;
grant select on table public."Retro" to anon;
drop policy if exists "Enable read access for all users" on public."Retro";
create policy "Anon can temporarily read retros"
on public."Retro" for select
to anon
using (true);

-- Enable RLS for other tables, no priviledges for anon and authenticated
alter table public."Category" enable row level security;
revoke all on table public."Category" from anon, authenticated;

alter table public."Comment" enable row level security;
revoke all on table public."Comment" from anon, authenticated;

alter table public."Action" enable row level security;
revoke all on table public."Action" from anon, authenticated;

alter table public._prisma_migrations enable row level security;
revoke all on table public._prisma_migrations from anon, authenticated;

-- Enable RLS for future tables, no priviledges for anon and authenticated
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;