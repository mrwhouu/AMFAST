-- Yta/rumsantal från "Information lägenheter hyror 2023 till Carl.xlsx".
-- Filens hyresgästuppgifter är från 2019/2023 och ANVÄNDS INTE — vår egen
-- hyresgästdata är korrekt och nyare. Endast yta (och därav härledd kr/kvm
-- för redan uthyrda objekt) hämtas härifrån.
--
-- Samtidigt: de enda vakanta lägenheterna i Stationsvägen 12 och 16 som är
-- i uthyrningsbart skick just nu är 1:orna (23 kvm) — övriga vakanta
-- lägenheter i de två husen kräver upprustning. Stationsvägen 14 lämnas
-- orört i det avseendet (huset är enligt underlaget redan till största
-- delen renoverat).

-- 1:or i Stationsvägen 12 och 16: uthyrningsbara, vakanshyra 3 500 kr/mån.
update public.objekt set area_kvm = 23, uthyrningsbar = true, vakanshyra_ar = 42000
where objektnummer in ('STV12-04', 'STV12-09', 'STV16-04', 'STV16-10');

-- Övriga vakanta lägenheter i Stationsvägen 12 och 16: kräver upprustning.
update public.objekt set uthyrningsbar = false
where objektnummer in (
  'STV12-01', 'STV12-02', 'STV12-03', 'STV12-05', 'STV12-06', 'STV12-07', 'STV12-08', 'STV12-10', 'STV12-11', 'STV12-12', 'STV12-13',
  'STV16-01', 'STV16-02', 'STV16-03', 'STV16-05', 'STV16-06', 'STV16-08', 'STV16-09', 'STV16-11', 'STV16-12', 'STV16-13', 'STV16-14', 'STV16-15', 'STV16-16'
);

-- Yta för övriga vakanta enheter (ingen hyra känd ännu).
update public.objekt set area_kvm = 61 where objektnummer = 'STV12-01';
update public.objekt set area_kvm = 80 where objektnummer = 'STV12-02';
update public.objekt set area_kvm = 75 where objektnummer = 'STV12-03';
update public.objekt set area_kvm = 56 where objektnummer = 'STV12-05';
update public.objekt set area_kvm = 61 where objektnummer = 'STV12-06';
update public.objekt set area_kvm = 80 where objektnummer = 'STV12-07';
update public.objekt set area_kvm = 75 where objektnummer = 'STV12-08';
update public.objekt set area_kvm = 56 where objektnummer = 'STV12-10';
update public.objekt set area_kvm = 138 where objektnummer = 'STV12-11';
update public.objekt set area_kvm = 56 where objektnummer = 'STV12-13';
-- STV12-12 (12:1002) saknas i underlaget — lämnas orört.
update public.objekt set area_kvm = 61 where objektnummer = 'STV16-01';
update public.objekt set area_kvm = 75 where objektnummer = 'STV16-02';
update public.objekt set area_kvm = 80 where objektnummer = 'STV16-03';
update public.objekt set area_kvm = 56 where objektnummer = 'STV16-05';
update public.objekt set area_kvm = 61 where objektnummer = 'STV16-06';
update public.objekt set area_kvm = 61 where objektnummer = 'STV16-08';
update public.objekt set area_kvm = 75 where objektnummer = 'STV16-09';
update public.objekt set area_kvm = 56 where objektnummer = 'STV16-11';
update public.objekt set area_kvm = 84 where objektnummer = 'STV16-12';
update public.objekt set area_kvm = 57 where objektnummer = 'STV16-13';
update public.objekt set area_kvm = 75 where objektnummer = 'STV16-14';
update public.objekt set area_kvm = 56 where objektnummer = 'STV16-16';
update public.objekt set area_kvm = 56 where objektnummer = 'STV16-17'; -- Lokal
-- STV16-15 (16:1004) saknas i underlaget — lämnas orört.
update public.objekt set area_kvm = 56 where objektnummer = 'STV14-16';
update public.objekt set area_kvm = 56 where objektnummer = 'STV14-17';
update public.objekt set area_kvm = 56 where objektnummer = 'STV14-18';
update public.objekt set area_kvm = 75 where objektnummer = 'STV14-19';
update public.objekt set area_kvm = 80 where objektnummer = 'STV14-20';
update public.objekt set area_kvm = 61 where objektnummer = 'STV14-21';
update public.objekt set area_kvm = 23 where objektnummer = 'STV14-22';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-03';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-04';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-05';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-06';
update public.objekt set area_kvm = 70.6 where objektnummer = 'SOV-07';
update public.objekt set area_kvm = 47 where objektnummer = 'SOV-08';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-09';
update public.objekt set area_kvm = 120.4 where objektnummer = 'SOV-10';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-11';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-12';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-13';
update public.objekt set area_kvm = 47 where objektnummer = 'SOV-14';
update public.objekt set area_kvm = 60.2 where objektnummer = 'SOV-15';

-- Yta + härledd kr/kvm/år för redan uthyrda enheter (hyresgäst/hyra rörs INTE).
update public.objekt set area_kvm = 84, kr_per_kvm = 1548 where objektnummer = 'STV14-01';
update public.objekt set area_kvm = 23, kr_per_kvm = 2353 where objektnummer = 'STV14-02';
update public.objekt set area_kvm = 23, kr_per_kvm = 1774 where objektnummer = 'STV14-03';
update public.objekt set area_kvm = 75, kr_per_kvm = 1344 where objektnummer = 'STV14-04';
update public.objekt set area_kvm = 56, kr_per_kvm = 1349 where objektnummer = 'STV14-05';
update public.objekt set area_kvm = 141, kr_per_kvm = 1064 where objektnummer = 'STV14-06';
update public.objekt set area_kvm = 75, kr_per_kvm = 1193 where objektnummer = 'STV14-07';
update public.objekt set area_kvm = 60.2, kr_per_kvm = 1110 where objektnummer = 'SOV-01';
update public.objekt set area_kvm = 60.2, kr_per_kvm = 1110 where objektnummer = 'SOV-02';
update public.objekt set area_kvm = 82, kr_per_kvm = 732 where objektnummer = 'SKV-01';
update public.objekt set area_kvm = 47, kr_per_kvm = 918 where objektnummer = 'SKV-02';
update public.objekt set area_kvm = 82, kr_per_kvm = 815 where objektnummer = 'SKV-03';
update public.objekt set area_kvm = 82, kr_per_kvm = 723 where objektnummer = 'SKV-04';

-- Garage: 15 kvm styck (Stationsvägen 12/14/16).
update public.objekt set area_kvm = 15
where objektnummer in (
  'STV12-14', 'STV12-15', 'STV12-16', 'STV12-17', 'STV12-18', 'STV12-19', 'STV12-20',
  'STV14-08', 'STV14-09', 'STV14-10', 'STV14-11', 'STV14-12', 'STV14-13', 'STV14-14', 'STV14-15', 'STV14-23',
  'STV16-18', 'STV16-19', 'STV16-20', 'STV16-21', 'STV16-22', 'STV16-23'
);

-- 16:1102 är egentligen ett förråd, inte en lägenhet.
update public.objekt set typ = 'Förråd', area_kvm = 0 where objektnummer = 'STV16-07';
