-- Digital fastighetsplattform: hierarkisk fastighetsstruktur (byggnad →
-- våningsplan), tekniska objekt, ritningar, dokument, underhåll,
-- besiktningar och garantier.
--
-- MVP1-steg enligt produktbeskrivningen: datamodell för att koppla ritningar,
-- tekniska objekt, underhåll, besiktningar, garantier och dokument till
-- fastighet/byggnad/våningsplan/lokal. Digital tvilling/3D-visualisering
-- byggs ovanpå denna struktur i ett senare steg (den behöver inte ändra
-- datamodellen, bara läsa den).
--
-- Notera begreppsskillnaden mot befintligt schema: `objekt` (0001) är redan
-- "Lokal" i produktbeskrivningens hierarki (uthyrningsbart utrymme, med
-- hyresgäst/kontrakt). Produktbeskrivningens "Objekt" (kapitel 10 —
-- ventilationsaggregat, pumpar, hissar m.m.) är ett annat begrepp och läggs
-- här som en ny tabell `tekniska_objekt`, för att inte skriva om den
-- befintliga uthyrningsmodellen. Bygger vidare på 0001-0005 utan att ändra
-- deras arkitektur.

-- ---------------------------------------------------------------------------
-- profiles: ny roll drifttekniker (tillgång till drift/underhåll/tekniska
-- objekt/besiktningar/dokument, se produktbeskrivningens kapitel 2 och 29)
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'forvaltare', 'agare', 'viewer', 'drifttekniker'));

-- ---------------------------------------------------------------------------
-- byggnader
-- ---------------------------------------------------------------------------
create table public.byggnader (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  namn text not null,
  beskrivning text,
  ordning int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.byggnader is 'Byggnader inom en fastighet. En fastighet kan ha en eller flera byggnader.';

create index byggnader_fastighet_id_idx on public.byggnader (fastighet_id);

-- ---------------------------------------------------------------------------
-- vaningsplan
-- ---------------------------------------------------------------------------
create table public.vaningsplan (
  id uuid primary key default gen_random_uuid(),
  byggnad_id uuid not null references public.byggnader (id) on delete cascade,
  namn text not null,
  plannummer int not null default 0,
  beskrivning text,
  created_at timestamptz not null default now()
);

comment on table public.vaningsplan is 'Våningsplan inom en byggnad. plannummer används för sortering (t.ex. -1 för källare, 0 för entréplan).';

create index vaningsplan_byggnad_id_idx on public.vaningsplan (byggnad_id);

-- ---------------------------------------------------------------------------
-- objekt (lokaler): placera i hierarkin
-- ---------------------------------------------------------------------------
alter table public.objekt
  add column vaningsplan_id uuid references public.vaningsplan (id) on delete set null;

comment on column public.objekt.vaningsplan_id is 'Vilket våningsplan lokalen finns på. Nullable — befintliga/ej strukturerade lokaler kan sakna detta.';

create index objekt_vaningsplan_id_idx on public.objekt (vaningsplan_id);

-- ---------------------------------------------------------------------------
-- ritningar
-- ---------------------------------------------------------------------------
create table public.ritningar (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  byggnad_id uuid references public.byggnader (id) on delete set null,
  vaningsplan_id uuid references public.vaningsplan (id) on delete set null,
  objekt_id uuid references public.objekt (id) on delete set null,
  namn text not null,
  typ text not null default 'pdf' check (typ in ('pdf', 'dwg', 'bim', '3d_modell', 'point_cloud', 'ovrigt')),
  storage_path text not null,
  version int not null default 1,
  is_current boolean not null default true,
  foregaende_version_id uuid references public.ritningar (id) on delete set null,
  skala_kalibrering jsonb,
  uppladdad_av uuid references auth.users (id),
  created_at timestamptz not null default now()
);

comment on table public.ritningar is 'Ritnings-/modellfiler (PDF/DWG/BIM/3D/point cloud), kopplade till fastighet och ev. byggnad/våningsplan/lokal. Tidigare versioner behålls (is_current + foregaende_version_id) i stället för att skrivas över.';
comment on column public.ritningar.skala_kalibrering is 'Skalkalibrering för mätning i ritningsvisaren, t.ex. {"pixel_distans": 240, "verklig_distans_m": 5, "enhet": "m"}. Null tills kalibrerad.';

create index ritningar_fastighet_id_idx on public.ritningar (fastighet_id);
create index ritningar_vaningsplan_id_idx on public.ritningar (vaningsplan_id);

-- ---------------------------------------------------------------------------
-- tekniska_objekt (produktbeskrivningens kapitel 10 "Objekt": ventilations-
-- aggregat, pumpar, hissar, elcentraler m.m. — skilt från lokaler/`objekt`)
-- ---------------------------------------------------------------------------
create table public.tekniska_objekt (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  byggnad_id uuid references public.byggnader (id) on delete set null,
  vaningsplan_id uuid references public.vaningsplan (id) on delete set null,
  objekt_id uuid references public.objekt (id) on delete set null,
  namn text not null,
  kategori text not null default 'ovrigt',
  objekt_id_kod text,
  typ text,
  modell text,
  tillverkare text,
  installationsdatum date,
  teknisk_info jsonb not null default '{}'::jsonb,
  ritning_id uuid references public.ritningar (id) on delete set null,
  placering_x numeric,
  placering_y numeric,
  status text not null default 'aktiv' check (status in ('aktiv', 'inaktiv', 'borttagen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tekniska_objekt is 'Tekniska/fysiska objekt (ventilationsaggregat, pumpar, hissar, elcentraler, brandutrustning m.m.), placerade inom fastighetshierarkin och ev. på en ritning.';
comment on column public.tekniska_objekt.objekt_id_kod is 'Användarens eget objekt-ID/märkning (t.ex. "FTX-03"), skilt från databasens id.';
comment on column public.tekniska_objekt.teknisk_info is 'Fri teknisk specifikation som nyckel/värde, eftersom relevanta fält skiljer sig mellan objektkategorier.';
comment on column public.tekniska_objekt.placering_x is 'Normaliserad x-position (0–1) på kopplad ritning, för visning av objektets position i ritningsvisaren/digitala tvillingen.';

create index tekniska_objekt_fastighet_id_idx on public.tekniska_objekt (fastighet_id);
create index tekniska_objekt_vaningsplan_id_idx on public.tekniska_objekt (vaningsplan_id);
create index tekniska_objekt_objekt_id_idx on public.tekniska_objekt (objekt_id);

create trigger tekniska_objekt_set_updated_at
  before update on public.tekniska_objekt
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- dokument
-- ---------------------------------------------------------------------------
create table public.dokument (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  byggnad_id uuid references public.byggnader (id) on delete set null,
  vaningsplan_id uuid references public.vaningsplan (id) on delete set null,
  objekt_id uuid references public.objekt (id) on delete set null,
  tekniskt_objekt_id uuid references public.tekniska_objekt (id) on delete set null,
  dokumenttyp text not null default 'ovrigt',
  namn text not null,
  beskrivning text,
  storage_path text not null,
  version int not null default 1,
  ansvarig uuid references auth.users (id),
  datum date not null default current_date,
  created_at timestamptz not null default now()
);

comment on table public.dokument is 'Dokument (manualer, protokoll, hyresavtal, anpassningshandlingar m.m.) kopplade till valfri nivå i fastighetshierarkin eller ett tekniskt objekt.';

create index dokument_fastighet_id_idx on public.dokument (fastighet_id);
create index dokument_objekt_id_idx on public.dokument (objekt_id);
create index dokument_tekniskt_objekt_id_idx on public.dokument (tekniskt_objekt_id);

-- ---------------------------------------------------------------------------
-- garantier
-- ---------------------------------------------------------------------------
create table public.garantier (
  id uuid primary key default gen_random_uuid(),
  tekniskt_objekt_id uuid not null references public.tekniska_objekt (id) on delete cascade,
  leverantor text,
  installerat_datum date,
  garantitid_manader int not null,
  garanti_till date,
  dokument_id uuid references public.dokument (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.garantier is 'Garantier registrerade på tekniska objekt. Visas endast där garanti faktiskt registrerats (se produktbeskrivningen kapitel 14).';

create index garantier_tekniskt_objekt_id_idx on public.garantier (tekniskt_objekt_id);
create index garantier_garanti_till_idx on public.garantier (garanti_till);

create or replace function public.set_garanti_till()
returns trigger
language plpgsql
as $$
begin
  if new.installerat_datum is not null then
    new.garanti_till := (new.installerat_datum + make_interval(months => new.garantitid_manader))::date;
  else
    new.garanti_till := null;
  end if;
  return new;
end;
$$;

create trigger garantier_set_garanti_till
  before insert or update on public.garantier
  for each row execute function public.set_garanti_till();

-- ---------------------------------------------------------------------------
-- underhall_atgarder (planerat/genomfört underhåll, inkl. återkommande)
-- ---------------------------------------------------------------------------
create table public.underhall_atgarder (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  vaningsplan_id uuid references public.vaningsplan (id) on delete set null,
  objekt_id uuid references public.objekt (id) on delete set null,
  tekniskt_objekt_id uuid references public.tekniska_objekt (id) on delete set null,
  typ text not null,
  beskrivning text,
  ansvarig uuid references auth.users (id),
  ansvarig_extern text,
  planerat_datum date,
  utfort_datum date,
  status text not null default 'planerad' check (status in ('planerad', 'pagaende', 'utford', 'forsenad', 'installd')),
  kostnad numeric,
  aterkommande boolean not null default false,
  intervall_manader int,
  foregaende_atgard_id uuid references public.underhall_atgarder (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.underhall_atgarder is 'Löpande drift- och underhållsåtgärder (filterbyte, service, kontroller m.m.), kan vara återkommande.';

create index underhall_atgarder_fastighet_id_idx on public.underhall_atgarder (fastighet_id);
create index underhall_atgarder_tekniskt_objekt_id_idx on public.underhall_atgarder (tekniskt_objekt_id);
create index underhall_atgarder_planerat_datum_idx on public.underhall_atgarder (planerat_datum);

create trigger underhall_atgarder_set_updated_at
  before update on public.underhall_atgarder
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- besiktningar
-- ---------------------------------------------------------------------------
create table public.besiktningar (
  id uuid primary key default gen_random_uuid(),
  fastighet_id uuid not null references public.fastigheter (id) on delete cascade,
  vaningsplan_id uuid references public.vaningsplan (id) on delete set null,
  objekt_id uuid references public.objekt (id) on delete set null,
  tekniskt_objekt_id uuid references public.tekniska_objekt (id) on delete set null,
  typ text not null,
  datum date,
  forfallodatum date,
  ansvarig uuid references auth.users (id),
  ansvarig_extern text,
  status text not null default 'planerad' check (status in ('planerad', 'utford', 'forsenad', 'installd')),
  protokoll_dokument_id uuid references public.dokument (id) on delete set null,
  anmarkningar text,
  atgarder text,
  kostnad numeric,
  aterkommande boolean not null default false,
  intervall_manader int,
  foregaende_besiktning_id uuid references public.besiktningar (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.besiktningar is 'Återkommande besiktningar och myndighetskontroller (OVK, brandskydd, hiss m.m.), kan gälla en fastighet, lokal eller ett tekniskt objekt.';

create index besiktningar_fastighet_id_idx on public.besiktningar (fastighet_id);
create index besiktningar_tekniskt_objekt_id_idx on public.besiktningar (tekniskt_objekt_id);
create index besiktningar_forfallodatum_idx on public.besiktningar (forfallodatum);

create trigger besiktningar_set_updated_at
  before update on public.besiktningar
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — samma mönster som befintliga tabeller: access via
-- public.has_fastighet_access(fastighet_id, need_write)
-- ---------------------------------------------------------------------------
alter table public.byggnader enable row level security;

create policy byggnader_select on public.byggnader
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy byggnader_insert on public.byggnader
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy byggnader_update on public.byggnader
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy byggnader_delete on public.byggnader
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

alter table public.vaningsplan enable row level security;

create policy vaningsplan_select on public.vaningsplan
  for select using (
    public.is_admin() or exists (
      select 1 from public.byggnader b
      where b.id = vaningsplan.byggnad_id and public.has_fastighet_access(b.fastighet_id)
    )
  );

create policy vaningsplan_insert on public.vaningsplan
  for insert with check (
    public.is_admin() or exists (
      select 1 from public.byggnader b
      where b.id = vaningsplan.byggnad_id and public.has_fastighet_access(b.fastighet_id, true)
    )
  );

create policy vaningsplan_update on public.vaningsplan
  for update using (
    public.is_admin() or exists (
      select 1 from public.byggnader b
      where b.id = vaningsplan.byggnad_id and public.has_fastighet_access(b.fastighet_id, true)
    )
  );

create policy vaningsplan_delete on public.vaningsplan
  for delete using (
    public.is_admin() or exists (
      select 1 from public.byggnader b
      where b.id = vaningsplan.byggnad_id and public.has_fastighet_access(b.fastighet_id, true)
    )
  );

alter table public.ritningar enable row level security;

create policy ritningar_select on public.ritningar
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy ritningar_insert on public.ritningar
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy ritningar_update on public.ritningar
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy ritningar_delete on public.ritningar
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

alter table public.tekniska_objekt enable row level security;

create policy tekniska_objekt_select on public.tekniska_objekt
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy tekniska_objekt_insert on public.tekniska_objekt
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy tekniska_objekt_update on public.tekniska_objekt
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy tekniska_objekt_delete on public.tekniska_objekt
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

alter table public.dokument enable row level security;

create policy dokument_select on public.dokument
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy dokument_insert on public.dokument
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy dokument_update on public.dokument
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy dokument_delete on public.dokument
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

alter table public.garantier enable row level security;

create policy garantier_select on public.garantier
  for select using (
    public.is_admin() or exists (
      select 1 from public.tekniska_objekt t
      where t.id = garantier.tekniskt_objekt_id and public.has_fastighet_access(t.fastighet_id)
    )
  );

create policy garantier_insert on public.garantier
  for insert with check (
    public.is_admin() or exists (
      select 1 from public.tekniska_objekt t
      where t.id = garantier.tekniskt_objekt_id and public.has_fastighet_access(t.fastighet_id, true)
    )
  );

create policy garantier_update on public.garantier
  for update using (
    public.is_admin() or exists (
      select 1 from public.tekniska_objekt t
      where t.id = garantier.tekniskt_objekt_id and public.has_fastighet_access(t.fastighet_id, true)
    )
  );

create policy garantier_delete on public.garantier
  for delete using (
    public.is_admin() or exists (
      select 1 from public.tekniska_objekt t
      where t.id = garantier.tekniskt_objekt_id and public.has_fastighet_access(t.fastighet_id, true)
    )
  );

alter table public.underhall_atgarder enable row level security;

create policy underhall_atgarder_select on public.underhall_atgarder
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy underhall_atgarder_insert on public.underhall_atgarder
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy underhall_atgarder_update on public.underhall_atgarder
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy underhall_atgarder_delete on public.underhall_atgarder
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

alter table public.besiktningar enable row level security;

create policy besiktningar_select on public.besiktningar
  for select using (public.is_admin() or public.has_fastighet_access(fastighet_id));

create policy besiktningar_insert on public.besiktningar
  for insert with check (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy besiktningar_update on public.besiktningar
  for update using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

create policy besiktningar_delete on public.besiktningar
  for delete using (public.is_admin() or public.has_fastighet_access(fastighet_id, true));

-- ---------------------------------------------------------------------------
-- RPC: slutför underhållsåtgärd → skapar nästa åtgärd automatiskt om
-- återkommande (produktbeskrivningen kapitel 12)
-- ---------------------------------------------------------------------------
create or replace function public.slutfor_underhall(
  p_id uuid,
  p_utfort_datum date default current_date,
  p_kostnad numeric default null
)
returns public.underhall_atgarder
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig public.underhall_atgarder;
  v_result public.underhall_atgarder;
begin
  select * into v_orig from public.underhall_atgarder where id = p_id for update;
  if not found then
    raise exception 'Åtgärd hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_orig.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  update public.underhall_atgarder
  set status = 'utford',
      utfort_datum = p_utfort_datum,
      kostnad = coalesce(p_kostnad, kostnad)
  where id = p_id
  returning * into v_result;

  if v_orig.aterkommande and v_orig.intervall_manader is not null then
    insert into public.underhall_atgarder (
      fastighet_id, vaningsplan_id, objekt_id, tekniskt_objekt_id, typ, beskrivning,
      ansvarig, ansvarig_extern, planerat_datum, status, aterkommande, intervall_manader,
      foregaende_atgard_id
    ) values (
      v_orig.fastighet_id, v_orig.vaningsplan_id, v_orig.objekt_id, v_orig.tekniskt_objekt_id,
      v_orig.typ, v_orig.beskrivning, v_orig.ansvarig, v_orig.ansvarig_extern,
      (p_utfort_datum + make_interval(months => v_orig.intervall_manader))::date,
      'planerad', true, v_orig.intervall_manader, p_id
    );
  end if;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: slutför besiktning → skapar nästa besiktning automatiskt om
-- återkommande
-- ---------------------------------------------------------------------------
create or replace function public.slutfor_besiktning(
  p_id uuid,
  p_datum date default current_date,
  p_anmarkningar text default null,
  p_atgarder text default null,
  p_kostnad numeric default null
)
returns public.besiktningar
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig public.besiktningar;
  v_result public.besiktningar;
begin
  select * into v_orig from public.besiktningar where id = p_id for update;
  if not found then
    raise exception 'Besiktning hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_orig.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  update public.besiktningar
  set status = 'utford',
      datum = p_datum,
      anmarkningar = coalesce(p_anmarkningar, anmarkningar),
      atgarder = coalesce(p_atgarder, atgarder),
      kostnad = coalesce(p_kostnad, kostnad)
  where id = p_id
  returning * into v_result;

  if v_orig.aterkommande and v_orig.intervall_manader is not null then
    insert into public.besiktningar (
      fastighet_id, vaningsplan_id, objekt_id, tekniskt_objekt_id, typ,
      ansvarig, ansvarig_extern, forfallodatum, status, aterkommande, intervall_manader,
      foregaende_besiktning_id
    ) values (
      v_orig.fastighet_id, v_orig.vaningsplan_id, v_orig.objekt_id, v_orig.tekniskt_objekt_id,
      v_orig.typ, v_orig.ansvarig, v_orig.ansvarig_extern,
      (p_datum + make_interval(months => v_orig.intervall_manader))::date,
      'planerad', true, v_orig.intervall_manader, p_id
    );
  end if;

  return v_result;
end;
$$;

grant execute on function public.slutfor_underhall(uuid, date, numeric) to authenticated;
grant execute on function public.slutfor_besiktning(uuid, date, text, text, numeric) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: privata bucketar för ritningar och dokument. Filsökväg måste
-- börja med "<fastighet_id>/" så att storage-policyerna kan återanvända
-- has_fastighet_access.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ritningar', 'ritningar', false), ('dokument', 'dokument', false)
on conflict (id) do nothing;

create policy ritningar_storage_select on storage.objects
  for select using (
    bucket_id = 'ritningar'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid))
  );

create policy ritningar_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'ritningar'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid, true))
  );

create policy ritningar_storage_delete on storage.objects
  for delete using (
    bucket_id = 'ritningar'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid, true))
  );

create policy dokument_storage_select on storage.objects
  for select using (
    bucket_id = 'dokument'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid))
  );

create policy dokument_storage_insert on storage.objects
  for insert with check (
    bucket_id = 'dokument'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid, true))
  );

create policy dokument_storage_delete on storage.objects
  for delete using (
    bucket_id = 'dokument'
    and (public.is_admin() or public.has_fastighet_access(((storage.foldername(name))[1])::uuid, true))
  );
