-- Punkt 0 (Tillägg 2): lägg in de två objekt som redan faktureras men saknas
-- i rentroll-underlaget. Årshyra är härledd genom att fyrdubbla kvartalsfakturans
-- belopp (samma mönster som stämmer för alla andra objekt i underlaget: belopp
-- per Q3-faktura = total_ar / 4). Area, typ och en ev. uppdelning på
-- fastighetsskatt/drifttillägg går INTE att läsa ur fakturaunderlaget (det är
-- en klumpsumma per faktura) — de fälten lämnas som "Okänt"/0 och bör
-- kompletteras manuellt i Objekt-vyn när avtalen finns tillgängliga.

insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, kontrakt_fran, kontrakt_tom, gata
) values
  (
    (select id from public.fastigheter where namn = 'Aeolus 1'),
    '851-1011', 'Okänt', 'Endra Systems AB', 0, 0,
    8296496, 0, 0, 'uthyrd', null, null, null
  ),
  (
    (select id from public.fastigheter where namn = 'Aeolus 1'),
    '851-1012', 'Okänt', 'Asko Appliances AB', 0, 0,
    5770400, 0, 0, 'uthyrd', null, null, null
  );

update public.fakturor
set objekt_id = (
      select id from public.objekt
      where fastighet_id = (select id from public.fastigheter where namn = 'Aeolus 1')
        and objektnummer = '851-1011'
    ),
    anmarkning = 'Påminnelseavgift 60 kr'
where fakturanummer = '851000177';

update public.fakturor
set objekt_id = (
      select id from public.objekt
      where fastighet_id = (select id from public.fastigheter where namn = 'Aeolus 1')
        and objektnummer = '851-1012'
    ),
    anmarkning = null
where fakturanummer = '851000178';
