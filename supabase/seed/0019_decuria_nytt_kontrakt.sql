-- Signerat hyreskontrakt för Decuria AB (852-2002), inläst från
-- Hyresavtal_Decuria.pdf (signerat via Visma Sign 2026-09-28–30).
--
-- Bekräftar beloppen från 0017 (372 000 kr/år hyra, 41 850 kr/år
-- fastighetsskatt, 93 kvm, momspliktig) och sätter den nya kontraktsperioden
-- med indexklausul (KPI, basmånad oktober 2026, första omräkning
-- 2027-10-01) samt uppsägnings-/förlängningsvillkor.

update public.objekt
set kontrakt_fran = '2026-10-01',
    kontrakt_tom = '2027-09-30',
    indexklausul = true,
    bas_hyra_ar = 372000,
    uppsagningstid_manader = 6,
    forlangning_manader = 12,
    uppsagning_mottagen = false,
    uppsagning_datum = null,
    momsat = true
where objektnummer = '852-2002';
