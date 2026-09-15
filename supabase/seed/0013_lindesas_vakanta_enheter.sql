-- Komplettering av Storå/Stråssa-portföljen med samtliga enheter från den
-- fullständiga fastighetsförteckningen (Lindesberg Storå 13:9 samt Kårberget
-- 3:49/3:50/3:51), som visade att beståndet är betydligt större än det vi
-- tidigare haft underlag för (bara de objekt som fanns i det ursprungliga
-- fakturaunderlaget, se 0003_lindesas_import.sql).
--
-- Alla nya enheter läggs in som vakanta (status = 'vakant', hyra/yta okänd
-- tills bekräftat) — de saknar helt underlag för hyra, area och ev.
-- hyresgäst. Stationsvägen 12 och 16 är nya byggnader vi aldrig haft i
-- systemet och får därför egna fastigheter. Sörvägen-adresserna läggs in
-- under den befintliga fastigheten 'Sörvägen, Stråssa' (samma pragmatiska
-- gruppering per gata som redan används, oavsett att de legalt tillhör två
-- olika fastighetsbeteckningar, Kårberget 3:49 och 3:50).
--
-- Stationsvägen 14: ett garage bekräftat tomt utöver de 8 redan uthyrda
-- (STV14-08–15) — läggs in som STV14-23.

insert into public.fastigheter (
  namn, adress, agare, forvaltare, objektnummer_prefix,
  bankgiro, momsregnr, avsandare_adress, telefon, epost
) values
  (
    'Stationsvägen 12, Storå', 'Stationsvägen 12, Storå',
    'Lindesås Fastigheter AB', 'AMfast Fastighetsförvaltning AB', 'STV12-',
    '880-3785', 'SE556897989101', 'Sofielundsvägen 4, 1 tr, 191 47 Sollentuna',
    '070-810 23 72', 'Lindesasfast@gmail.com'
  ),
  (
    'Stationsvägen 16, Storå', 'Stationsvägen 16, Storå',
    'Lindesås Fastigheter AB', 'AMfast Fastighetsförvaltning AB', 'STV16-',
    '880-3785', 'SE556897989101', 'Sofielundsvägen 4, 1 tr, 191 47 Sollentuna',
    '070-810 23 72', 'Lindesasfast@gmail.com'
  );

-- ---------------------------------------------------------------------------
-- Stationsvägen 12, Storå — 13 lägenheter + 7 garage, samtliga vakanta
-- ---------------------------------------------------------------------------
insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, gata, momsat, faktureringsintervall
) values
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-01', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1201, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-02', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1202, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-03', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1203, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-04', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1204, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-05', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1205, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-06', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1101, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-07', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1102, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-08', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1103, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-09', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1104, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-10', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1105, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-11', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1001, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-12', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1002, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-13', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 12 Lgh 12:1003, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-14', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 1, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-15', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 2, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-16', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 3, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-17', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 4, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-18', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 5, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-19', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 6, Stationsvägen 12, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 12, Storå'), 'STV12-20', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 7, Stationsvägen 12, Storå', false, 'manadsvis');

-- ---------------------------------------------------------------------------
-- Stationsvägen 14, Storå — 7 vakanta lägenheter + 1 vakant garage
-- (befintlig fastighet, fortsätter objektnummer-serien från STV14-15)
-- ---------------------------------------------------------------------------
insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, gata, momsat, faktureringsintervall
) values
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-16', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1205, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-17', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1202, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-18', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1105, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-19', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1103, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-20', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1102, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-21', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1101, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-22', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 14 Lgh 14:1003, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-23', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage (tomt), Stationsvägen 14, Storå', false, 'manadsvis');

-- ---------------------------------------------------------------------------
-- Stationsvägen 16, Storå — 16 lägenheter + 1 lokal + 6 garage, samtliga vakanta
-- ---------------------------------------------------------------------------
insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, gata, momsat, faktureringsintervall
) values
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-01', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1201, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-02', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1202, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-03', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1203, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-04', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1204, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-05', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1205, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-06', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1101, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-07', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1102, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-08', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1103, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-09', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1104, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-10', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1105, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-11', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1106, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-12', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1001, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-13', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1002, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-14', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1003, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-15', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1004, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-16', 'Lägenhet', null, 0, 0, 0, 0, 0, 'vakant', 'Stationsvägen 16 Lgh 16:1005, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-17', 'Lokal', null, 0, 0, 0, 0, 0, 'vakant', 'Lokal, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-18', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 1, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-19', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 2, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-20', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 3, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-21', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 4, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-22', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 5, Stationsvägen 16, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 16, Storå'), 'STV16-23', 'Garage', null, 0, 0, 0, 0, 0, 'vakant', 'Garage nr 6, Stationsvägen 16, Storå', false, 'manadsvis');

-- ---------------------------------------------------------------------------
-- Sörvägen, Stråssa — 13 vakanta hus (Kårberget 3:49 + resten av 3:50),
-- befintlig fastighet, fortsätter objektnummer-serien från SOV-02
-- ---------------------------------------------------------------------------
insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, area_kvm, kr_per_kvm,
  hyra_ar, fastighetsskatt_ar, ovrigt_ar, status, gata, momsat, faktureringsintervall
) values
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-03', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 1, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-04', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 3, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-05', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 5, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-06', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 9, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-07', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 13, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-08', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 15, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-09', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 17, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-10', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 19/21, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-11', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 23, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-12', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 25, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-13', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 27, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-14', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 29, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-15', 'Hus', null, 0, 0, 0, 0, 0, 'vakant', 'Sörvägen 31, Stråssa', false, 'manadsvis');
