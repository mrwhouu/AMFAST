-- Row Level Security för AMfast Förvaltningsportal.
-- Rollmatris (se projektbriefen):
--   admin       ser/redigerar allt
--   forvaltare  ser fastigheter kopplade via anvandare_fastighet,
--               redigerar objekt/fakturor där behorighet = 'write'
--   agare       ser fastigheter kopplade via anvandare_fastighet, read-only
--   viewer      ser fastigheter kopplade via anvandare_fastighet, read-only

-- ---------------------------------------------------------------------------
-- Hjälpfunktioner (security definer så de kan läsa profiles/anvandare_fastighet
-- utan att själva triggas av RLS-policyerna på de tabellerna).
-- ---------------------------------------------------------------------------
create or replace function public.current_role_name()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_role_name() = 'admin', false)
$$;

create or replace function public.has_fastighet_access(fid uuid, need_write boolean default false)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.anvandare_fastighet af
    where af.fastighet_id = fid
      and af.user_id = auth.uid()
      and (not need_write or af.behorighet = 'write')
  )
$$;

-- Förhindra att en användare själv sätter/ändrar sin roll eller id.
create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.id := old.id;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

create policy profiles_update on public.profiles
  for update
  using (id = auth.uid() or public.is_admin());

create policy profiles_admin_insert on public.profiles
  for insert
  with check (public.is_admin());

create policy profiles_admin_delete on public.profiles
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- fastigheter
-- ---------------------------------------------------------------------------
alter table public.fastigheter enable row level security;

create policy fastigheter_select on public.fastigheter
  for select
  using (public.is_admin() or public.has_fastighet_access(id));

create policy fastigheter_admin_write on public.fastigheter
  for insert
  with check (public.is_admin());

create policy fastigheter_admin_update on public.fastigheter
  for update
  using (public.is_admin());

create policy fastigheter_admin_delete on public.fastigheter
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- objekt
-- ---------------------------------------------------------------------------
alter table public.objekt enable row level security;

create policy objekt_select on public.objekt
  for select
  using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy objekt_insert on public.objekt
  for insert
  with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy objekt_update on public.objekt
  for update
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy objekt_delete on public.objekt
  for delete
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

-- ---------------------------------------------------------------------------
-- fakturor
-- ---------------------------------------------------------------------------
alter table public.fakturor enable row level security;

create policy fakturor_select on public.fakturor
  for select
  using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy fakturor_insert on public.fakturor
  for insert
  with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy fakturor_update on public.fakturor
  for update
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy fakturor_delete on public.fakturor
  for delete
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

-- ---------------------------------------------------------------------------
-- anvandare_fastighet
-- ---------------------------------------------------------------------------
alter table public.anvandare_fastighet enable row level security;

create policy anvandare_fastighet_select on public.anvandare_fastighet
  for select
  using (public.is_admin() or user_id = auth.uid());

create policy anvandare_fastighet_admin_insert on public.anvandare_fastighet
  for insert
  with check (public.is_admin());

create policy anvandare_fastighet_admin_update on public.anvandare_fastighet
  for update
  using (public.is_admin());

create policy anvandare_fastighet_admin_delete on public.anvandare_fastighet
  for delete
  using (public.is_admin());
