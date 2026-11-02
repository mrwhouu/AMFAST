-- Säkerställer att Decuria AB (852-2002) inte redan har en Q4 2026-faktura
-- liggande på de gamla avtalsvillkoren (142 kvm) innan det nya, delade
-- kontraktet (93 kvm, 372 000 kr/år, 41 850 kr fastighetsskatt) fakturerades
-- via avi-generatorn. Tar bort ev. befintlig faktura för perioden så att
-- "Bygg lista" → "Godkänn och skicka" i Avisering genererar en ny, korrekt
-- faktura istället för att blockeras av "redan fakturerad" eller skicka ut
-- fel belopp.

delete from public.faktura_rader where faktura_id in (
  select id from public.fakturor
  where hyresgast = 'Decuria AB'
    and period = 'Oktober–December 2026'
);
delete from public.fakturor
where hyresgast = 'Decuria AB'
  and period = 'Oktober–December 2026';
