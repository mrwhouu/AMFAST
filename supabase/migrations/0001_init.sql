-- AMfast Förvaltningsportal — grundschema
-- Tabeller enligt projektbriefen. En avsiktlig avvikelse: `fakturor` har en
-- egen `fastighet_id`, samt textkopior av `objektnummer` och `hyresgast`, och
-- `objekt_id` är nullable. Det gör att en faktura kan bokföras mot en
-- fastighet även när den saknar en matchande rad i `objekt` (t.ex. en
-- hyresgäst som fakturerats men ännu inte registrerats i rentrollen) — precis
-- det scenario referensprototypen flaggar under "Fakturerade objekt saknas i
-- rentroll". Utan detta skulle sådana fakturor inte gå att lagra alls.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (1:1 mot auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'viewer'
    check (role in ('admin', 'forvaltare', 'agare', 'viewer')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Användarprofil kopplad 1:1 mot auth.users, med roll för behörighetsstyrning.';

-- Skapa automatiskt en profilrad när en ny auth.users-rad skapas.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'viewer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- fastigheter
-- ---------------------------------------------------------------------------
create table public.fastigheter (
  id uuid primary key default gen_random_uuid(),
  namn text not null,
  adress text,
  agare text,
  forvaltare text not null default 'AMfast Fastighetsförvaltning AB',
  created_at timestamptz not null default now()
);

comment on table public.fastigheter is 'Förvaltade fastigheter (t.ex. "Aeolus 1").';

-- ---------------------------------------------------------------------------
-- objekt
-- ---------------------------------------------------------------------------
create table public.objekt (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  objektnummer text not null,
  typ text not null,
  hyresgast text,
  area_kvm numeric not null default 0,
  kr_per_kvm numeric not null default 0,
  hyra_ar numeric not null default 0,
  fastighetsskatt_ar numeric not null default 0,
  ovrigt_ar numeric not null default 0,
  status text not null default 'vakant' check (status in ('uthyrd', 'vakant')),
  vakanshyra_ar numeric,
  kontrakt_fran date,
  kontrakt_tom date,
  gata text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fastighet_id, objektnummer)
);

comment on table public.objekt is 'Uthyrningsbara objekt/lokaler inom en fastighet.';

create index objekt_fastighet_id_idx on public.objekt (fastighet_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger objekt_set_updated_at
  before update on public.objekt
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- fakturor
-- ---------------------------------------------------------------------------
create table public.fakturor (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  objekt_id uuid references public.objekt (id) on delete set null,
  objektnummer text,
  hyresgast text,
  fakturanummer text not null,
  period text not null,
  forfallodatum date not null,
  belopp numeric not null default 0,
  anmarkning text,
  created_at timestamptz not null default now(),
  unique (fastighet_id, fakturanummer)
);

comment on table public.fakturor is 'Hyresavier per objekt/hyresgäst. objekt_id kan vara null om objektet saknas i rentrollen.';

create index fakturor_fastighet_id_idx on public.fakturor (fastighet_id);
create index fakturor_objekt_id_idx on public.fakturor (objekt_id);

-- ---------------------------------------------------------------------------
-- anvandare_fastighet (behörighetstabell)
-- ---------------------------------------------------------------------------
create table public.anvandare_fastighet (
  user_id uuid not null references auth.users (id) on delete cascade,
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  behorighet text not null default 'read' check (behorighet in ('read', 'write')),
  primary key (user_id, fastighet_id)
);

comment on table public.anvandare_fastighet is 'Vilka fastigheter en användare (forvaltare/agare/viewer) har åtkomst till, och om åtkomsten är read eller write.';
