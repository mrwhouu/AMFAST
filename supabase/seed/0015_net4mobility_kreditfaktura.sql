-- Net4Mobility HB (852-1007, Diana 2) har redan betalat sin årshyra i förskott,
-- men fick ändå en kvartalsavi (852-1007-2026-Q4, 15 014 kr) för en period som
-- redan är täckt. Krediterar den avin i sin helhet — samma rad, minustecken.

insert into public.fakturor (
  fastighet_id, objekt_id, objektnummer, hyresgast, fakturanummer, period,
  forfallodatum, belopp, anmarkning, status, skickad_datum, typ
) values (
  (select fastighet_id from public.fakturor where fakturanummer = '852-1007-2026-Q4'),
  (select objekt_id from public.fakturor where fakturanummer = '852-1007-2026-Q4'),
  '852-1007',
  'Net4Mobility HB',
  '852-1007-2026-Q4-KREDIT',
  'Oktober–December 2026',
  '2026-09-30',
  -15014,
  'Kreditering av faktura 852-1007-2026-Q4 i sin helhet — hyresgästen har redan betalat årshyran i förskott t.o.m. april, avin skickades felaktigt.',
  'skickad',
  current_date,
  'kreditfaktura'
);

insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
values (
  (select id from public.fakturor where fakturanummer = '852-1007-2026-Q4-KREDIT'),
  (select objekt_id from public.fakturor where fakturanummer = '852-1007-2026-Q4'),
  'Hyra lokal (kreditering av faktura 852-1007-2026-Q4)',
  -1, 15014, -15014, 'kreditering'
);
