-- Q4-fakturorna som byggdes via avi-generatorn för Endra (851-1011) och Asko
-- (851-1012) saknade momsraden och Fastighetsskatt/Övrigt-raderna: hela
-- beloppet klumpades ihop i en enda "Hyra lokal"-rad utan moms. Orsak:
--
-- 1) objekt.momsat stod inte på true för dessa två (jämför 0005_momsat_
--    korrigering.sql, som satte momsat för alla andra Aeolus 1-hyresgäster
--    men aldrig applicerades fullt ut här) — radMoms() i fakturaPdf.tsx
--    hoppar då över momsberäkningen helt.
-- 2) hyra_ar innehöll hela det klumpade helårsbeloppet (inkl. moms/skatt/
--    drift, se kommentaren i 0002_endra_asko.sql), medan fastighetsskatt_ar
--    och ovrigt_ar stod på 0 — så byggRadposter() i AviseringView.tsx kunde
--    inte dela upp beloppet.
--
-- Här delas helårsbeloppet upp baserat på den riktiga Q3-specifikationen
-- (kvartalsrad × 4), så framtida avi-körningar (Q4 och framåt) automatiskt
-- bygger samma radstruktur och momsberäkning som originalfakturorna.

update public.objekt set
  momsat = true,
  hyra_ar = 4160000,           -- 1 040 000 kr/kvartal × 4
  fastighetsskatt_ar = 267520, -- 66 880 kr/kvartal × 4
  ovrigt_ar = 188800           -- 47 200 kr/kvartal (Drifttillägg Lokaler) × 4
where objektnummer = '851-1012'; -- Asko Appliances AB

update public.objekt set
  momsat = true,
  hyra_ar = 5943400,           -- 1 485 850 kr/kvartal × 4
  fastighetsskatt_ar = 418664, -- 104 666 kr/kvartal × 4
  ovrigt_ar = 274940           -- 68 735 kr/kvartal (Drifttillägg Lokaler) × 4
where objektnummer = '851-1011'; -- Endra Systems AB

-- Ta bort de två Q4-fakturor som redan hann skapas med fel belopp/rader
-- (851-1012-2026-Q4 och 851-1011-2026-Q4), så de kan byggas om korrekt via
-- "Bygg aviseringslista" i appen.
delete from public.faktura_rader where faktura_id in (
  select id from public.fakturor where fakturanummer in ('851-1012-2026-Q4', '851-1011-2026-Q4')
);
delete from public.fakturor where fakturanummer in ('851-1012-2026-Q4', '851-1011-2026-Q4');
