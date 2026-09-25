-- Samma missade momsat-bugg som Kockum (852-2007): tre kommersiella
-- kontorslokaler i Juno 9 stod kvar på momsat = false trots att de är
-- vanliga uthyrda kontor (samma mönster som redan momsatta 852-2006/2007
-- i samma fastighet).
--
-- Rör INTE: 852-2001 (Marita Lillich) är en bostadslägenhet — momsfri
-- enligt lag. 852-1007 (Net4Mobility, Antennplats) är en mastupplåtelse,
-- inte en vanlig lokal — lämnas tills det är bekräftat mot en riktig
-- faktura. 851-1003/852-1004 är redan bekräftat momsfria (0005_momsat_
-- korrigering.sql).

update public.objekt set momsat = true
where objektnummer in (
  '852-2002', -- Decuria AB
  '852-2009', -- Paydrive AB
  '852-2010'  -- The Flow E-Networks AB
);

-- Dessa tre har redan Q4-fakturor (skapade innan momsat rättades), så ta
-- bort dem för att kunna byggas om med rätt moms via avi-generatorn.
delete from public.faktura_rader where faktura_id in (
  select id from public.fakturor
  where hyresgast in ('Decuria AB', 'Paydrive AB', 'The Flow E-Networks AB')
    and period in ('Oktober–December 2026', 'Oktober 2026', 'November 2026', 'December 2026')
);
delete from public.fakturor
where hyresgast in ('Decuria AB', 'Paydrive AB', 'The Flow E-Networks AB')
  and period in ('Oktober–December 2026', 'Oktober 2026', 'November 2026', 'December 2026');
