-- Hyresadministration: fakturarader, moms/faktureringsintervall/uppräkningsmodell
-- per objekt, fastigheters egen faktureringsinfo (bankgiro/momsregnr m.m.),
-- påminnelser, betalningsuppföljning och kvartalsvis minimiökning.
-- Bygger vidare på 0001-0004 utan att ändra deras arkitektur.

-- ---------------------------------------------------------------------------
-- fastigheter: egen faktureringsidentitet (för fastigheter där ägaren själv
-- fakturerar, t.ex. ett annat förvaltningsuppdrag i samma portal)
-- ---------------------------------------------------------------------------
alter table public.fastigheter
  add column bankgiro text,
  add column momsregnr text,
  add column organisationsnummer text,
  add column avsandare_adress text,
  add column telefon text,
  add column epost text;

comment on column public.fastigheter.bankgiro is 'Inbetalningskonto som ska anges på fastighetens fakturor/avier.';

-- ---------------------------------------------------------------------------
-- objekt: moms, faktureringsintervall, uppräkningsmodell (inkl. kvartalsvis
-- fast minimiökning)
-- ---------------------------------------------------------------------------
alter table public.objekt
  add column momsat boolean not null default false,
  add column faktureringsintervall text not null default 'kvartalsvis'
    check (faktureringsintervall in ('manadsvis', 'kvartalsvis')),
  add column upprakningsmodell text
    check (upprakningsmodell in ('kpi', 'fast_procent', 'fast_belopp', 'fast_procent_kvartal')),
  add column fast_procent_kvartal numeric;

comment on column public.objekt.momsat is 'Om hyran är momspliktig (25%). Momsfri hyra (t.ex. bostad) lämnas false.';
comment on column public.objekt.faktureringsintervall is 'Hur ofta objektet aviseras: manadsvis eller kvartalsvis.';
comment on column public.objekt.upprakningsmodell is 'Vilken modell indexklausulen följer, om indexklausul = true. fast_procent_kvartal = fast minimiökning per kvartal (se fast_procent_kvartal).';
comment on column public.objekt.fast_procent_kvartal is 'Procent per kvartal för uppräkningsmodell fast_procent_kvartal (t.ex. 0.5 för 0,5%/kvartal).';

-- ---------------------------------------------------------------------------
-- fakturor: typ (faktura/kreditfaktura/påminnelse) + koppling till ursprunglig
-- faktura för krediteringar och påminnelser
-- ---------------------------------------------------------------------------
alter table public.fakturor
  add column typ text not null default 'faktura'
    check (typ in ('faktura', 'kreditfaktura', 'paminnelse')),
  add column ursprunglig_faktura_id uuid references public.fakturor (id);

comment on column public.fakturor.ursprunglig_faktura_id is 'För kreditfaktura/påminnelse: vilken ursprunglig faktura raden hör till.';

-- ---------------------------------------------------------------------------
-- faktura_rader (punkt: specifikationsrader per faktura, ett objekt kan nu
-- förekomma som en av flera rader på samma faktura)
-- ---------------------------------------------------------------------------
create table public.faktura_rader (
  id uuid primary key default gen_random_uuid(),
  faktura_id uuid not null references public.fakturor (id) on delete cascade,
  objekt_id uuid references public.objekt (id) on delete set null,
  beskrivning text not null,
  antal numeric not null default 1,
  a_pris numeric not null default 0,
  belopp numeric not null default 0,
  typ text not null default 'hyra'
    check (typ in ('hyra', 'index', 'drift', 'paminnelseavgift', 'kreditering', 'ovrigt')),
  skapad_at timestamptz not null default now()
);

comment on table public.faktura_rader is 'Specifikationsrader per faktura. En faktura kan ha flera rader mot olika objekt (t.ex. flera garage på samma avi).';

create index faktura_rader_faktura_id_idx on public.faktura_rader (faktura_id);
create index faktura_rader_objekt_id_idx on public.faktura_rader (objekt_id);

-- Migrera befintliga fakturor till en (1) rad var, så faktura_rader alltid
-- är den fullständiga specifikationen oavsett hur fakturan skapades.
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
select id, objekt_id, coalesce('Hyra ' || period, 'Hyra'), 1, belopp, belopp, 'hyra'
from public.fakturor;

-- ---------------------------------------------------------------------------
-- RLS: faktura_rader (samma mönster som objekt_drifttillagg, men kopplat via
-- fakturor.fastighet_id)
-- ---------------------------------------------------------------------------
alter table public.faktura_rader enable row level security;

create policy faktura_rader_select on public.faktura_rader
  for select
  using (
    public.is_admin() or exists (
      select 1 from public.fakturor f
      where f.id = faktura_rader.faktura_id
        and public.has_fastighet_access(f.fastighet_id)
    )
  );

create policy faktura_rader_insert on public.faktura_rader
  for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.fakturor f
      where f.id = faktura_rader.faktura_id
        and public.has_fastighet_access(f.fastighet_id, true)
    )
  );

create policy faktura_rader_update on public.faktura_rader
  for update
  using (
    public.is_admin() or exists (
      select 1 from public.fakturor f
      where f.id = faktura_rader.faktura_id
        and public.has_fastighet_access(f.fastighet_id, true)
    )
  );

create policy faktura_rader_delete on public.faktura_rader
  for delete
  using (
    public.is_admin() or exists (
      select 1 from public.fakturor f
      where f.id = faktura_rader.faktura_id
        and public.has_fastighet_access(f.fastighet_id, true)
    )
  );

-- ---------------------------------------------------------------------------
-- Betalningsuppföljning: markera faktura som betald
-- ---------------------------------------------------------------------------
create or replace function public.markera_faktura_betald(p_faktura_id uuid, p_betald_datum date default current_date)
returns public.fakturor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.fakturor;
  v_result public.fakturor;
begin
  select * into v_row from public.fakturor where id = p_faktura_id;
  if not found then
    raise exception 'Faktura hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_row.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  update public.fakturor
  set betald_datum = p_betald_datum,
      status = 'betald'
  where id = p_faktura_id
  returning * into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Hyresadministration: skicka påminnelse mot en förfallen, obetald faktura.
-- Skapar en ny påminnelsefaktura med påminnelseavgift-rad och nytt
-- förfallodatum, och sätter den ursprungliga fakturan till 'forsenad'.
-- ---------------------------------------------------------------------------
create or replace function public.skicka_paminnelse(
  p_faktura_id uuid,
  p_avgift numeric default 60,
  p_nya_forfallodagar int default 14
)
returns public.fakturor
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig public.fakturor;
  v_ny public.fakturor;
  v_antal_paminnelser int;
  v_nytt_fakturanummer text;
begin
  select * into v_orig from public.fakturor where id = p_faktura_id;
  if not found then
    raise exception 'Faktura hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_orig.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  select count(*) into v_antal_paminnelser
  from public.fakturor
  where ursprunglig_faktura_id = p_faktura_id and typ = 'paminnelse';

  v_nytt_fakturanummer := v_orig.fakturanummer || '-P' || (v_antal_paminnelser + 1);

  insert into public.fakturor (
    fastighet_id, objekt_id, objektnummer, hyresgast, fakturanummer, period,
    forfallodatum, belopp, anmarkning, status, skickad_datum, typ, ursprunglig_faktura_id
  ) values (
    v_orig.fastighet_id, v_orig.objekt_id, v_orig.objektnummer, v_orig.hyresgast,
    v_nytt_fakturanummer, v_orig.period, current_date + p_nya_forfallodagar, p_avgift,
    format('Påminnelse för faktura %s', v_orig.fakturanummer), 'skickad', current_date,
    'paminnelse', v_orig.id
  )
  returning * into v_ny;

  insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
  values (v_ny.id, v_orig.objekt_id, 'Påminnelseavgift', 1, p_avgift, p_avgift, 'paminnelseavgift');

  update public.fakturor
  set status = 'forsenad'
  where id = p_faktura_id;

  return v_ny;
end;
$$;

-- ---------------------------------------------------------------------------
-- Kvartalsvis fast minimiökning (t.ex. 0,5%/kvartal), separat från den
-- årliga KPI-uppräkningen i applicera_index.
-- ---------------------------------------------------------------------------
create or replace function public.applicera_kvartals_minimiokning(p_ar int, p_kvartal int)
returns setof public.objekt
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.objekt;
begin
  if not (public.is_admin() or public.current_role_name() = 'forvaltare') then
    raise exception 'Endast admin/förvaltare kan applicera kvartalsuppräkning';
  end if;

  perform set_config(
    'app.historik_orsak',
    format('Kvartalsvis minimiökning %s Q%s', p_ar, p_kvartal),
    true
  );

  for v_row in
    select * from public.objekt o
    where o.upprakningsmodell = 'fast_procent_kvartal'
      and o.status = 'uthyrd'
      and (public.is_admin() or public.has_fastighet_access(o.fastighet_id, true))
  loop
    update public.objekt
    set hyra_ar = round(v_row.hyra_ar * (1 + coalesce(v_row.fast_procent_kvartal, 0.5) / 100))
    where id = v_row.id;
  end loop;

  return query
    select * from public.objekt o
    where o.upprakningsmodell = 'fast_procent_kvartal' and o.status = 'uthyrd';
end;
$$;

grant execute on function public.markera_faktura_betald(uuid, date) to authenticated;
grant execute on function public.skicka_paminnelse(uuid, numeric, int) to authenticated;
grant execute on function public.applicera_kvartals_minimiokning(int, int) to authenticated;
