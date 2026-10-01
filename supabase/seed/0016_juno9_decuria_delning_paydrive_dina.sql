-- Juno 9: tre förändringar per uppdatering 2026-10-01.
--
-- 1) Decuria AB (852-2002) minskar sin lokal från 142 till 93 kvm.
--    Den återstående ytan (49 kvm) läggs upp som ett nytt vakant objekt,
--    kopplat till 852-2002 via parent_objekt_id (samma mönster som
--    public.dela_objekt() använder vid objektdelning).
--    OBS: ingen ny hyra/fastighetsskatt har angetts för Decurias minskade
--    yta — hyra_ar/fastighetsskatt_ar lämnas oförändrade här och bör
--    stämmas av manuellt mot det nya avtalet.
--
-- 2) Paydrive AB (redan hyresgäst på 852-2009) förhyr även den tidigare
--    vakanta lokalen 852-2008 (110 kvm) från 2026-11-01.
--
-- 3) Dina AB blir ny hyresgäst på den tidigare vakanta lokalen 852-2003
--    från 2026-12-01.
--
-- Inget slutdatum har angetts för de nya avtalen (Paydrive/852-2008 och
-- Dina AB/852-2003) — kontrakt_tom lämnas null (tillsvidare) tills
-- avtalslängden bekräftas.

-- ---------------------------------------------------------------------------
-- 1) Decuria AB — ytminskning och delning
-- ---------------------------------------------------------------------------
update public.objekt
set area_kvm = 93,
    kr_per_kvm = round(hyra_ar::numeric / 93)
where objektnummer = '852-2002';

insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, gata, momsat,
  faktureringsintervall, parent_objekt_id
)
select
  fastighet_id,
  public.next_objektnummer(fastighet_id),
  typ,
  null,
  142 - 93,
  0,
  0,
  0,
  0,
  'vakant',
  gata,
  false,
  faktureringsintervall,
  id
from public.objekt
where objektnummer = '852-2002';

-- ---------------------------------------------------------------------------
-- 2) Paydrive AB utökar med 852-2008
-- ---------------------------------------------------------------------------
select set_config('app.historik_orsak', 'Nytt hyresavtal: Paydrive AB utökar med 852-2008', true);

update public.objekt
set hyresgast = 'Paydrive AB',
    status = 'uthyrd',
    kontrakt_fran = '2026-11-01',
    kontrakt_tom = null,
    hyra_ar = 450000,
    fastighetsskatt_ar = 49500,
    kr_per_kvm = round(450000::numeric / nullif(area_kvm, 0)),
    momsat = true
where objektnummer = '852-2008';

-- ---------------------------------------------------------------------------
-- 3) Dina AB — ny hyresgäst på 852-2003
-- ---------------------------------------------------------------------------
select set_config('app.historik_orsak', 'Nytt hyresavtal: Dina AB (852-2003)', true);

update public.objekt
set hyresgast = 'Dina AB',
    status = 'uthyrd',
    kontrakt_fran = '2026-12-01',
    kontrakt_tom = null,
    hyra_ar = 87500,
    fastighetsskatt_ar = 11250,
    kr_per_kvm = round(87500::numeric / nullif(area_kvm, 0)),
    momsat = true
where objektnummer = '852-2003';
