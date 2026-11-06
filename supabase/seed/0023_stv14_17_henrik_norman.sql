-- Ny hyresgäst: signerat hyreskontrakt (Visma Sign, kontrakt nr 141202) för
-- Stationsvägen 14 Lgh 14:1202, Storå — matchar det befintliga vakanta
-- objektet STV14-17 (samma lägenhetsnummer, se 0013/0014).
--
-- OBS 1: kontraktet anger slutdatum 2027-11-31, vilket inte är ett giltigt
-- kalenderdatum (november har 30 dagar) — rättat till 2027-11-30 här.
-- OBS 2: kontraktet anger "ca 60 kvm", men objektets yta är redan satt till
-- 56 kvm från den bekräftade rum-/ytasammanställningen (0014) — den mer
-- exakta siffran lämnas oförändrad, kontraktets "ca"-värde skrivs inte över.
--
-- Bostadslägenhet → momsat = false. Ingen fastighetsskatt/övrigt
-- särredovisas (hyra "enligt avi", inga tillägg ikryssade i kontraktet).

select set_config('app.historik_orsak', 'Nytt hyresavtal: Lars Henrik Norman (STV14-17)', true);

update public.objekt
set hyresgast = 'Lars Henrik Norman',
    hyresgast_orgnr = '19710613-0458',
    hyresgast_kontakt = '070-201 64 96',
    hyresgast_epost = 'henrik.norman.69@gmail.com',
    status = 'uthyrd',
    kontrakt_fran = '2026-11-15',
    kontrakt_tom = '2027-11-30',
    hyra_ar = 78000,
    kr_per_kvm = round(78000::numeric / nullif(area_kvm, 0)),
    uppsagningstid_manader = 3,
    forlangning_manader = 12,
    momsat = false
where objektnummer = 'STV14-17';
