-- Samma bugg som för Endra/Asko: objekt.momsat stod på false för Kockum
-- Luttinger Söderström Arkitektkontor AB (852-2007, Juno 9), så de tre
-- månadsfakturorna för okt/nov/dec 2026 saknade momsraden helt (jämför
-- 852-2006 IHE i samma fastighet, som redan har momsat = true och visar
-- moms korrekt).

update public.objekt set momsat = true where objektnummer = '852-2007';

-- Ta bort de tre redan skapade fakturorna utan moms så de kan byggas om.
delete from public.faktura_rader where faktura_id in (
  select id from public.fakturor where fakturanummer in (
    '852-2007-2026-10', '852-2007-2026-11', '852-2007-2026-12'
  )
);
delete from public.fakturor where fakturanummer in (
  '852-2007-2026-10', '852-2007-2026-11', '852-2007-2026-12'
);
