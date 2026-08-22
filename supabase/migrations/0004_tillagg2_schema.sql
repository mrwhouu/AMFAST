-- Tillägg 2: Objekthantering, historik & avisering.
-- Bygger vidare på grundschemat (0001-0003) utan att ändra dess arkitektur.

-- ---------------------------------------------------------------------------
-- fastigheter: prefix för objektnummer-serier (egen delserie per fastighet)
-- ---------------------------------------------------------------------------
alter table public.fastigheter
  add column objektnummer_prefix text;

update public.fastigheter set objektnummer_prefix = '851-10' where namn = 'Aeolus 1';
update public.fastigheter set objektnummer_prefix = '852-10' where namn = 'Diana 2';
update public.fastigheter set objektnummer_prefix = '852-20' where namn = 'Juno 9';

-- ---------------------------------------------------------------------------
-- objekt: nya kolumner för delning, uppsägning/förlängning, index, hyresgästuppgifter
-- ---------------------------------------------------------------------------
alter table public.objekt
  add column parent_objekt_id uuid references public.objekt (id),
  add column indexklausul boolean not null default false,
  add column bas_hyra_ar numeric,
  add column uppsagningstid_manader int not null default 9,
  add column forlangning_manader int not null default 36,
  add column uppsagning_mottagen boolean not null default false,
  add column uppsagning_datum date,
  add column hyresgast_orgnr text,
  add column hyresgast_kontakt text;

alter table public.objekt drop constraint if exists objekt_status_check;
alter table public.objekt
  add constraint objekt_status_check check (status in ('uthyrd', 'vakant', 'avslutat'));

comment on column public.objekt.parent_objekt_id is 'Sätts på nya objekt som skapats genom delning av ett äldre objekt.';
comment on column public.objekt.bas_hyra_ar is 'Hyra innan indextillägg, för objekt med indexklausul = true.';

-- ---------------------------------------------------------------------------
-- objekt_historik (punkt 2)
-- ---------------------------------------------------------------------------
create table public.objekt_historik (
  id uuid primary key default gen_random_uuid(),
  objekt_id uuid not null references public.objekt (id) on delete cascade,
  hyresgast text,
  kontrakt_fran date,
  kontrakt_tom date,
  hyra_ar numeric,
  orsak_avslut text,
  skapad_av uuid references auth.users (id),
  skapad_at timestamptz not null default now()
);

comment on table public.objekt_historik is 'Historik över tidigare hyresgäster/kontrakt per objekt, skriven av trigger vid relevanta ändringar.';

create index objekt_historik_objekt_id_idx on public.objekt_historik (objekt_id);

-- Loggar OLD-raden till historik före varje ändring av hyresgäst/kontraktstid/status.
-- Detta är en BEFORE UPDATE-trigger, så den går inte att kringgå från frontend-koden.
-- app.historik_orsak (transaktionslokal, satt via set_config) ger en beskrivande
-- anledning när ändringen görs via en av RPC-funktionerna nedan; annars 'Ändring'.
create or replace function public.log_objekt_historik()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.hyresgast is distinct from new.hyresgast)
     or (old.kontrakt_fran is distinct from new.kontrakt_fran)
     or (old.kontrakt_tom is distinct from new.kontrakt_tom)
     or (old.status is distinct from new.status) then
    insert into public.objekt_historik (objekt_id, hyresgast, kontrakt_fran, kontrakt_tom, hyra_ar, orsak_avslut, skapad_av)
    values (
      old.id, old.hyresgast, old.kontrakt_fran, old.kontrakt_tom, old.hyra_ar,
      coalesce(nullif(current_setting('app.historik_orsak', true), ''), 'Ändring'),
      auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger objekt_log_historik
  before update on public.objekt
  for each row execute function public.log_objekt_historik();

-- ---------------------------------------------------------------------------
-- objekt_drifttillagg (punkt 6)
-- ---------------------------------------------------------------------------
create table public.objekt_drifttillagg (
  id uuid primary key default gen_random_uuid(),
  objekt_id uuid not null references public.objekt (id) on delete cascade,
  typ text not null,
  belopp_ar numeric not null default 0,
  indexklausul boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.objekt_drifttillagg is 'Drifttillägg (värme, kyla, avfall, el m.m.) per objekt, utöver bashyra.';

create index objekt_drifttillagg_objekt_id_idx on public.objekt_drifttillagg (objekt_id);

-- ---------------------------------------------------------------------------
-- fakturor: avistatus (punkt 3)
-- ---------------------------------------------------------------------------
alter table public.fakturor
  add column skickad_datum date,
  add column betald_datum date,
  add column inkasso_datum date,
  add column status text not null default 'utkast'
    check (status in ('utkast', 'skickad', 'betald', 'forsenad', 'inkasso')),
  add column inkasso_av uuid references auth.users (id),
  add column inkasso_markerad_at timestamptz;

-- ---------------------------------------------------------------------------
-- index_serier (punkt 4)
-- ---------------------------------------------------------------------------
create table public.index_serier (
  id uuid primary key default gen_random_uuid(),
  ar int not null unique,
  procent numeric not null,
  kalla text,
  skapad_at timestamptz not null default now()
);

comment on table public.index_serier is 'Årlig indexuppräkningsprocent (t.ex. KPI), en rad per år. Sätts manuellt av admin/förvaltare.';

-- ---------------------------------------------------------------------------
-- RLS: nya tabeller
-- ---------------------------------------------------------------------------
alter table public.objekt_historik enable row level security;

create policy objekt_historik_select on public.objekt_historik
  for select
  using (
    public.is_admin() or exists (
      select 1 from public.objekt o
      where o.id = objekt_historik.objekt_id
        and public.has_fastighet_access(o.fastighet_id)
    )
  );

alter table public.objekt_drifttillagg enable row level security;

create policy objekt_drifttillagg_select on public.objekt_drifttillagg
  for select
  using (
    public.is_admin() or exists (
      select 1 from public.objekt o
      where o.id = objekt_drifttillagg.objekt_id
        and public.has_fastighet_access(o.fastighet_id)
    )
  );

create policy objekt_drifttillagg_insert on public.objekt_drifttillagg
  for insert
  with check (
    public.is_admin() or exists (
      select 1 from public.objekt o
      where o.id = objekt_drifttillagg.objekt_id
        and public.has_fastighet_access(o.fastighet_id, true)
    )
  );

create policy objekt_drifttillagg_update on public.objekt_drifttillagg
  for update
  using (
    public.is_admin() or exists (
      select 1 from public.objekt o
      where o.id = objekt_drifttillagg.objekt_id
        and public.has_fastighet_access(o.fastighet_id, true)
    )
  );

create policy objekt_drifttillagg_delete on public.objekt_drifttillagg
  for delete
  using (
    public.is_admin() or exists (
      select 1 from public.objekt o
      where o.id = objekt_drifttillagg.objekt_id
        and public.has_fastighet_access(o.fastighet_id, true)
    )
  );

alter table public.index_serier enable row level security;

create policy index_serier_select on public.index_serier
  for select
  using (auth.uid() is not null);

create policy index_serier_insert on public.index_serier
  for insert
  with check (public.is_admin() or public.current_role_name() = 'forvaltare');

create policy index_serier_update on public.index_serier
  for update
  using (public.is_admin() or public.current_role_name() = 'forvaltare');

create policy index_serier_delete on public.index_serier
  for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Objektnummer-generering (punkt 1 + 7): egen delserie per fastighet
-- ---------------------------------------------------------------------------
create or replace function public.next_objektnummer(p_fastighet_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_max int;
begin
  select objektnummer_prefix into v_prefix
  from public.fastigheter
  where id = p_fastighet_id;

  if v_prefix is null then
    raise exception 'Fastigheten saknar objektnummer_prefix';
  end if;

  select coalesce(max(substring(objektnummer from length(v_prefix) + 1)::int), 0)
  into v_max
  from public.objekt
  where fastighet_id = p_fastighet_id
    and objektnummer like v_prefix || '%'
    and substring(objektnummer from length(v_prefix) + 1) ~ '^[0-9]+$';

  return v_prefix || lpad((v_max + 1)::text, 2, '0');
end;
$$;

-- ---------------------------------------------------------------------------
-- Objektdelning (punkt 1)
-- ---------------------------------------------------------------------------
create or replace function public.dela_objekt(p_objekt_id uuid, p_delar jsonb)
returns setof public.objekt
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig public.objekt;
  v_del jsonb;
  v_new_nr text;
begin
  select * into v_orig from public.objekt where id = p_objekt_id for update;
  if not found then
    raise exception 'Objekt hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_orig.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  perform set_config('app.historik_orsak', 'Delning', true);

  update public.objekt
  set status = 'avslutat', hyresgast = null, kontrakt_fran = null, kontrakt_tom = null
  where id = p_objekt_id;

  for v_del in select * from jsonb_array_elements(p_delar)
  loop
    v_new_nr := public.next_objektnummer(v_orig.fastighet_id);
    insert into public.objekt (
      fastighet_id, objektnummer, typ, area_kvm, kr_per_kvm, status,
      vakanshyra_ar, gata, parent_objekt_id
    ) values (
      v_orig.fastighet_id,
      v_new_nr,
      coalesce(v_del ->> 'typ', v_orig.typ),
      (v_del ->> 'area_kvm')::numeric,
      v_orig.kr_per_kvm,
      'vakant',
      round(coalesce(v_orig.kr_per_kvm, 0) * (v_del ->> 'area_kvm')::numeric),
      v_orig.gata,
      p_objekt_id
    );
  end loop;

  return query select * from public.objekt where parent_objekt_id = p_objekt_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Avtalsförlängning vid passerad uppsägningstid (punkt 5)
-- ---------------------------------------------------------------------------
create or replace function public.bekrafta_forlangning(p_objekt_id uuid)
returns public.objekt
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orig public.objekt;
  v_result public.objekt;
begin
  select * into v_orig from public.objekt where id = p_objekt_id for update;
  if not found then
    raise exception 'Objekt hittades inte';
  end if;

  if not (public.is_admin() or public.has_fastighet_access(v_orig.fastighet_id, true)) then
    raise exception 'Ingen skrivbehörighet för denna fastighet';
  end if;

  if v_orig.kontrakt_tom is null then
    raise exception 'Objektet saknar kontraktsslutdatum';
  end if;

  perform set_config('app.historik_orsak', 'Automatisk förlängning, ingen uppsägning mottagen', true);

  update public.objekt
  set kontrakt_tom = (kontrakt_tom + (forlangning_manader || ' months')::interval)::date
  where id = p_objekt_id
  returning * into v_result;

  return v_result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Index-uppräkning (punkt 4)
-- ---------------------------------------------------------------------------
create or replace function public.applicera_index(p_ar int)
returns setof public.objekt
language plpgsql
security definer
set search_path = public
as $$
declare
  v_procent numeric;
  v_row public.objekt;
begin
  if not (public.is_admin() or public.current_role_name() = 'forvaltare') then
    raise exception 'Endast admin/förvaltare kan applicera indexuppräkning';
  end if;

  select procent into v_procent from public.index_serier where ar = p_ar;
  if v_procent is null then
    raise exception 'Ingen indexserie registrerad för år %', p_ar;
  end if;

  perform set_config('app.historik_orsak', format('Indexuppräkning %s (%s%%)', p_ar, v_procent), true);

  for v_row in
    select * from public.objekt o
    where o.indexklausul = true
      and o.status = 'uthyrd'
      and (public.is_admin() or public.has_fastighet_access(o.fastighet_id, true))
  loop
    update public.objekt
    set hyra_ar = round(v_row.hyra_ar * (1 + v_procent / 100))
    where id = v_row.id;
  end loop;

  return query
    select * from public.objekt o
    where o.indexklausul = true and o.status = 'uthyrd';
end;
$$;

-- ---------------------------------------------------------------------------
-- Avisering: markera faktura som skickad till inkasso (punkt 3)
-- ---------------------------------------------------------------------------
create or replace function public.markera_faktura_inkasso(p_faktura_id uuid)
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
  set inkasso_datum = current_date,
      status = 'inkasso',
      inkasso_av = auth.uid(),
      inkasso_markerad_at = now()
  where id = p_faktura_id
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.next_objektnummer(uuid) to authenticated;
grant execute on function public.dela_objekt(uuid, jsonb) to authenticated;
grant execute on function public.bekrafta_forlangning(uuid) to authenticated;
grant execute on function public.applicera_index(int) to authenticated;
grant execute on function public.markera_faktura_inkasso(uuid) to authenticated;
