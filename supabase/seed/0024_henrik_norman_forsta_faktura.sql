-- Första hyresavi till Lars Henrik Norman (STV14-17), begärd direkt av
-- fastighetsägaren via mejl innan tillträdet 2026-11-15 — täcker november
-- (från tillträdesdagen, prorata) + december, med den avtalade
-- engångsrabatten om en hyresfri månad avdragen.
--
-- November: 16 av 30 dagar (2026-11-15–30) × 6 500 kr/mån = 3 466,67 kr → 3 467 kr
-- December: hel månad = 6 500 kr
-- Rabatt (en hyresfri månad enligt avtalet, punkt 07): −6 500 kr
-- Att betala: 3 467 kr

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
  3467,
  'Första avi vid tillträde 2026-11-15. Inkluderar avtalad hyresrabatt om en hyresfri månad (punkt 07 i hyreskontraktet).',
  'skickad',
  '2026-11-07'
);

insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
values
  (
    (select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'),
    (select id from public.objekt where objektnummer = 'STV14-17'),
    'Hyra november 2026 (16/30 dagar fr.o.m. tillträde 2026-11-15)',
    1, 3467, 3467, 'hyra'
  ),
  (
    (select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'),
    (select id from public.objekt where objektnummer = 'STV14-17'),
    'Hyra december 2026',
    1, 6500, 6500, 'hyra'
  ),
  (
    (select id from public.fakturor where fakturanummer = 'STV14-17-2026-NOV-DEC'),
    (select id from public.objekt where objektnummer = 'STV14-17'),
    'Hyresrabatt enligt avtal (en hyresfri månad)',
    -1, 6500, -6500, 'kreditering'
  );
