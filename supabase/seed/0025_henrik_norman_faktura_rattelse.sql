-- Rättelse till 0024: fastighetsägaren förtydligade hur hyresrabatten ska
-- räknas — den hyresfria månaden (6 500 kr) fördelas över hela det första
-- avtalsåret istället för att dras av som en klumpsumma:
--   78 000 kr/år − 6 500 kr (en hyresfri månad) = 71 500 kr/år ≈ 5 958 kr/mån
-- November räknas som halv månad (tillträde 2026-11-15): 5 958 / 2 = 2 979 kr
-- December blir en hel månad till den rabatterade månadshyran: 5 958 kr
-- Att betala: 2 979 + 5 958 = 8 937 kr
--
-- Tar bort ev. redan infogad faktura från 0024 (idempotent oavsett om den
-- hann köras) och lägger in den med rätt belopp.

delete from public.faktura_rader where faktura_id in (
  select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'
);
delete from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC';

insert into public.fakturor (
  fastighet_id, objekt_id, objektnummer, hyresgast, fakturanummer, period,
  forfallodatum, belopp, anmarkning, status, skickad_datum
) values (
  (select fastighet_id from public.objekt where objektnummer = 'STV14-17'),
  (select id from public.objekt where objektnummer = 'STV14-17'),
  'STV14-17',
  'Lars Henrik Norman',
  'STV14-17-2026-NOV-DEC',
  'November–December 2026',
  '2026-11-14',
  8937,
  'Första avi vid tillträde 2026-11-15. Helårshyran 78 000 kr är nedsatt med en hyresfri månad (6 500 kr, punkt 07 i hyreskontraktet), fördelat över avtalsåret: 71 500 kr/år ≈ 5 958 kr/mån. November räknas som halv månad.',
  'skickad',
  '2026-11-07'
);

insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
values
  (
    (select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'),
    (select id from public.objekt where objektnummer = 'STV14-17'),
    'Hyra november 2026 (halv månad, tillträde 2026-11-15)',
    1, 2979, 2979, 'hyra'
  ),
  (
    (select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'),
    (select id from public.objekt where objektnummer = 'STV14-17'),
    'Hyra december 2026 (rabatterad enligt avtal, se anmärkning)',
    1, 5958, 5958, 'hyra'
  );
