-- Import av Lindesås Fastigheter AB-portföljen (privatbostäder/garage i
-- Storå/Stråssa/Lindesberg), underlag: Fakturor.pdf (18 fakturor, fakturanr
-- 1398-1421, inkl. kreditfaktura 1415) + Lindesas_Fastigheter_AB_Kundkort.pdf
-- (30 kunder). Ingen fastighetsbeteckning finns i underlaget, så fastigheter
-- är grupperade per gata/adress (bästa möjliga indelning). Alla objekt är
-- privatbostäder/garage utan momsplikt (ingen faktura visar moms) och utan
-- belagd indexklausul (inget underlag visar KPI/procentklausul för dessa
-- hyresgäster) — momsat = false, indexklausul = false på samtliga.
-- Årshyra = fakturans månadsbelopp × 12 (aktuell nivå, enligt samma princip
-- som använts för övriga objekt i systemet).

insert into public.fastigheter (
  namn, adress, agare, forvaltare, objektnummer_prefix,
  bankgiro, momsregnr, avsandare_adress, telefon, epost
) values
  (
    'Stationsvägen 14, Storå', 'Stationsvägen 14, Storå',
    'Lindesås Fastigheter AB', 'AMfast Fastighetsförvaltning AB', 'STV14-',
    '880-3785', 'SE556897989101', 'Sofielundsvägen 4, 1 tr, 191 47 Sollentuna',
    '070-810 23 72', 'Lindesasfast@gmail.com'
  ),
  (
    'Skäftavägen, Stråssa', 'Skäftavägen 33-39, Stråssa',
    'Lindesås Fastigheter AB', 'AMfast Fastighetsförvaltning AB', 'SKV-',
    '880-3785', 'SE556897989101', 'Sofielundsvägen 4, 1 tr, 191 47 Sollentuna',
    '070-810 23 72', 'Lindesasfast@gmail.com'
  ),
  (
    'Sörvägen, Stråssa', 'Sörvägen 7-11, Stråssa',
    'Lindesås Fastigheter AB', 'AMfast Fastighetsförvaltning AB', 'SOV-',
    '880-3785', 'SE556897989101', 'Sofielundsvägen 4, 1 tr, 191 47 Sollentuna',
    '070-810 23 72', 'Lindesasfast@gmail.com'
  );

-- ---------------------------------------------------------------------------
-- Objekt
-- ---------------------------------------------------------------------------
insert into public.objekt (
  fastighet_id, objektnummer, typ, hyresgast, hyresgast_orgnr, hyresgast_kontakt,
  area_kvm, kr_per_kvm, hyra_ar, fastighetsskatt_ar, ovrigt_ar, status,
  gata, momsat, faktureringsintervall
) values
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-01', 'Lägenhet', 'Markus & Veronica Berg-Larsson', null, null, 0, 0, 129996, 0, 0, 'uthyrd', 'Stationsvägen 14 LGH 1201, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-02', 'Lägenhet', 'Mahad Adem', '021010-3339', 'youngmahad40@gmail.com', 0, 0, 54120, 0, 0, 'uthyrd', 'Stationsvägen 14 lgh 14:1104, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-03', 'Lägenhet', 'Konrad Robert', '830507-02511 Po', 'konri1983@o2.pl', 0, 0, 40800, 0, 0, 'uthyrd', 'Stationsvägen 14 Lgh 14:1204, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-04', 'Lägenhet', 'Jessica Emanuelsson', '740313-0185', 'jessicaemanuelsson251@gmail.com, tel 0760712937', 0, 0, 100800, 0, 0, 'uthyrd', 'Stationsvägen 14 Lgh 14:1203, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-05', 'Lägenhet', 'Lena Maria Magnusson/ Sören Jansson', '601027-6241', null, 0, 0, 75540, 0, 0, 'uthyrd', 'Stationsvägen 14 Lgh 14:1004, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-06', 'Lägenhet', 'Medina Shiiq Ahmed', '800206-6168', null, 0, 0, 150000, 0, 0, 'uthyrd', 'Stationsvägen 14 Lgh 14:1001, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-07', 'Lägenhet', 'Ida Johanneson', null, 'idat97@hotmail.se', 0, 0, 89496, 0, 0, 'uthyrd', 'Stationsvägen 14 Lgh 1002, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-08', 'Garage', 'Håkan Einarsson', '610715-6710', 'hakan@vtb.nu', 0, 0, 5400, 0, 0, 'uthyrd', 'Garage, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-09', 'Garage', 'Sven-Ingvar Olsson', '620425-6652', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-10', 'Garage', 'Tim Wilhelmsson', '631019-6990', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage nr 1, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-11', 'Garage', 'Tim Wilhelmsson', '631019-6990', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage nr 2, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-12', 'Garage', 'Tim Wilhelmsson', '631019-6990', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage nr 3, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-13', 'Garage', 'Lo-Montering i Storå AB', '556691-6952', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage nr 1, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-14', 'Garage', 'Lo-Montering i Storå AB', '556691-6952', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage nr 2, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Stationsvägen 14, Storå'), 'STV14-15', 'Garage', 'Carina Gyllstrand', '600128-6688', null, 0, 0, 4884, 0, 0, 'uthyrd', 'Garage 3011, Stationsvägen 14, Storå', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Skäftavägen, Stråssa'), 'SKV-01', 'Hus', 'Linnea Kocsi', null, 'linneakocsi7@gmail.com', 0, 0, 60000, 0, 0, 'uthyrd', 'Skäftavägen 33, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Skäftavägen, Stråssa'), 'SKV-02', 'Hus', 'Rolf Welamsson', '620803-6613', null, 0, 0, 43164, 0, 0, 'uthyrd', 'Skäftavägen 35, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Skäftavägen, Stråssa'), 'SKV-03', 'Hus', 'Simon Welamsson', '930507-3810', null, 0, 0, 66840, 0, 0, 'uthyrd', 'Skäftavägen 37, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Skäftavägen, Stråssa'), 'SKV-04', 'Hus', 'Krister Vikström', '560517-6659', 'krister.vikstrom56@gmail.com', 0, 0, 59280, 0, 0, 'uthyrd', 'Skäftavägen 39, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-01', 'Hus', 'Peter Johansson', '760531-6632', null, 0, 0, 66840, 0, 0, 'uthyrd', 'Sörvägen 7, Stråssa', false, 'manadsvis'),
  ((select id from public.fastigheter where namn = 'Sörvägen, Stråssa'), 'SOV-02', 'Hus', 'Åke Bengtsson', '560517-6659', null, 0, 0, 66840, 0, 0, 'uthyrd', 'Sörvägen 11, Stråssa', false, 'manadsvis');

-- ---------------------------------------------------------------------------
-- Fakturor (samtliga för period september 2026, betalningsvillkor 30 dagar
-- netto, förfallodatum 2026-08-31 om inget annat anges i underlaget)
-- ---------------------------------------------------------------------------
insert into public.fakturor (
  fastighet_id, objekt_id, objektnummer, hyresgast, fakturanummer, period,
  forfallodatum, belopp, anmarkning, status, skickad_datum, typ
) values
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-01'),
    (select id from public.objekt where objektnummer = 'STV14-01'),
    'STV14-01', 'Markus & Veronica Berg-Larsson', '1398', '2026-09', '2026-08-31', 10833, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-02'),
    (select id from public.objekt where objektnummer = 'STV14-02'),
    'STV14-02', 'Mahad Adem', '1399', '2026-09', '2026-08-31', 4510, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SKV-01'),
    (select id from public.objekt where objektnummer = 'SKV-01'),
    'SKV-01', 'Linnea Kocsi', '1400', '2026-09', '2026-08-31', 5000, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SKV-04'),
    (select id from public.objekt where objektnummer = 'SKV-04'),
    'SKV-04', 'Krister Vikström', '1401', '2026-09', '2026-08-31', 4940, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-03'),
    (select id from public.objekt where objektnummer = 'STV14-03'),
    'STV14-03', 'Konrad Robert', '1402', '2026-09', '2026-08-31', 3400, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-04'),
    (select id from public.objekt where objektnummer = 'STV14-04'),
    'STV14-04', 'Jessica Emanuelsson', '1403', '2026-09', '2026-08-31', 8400, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-08'),
    (select id from public.objekt where objektnummer = 'STV14-08'),
    'STV14-08', 'Håkan Einarsson', '1404', '2026-09', '2026-08-31', 450, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-15'),
    (select id from public.objekt where objektnummer = 'STV14-15'),
    'STV14-15', 'Carina Gyllstrand', '1405', '2026-09', '2026-08-31', 407, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-05'),
    (select id from public.objekt where objektnummer = 'STV14-05'),
    'STV14-05', 'Lena Maria Magnusson/ Sören Jansson', '1406', '2026-09', '2026-08-31', 6295, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    -- Två garage på en gemensam faktura (Lo-Montering) — se faktura_rader.
    (select fastighet_id from public.objekt where objektnummer = 'STV14-13'),
    null,
    null, 'Lo-Montering i Storå AB', '1407', '2026-09', '2026-08-31', 814, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-06'),
    (select id from public.objekt where objektnummer = 'STV14-06'),
    'STV14-06', 'Medina Shiiq Ahmed', '1408', '2026-09', '2026-08-31', 12500, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SOV-01'),
    (select id from public.objekt where objektnummer = 'SOV-01'),
    'SOV-01', 'Peter Johansson', '1409', '2026-09', '2026-08-31', 5570, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-09'),
    (select id from public.objekt where objektnummer = 'STV14-09'),
    'STV14-09', 'Sven-Ingvar Olsson', '1412', '2026-09', '2026-08-31', 407, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    -- Tre garage på en gemensam faktura (Tim Wilhelmsson) — se faktura_rader.
    (select fastighet_id from public.objekt where objektnummer = 'STV14-10'),
    null,
    null, 'Tim Wilhelmsson', '1413', '2026-09', '2026-08-31', 1221, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SOV-02'),
    (select id from public.objekt where objektnummer = 'SOV-02'),
    'SOV-02', 'Åke Bengtsson', '1414', '2026-09', '2026-08-31', 5570, null, 'skickad', '2026-06-01', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SKV-02'),
    (select id from public.objekt where objektnummer = 'SKV-02'),
    'SKV-02', 'Rolf Welamsson', '1415', '2026-08', '2026-06-01',
    -3597, 'Kreditering av faktura 1393 (Hyra augusti) i sin helhet. Faktura 1393 ingår inte i detta underlag — kontraktsstatus för Skäftavägen 35 bör verifieras manuellt.',
    'betald', '2026-06-01', 'kreditfaktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'STV14-07'),
    (select id from public.objekt where objektnummer = 'STV14-07'),
    'STV14-07', 'Ida Johanneson', '1418', '2026-09', '2026-08-31', 7458, null, 'skickad', '2026-06-10', 'faktura'
  ),
  (
    (select fastighet_id from public.objekt where objektnummer = 'SKV-03'),
    (select id from public.objekt where objektnummer = 'SKV-03'),
    'SKV-03', 'Simon Welamsson', '1421', '2026-09', '2026-07-30', 5570, null, 'skickad', '2026-06-30', 'faktura'
  );

update public.fakturor set betald_datum = '2026-06-01' where fakturanummer = '1415';

-- ---------------------------------------------------------------------------
-- Fakturarader (specifikation per faktura)
-- ---------------------------------------------------------------------------
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ)
values
  ((select id from public.fakturor where fakturanummer = '1398'), (select id from public.objekt where objektnummer = 'STV14-01'), 'Hyra September, Stationsvägen 14 LGH 14:1201', 1, 10833, 10833, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1399'), (select id from public.objekt where objektnummer = 'STV14-02'), 'Hyra September, Lgh 14:1104', 1, 4510, 4510, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1400'), (select id from public.objekt where objektnummer = 'SKV-01'), 'Hyresavi september, Lgh 33', 1, 5000, 5000, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1401'), (select id from public.objekt where objektnummer = 'SKV-04'), 'Hyra September, Skäftavägen 39', 1, 4940, 4940, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1402'), (select id from public.objekt where objektnummer = 'STV14-03'), 'Hyra September, Lgh 14:1204', 1, 3400, 3400, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1403'), (select id from public.objekt where objektnummer = 'STV14-04'), 'Hyra September, Lgh 14:1203', 1, 8400, 8400, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1404'), (select id from public.objekt where objektnummer = 'STV14-08'), 'Garagehyra September, Stationsvägen', 1, 450, 450, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1405'), (select id from public.objekt where objektnummer = 'STV14-15'), '3011 Hyra Garage September', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1406'), (select id from public.objekt where objektnummer = 'STV14-05'), 'Hyra September, Lgh 14:1004', 1, 6295, 6295, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1407'), (select id from public.objekt where objektnummer = 'STV14-13'), 'Garagehyra nr 1 September, Stationsvägen', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1407'), (select id from public.objekt where objektnummer = 'STV14-14'), 'Garagehyra nr 2 September, Stationsvägen', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1408'), (select id from public.objekt where objektnummer = 'STV14-06'), 'Hyra September, Lgh 14:1001', 1, 12500, 12500, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1409'), (select id from public.objekt where objektnummer = 'SOV-01'), 'Hyra September, Sörvägen 7', 1, 5570, 5570, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1412'), (select id from public.objekt where objektnummer = 'STV14-09'), 'Garagehyra Stationsvägen September', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1413'), (select id from public.objekt where objektnummer = 'STV14-10'), 'Garagehyra nr 1 September, Stationsvägen', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1413'), (select id from public.objekt where objektnummer = 'STV14-11'), 'Garagehyra nr 2 September, Stationsvägen', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1413'), (select id from public.objekt where objektnummer = 'STV14-12'), 'Garagehyra nr 3 September, Stationsvägen', 1, 407, 407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1414'), (select id from public.objekt where objektnummer = 'SOV-02'), 'Hyra September, Sörvägen 11', 1, 5570, 5570, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1415'), (select id from public.objekt where objektnummer = 'SKV-02'), 'Hyra augusti, Skäftavägen 35 (kreditering av faktura 1393)', -1, 3597, -3597, 'kreditering'),
  ((select id from public.fakturor where fakturanummer = '1418'), (select id from public.objekt where objektnummer = 'STV14-07'), 'Hyresavi september, Lgh 1002', 1, 7458, 7458, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '1421'), (select id from public.objekt where objektnummer = 'SKV-03'), 'Hyra September, Skäftavägen 37', 1, 5570, 5570, 'hyra');
