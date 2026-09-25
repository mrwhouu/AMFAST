-- Ny hyresgäst: signerat hyreskontrakt (Visma Sign) för Skäftavägen 31,
-- Stråssa — samma gata/fastighetsgrupp som SKV-01–04 (Skäftavägen 33-39,
-- Stråssa, kommun Lindesberg), så objektet läggs in under den befintliga
-- fastigheten 'Skäftavägen, Stråssa' istället för att skapa en ny.
--
-- Bostadslägenhet (hus) → momsat = false, ingen fastighetsskatt/övrigt
-- särredovisas (hyra "enligt avi", garage/bilplats ingår i hyran enligt
-- kontraktet). Uppsägningstid och förlängning tagna direkt ur kontraktet
-- (3 / 12 månader, avviker från schemats default 9 / 36).

insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, hyresgast_orgnr, hyresgast_kontakt,
  area_kvm, kr_per_kvm, hyra_ar, fastighetsskatt_ar, ovrigt_ar, status,
  gata, momsat, faktureringsintervall, kontrakt_fran, kontrakt_tom,
  uppsagningstid_manader, forlangning_manader
) values (
  (select id from public.fastigheter where namn = 'Skäftavägen, Stråssa'),
  'SKV-05', 'Hus', 'Dan, Keijo Mickael Ekström', '780219-0350', 'Danne.ekstrom@hotmail.se, tel 072-8322128',
  82, 805, 66000, 0, 0, 'uthyrd',
  'Skäftavägen 31, Stråssa', false, 'manadsvis', '2026-10-01', '2027-09-30',
  3, 12
);
