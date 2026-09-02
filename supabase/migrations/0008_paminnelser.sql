-- ---------------------------------------------------------------------------
-- paminnelser: fritextpåminnelser med valfritt datum, kopplade till en
-- fastighet och (valfritt) ett specifikt objekt. Används t.ex. för att
-- notera att en hyresgäst planerar att minska yta men inget är klart än,
-- så det inte glöms bort tills avtalet faktiskt ändras i systemet.
-- ---------------------------------------------------------------------------
create table public.paminnelser (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  objekt_id uuid references public.objekt (id) on delete cascade,
  text text not null,
  paminn_datum date,
  klar boolean not null default false,
  skapad_av uuid references auth.users (id),
  created_at timestamptz not null default now()
);

comment on table public.paminnelser is 'Fritextpåminnelser med valfritt datum, kopplade till en fastighet och ev. ett specifikt objekt.';

create index paminnelser_fastighet_id_idx on public.paminnelser (fastighet_id);

alter table public.paminnelser enable row level security;

create policy paminnelser_select on public.paminnelser
  for select
  using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy paminnelser_insert on public.paminnelser
  for insert
  with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy paminnelser_update on public.paminnelser
  for update
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy paminnelser_delete on public.paminnelser
  for delete
  using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));
