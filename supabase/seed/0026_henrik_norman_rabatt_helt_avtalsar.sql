-- Hyresrabatten (en hyresfri månad, 6 500 kr) gäller inte bara första
-- fakturan — fastighetsägaren bekräftar att den ska fördelas över hela det
-- första avtalsåret, 2026-11-15–2027-11-15 (12 månader från tillträdet).
--
-- Sätter objektets löpande årshyra till den rabatterade nivån så att den
-- automatiska aviseringen (december 2026 – oktober 2027) fakturerar rätt
-- belopp utan manuell inblandning varje månad:
--   78 000 kr/år − 6 500 kr = 71 500 kr/år ≈ 5 958 kr/mån
--
-- VIKTIGT — MANUELL UPPFÖLJNING KRÄVS: det här är bara en nuvarande
-- årshyra, inte en tidsbegränsad rabatt i systemet. Hyran måste ändras
-- TILLBAKA till 78 000 kr/år (6 500 kr/mån) för fakturering från och med
-- 2027-11-15, annars fortsätter den rabatterade nivån gälla efter att
-- rabattåret är slut. Lägg en påminnelse för detta separat.

update public.objekt
set hyra_ar = 71500,
    kr_per_kvm = round(71500::numeric / nullif(area_kvm, 0))
where objektnummer = 'STV14-17';
