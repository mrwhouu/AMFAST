-- Ersätter den generiska en-rads-specifikationen (skapad av migration 0005:s
-- engångsmigrering "1 rad per befintlig faktura") med den EXAKTA
-- radspecifikationen från de riktiga Savills-fakturorna
-- (Dina_Försäkringar_Hyresavier_Q32026.pdf), så att fakturavyn visar precis
-- samma innehåll som originalen — bara med AMfast:s varumärke istället för
-- Savills (det bytet är redan gjort i koden, inget att göra här).
--
-- "Varav X kr är indextillägg" i originalet är en notering på samma rad
-- (inte ett eget belopp) och läggs därför in som text i beskrivningen,
-- inte som en separat rad — annars skulle totalsumman bli fel.
--
-- fakturor.belopp uppdateras samtidigt så det stämmer exakt mot
-- "Totalt (inkl. moms)" (eller "Totalt" för momsfria fakturor) i originalet.

-- 851000168 — Bistro Nordique AB, juli 2026
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000168');
update public.fakturor set belopp = 77208 where fakturanummer = '851000168';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000168'), (select id from public.objekt where objektnummer = '851-1002'), 'Hyra lokal (varav 12 092 kr är indextillägg)', 1, 48317, 48317, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000168'), (select id from public.objekt where objektnummer = '851-1002'), 'Fastighetsskatt', 1, 7268, 7268, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000168'), (select id from public.objekt where objektnummer = '851-1002'), 'Värme (varav 1 238 kr är indextillägg)', 1, 4947, 4947, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000168'), (select id from public.objekt where objektnummer = '851-1001'), 'Hyra lager (varav 167 kr är indextillägg)', 1, 667, 667, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000168'), (select id from public.objekt where objektnummer = '851-1009'), 'Hyra lokal (varav 99 kr är indextillägg)', 1, 567, 567, 'hyra');

-- 851000169 — Bistro Nordique AB, augusti 2026 (samma specifikation som föregående kvartal)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000169');
update public.fakturor set belopp = 77208 where fakturanummer = '851000169';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000169'), (select id from public.objekt where objektnummer = '851-1002'), 'Hyra lokal (varav 12 092 kr är indextillägg)', 1, 48317, 48317, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000169'), (select id from public.objekt where objektnummer = '851-1002'), 'Fastighetsskatt', 1, 7268, 7268, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000169'), (select id from public.objekt where objektnummer = '851-1002'), 'Värme (varav 1 238 kr är indextillägg)', 1, 4947, 4947, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000169'), (select id from public.objekt where objektnummer = '851-1001'), 'Hyra lager (varav 167 kr är indextillägg)', 1, 667, 667, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000169'), (select id from public.objekt where objektnummer = '851-1009'), 'Hyra lokal (varav 99 kr är indextillägg)', 1, 567, 567, 'hyra');

-- 851000170 — Bistro Nordique AB, september 2026 (samma specifikation)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000170');
update public.fakturor set belopp = 77208 where fakturanummer = '851000170';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000170'), (select id from public.objekt where objektnummer = '851-1002'), 'Hyra lokal (varav 12 092 kr är indextillägg)', 1, 48317, 48317, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000170'), (select id from public.objekt where objektnummer = '851-1002'), 'Fastighetsskatt', 1, 7268, 7268, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000170'), (select id from public.objekt where objektnummer = '851-1002'), 'Värme (varav 1 238 kr är indextillägg)', 1, 4947, 4947, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000170'), (select id from public.objekt where objektnummer = '851-1001'), 'Hyra lager (varav 167 kr är indextillägg)', 1, 667, 667, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000170'), (select id from public.objekt where objektnummer = '851-1009'), 'Hyra lokal (varav 99 kr är indextillägg)', 1, 567, 567, 'hyra');

-- 851000171 — Dina Försäkring AB, kvartal (momsfri)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000171');
update public.fakturor set belopp = 3505821 where fakturanummer = '851000171';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000171'), (select id from public.objekt where objektnummer = '851-1003'), 'Hyra lokal (varav 77 593 kr är indextillägg)', 1, 3165246, 3165246, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000171'), (select id from public.objekt where objektnummer = '851-1003'), 'Fastighetsskatt', 1, 340575, 340575, 'drift');

-- 851000172 — Helioworks Slottsbacken AB, juli 2026 (inkl. påminnelseavgift)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000172');
update public.fakturor set belopp = 849603 where fakturanummer = '851000172';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'Hyra lokal (varav 113 069 kr är indextillägg)', 1, 575569, 575569, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'El (varav 1 986 kr är indextillägg)', 1, 10111, 10111, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'Fastighetsskatt', 1, 53913, 53913, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'Kyla (varav 2 903 kr är indextillägg)', 1, 14778, 14778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'Påminnelseavgift (851000127, 2025-05-01 - 2025-05-31)', 1, 60, 60, 'paminnelseavgift'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1004'), 'Värme (varav 4 278 kr är indextillägg)', 1, 21778, 21778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000172'), (select id from public.objekt where objektnummer = '851-1008'), 'Hyra lokal (varav 606 kr är indextillägg)', 1, 3485, 3485, 'hyra');

-- 851000173 — Helioworks Slottsbacken AB, augusti 2026 (utan påminnelseavgift)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000173');
update public.fakturor set belopp = 849543 where fakturanummer = '851000173';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1004'), 'Hyra lokal (varav 113 069 kr är indextillägg)', 1, 575569, 575569, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1004'), 'El (varav 1 986 kr är indextillägg)', 1, 10111, 10111, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1004'), 'Fastighetsskatt', 1, 53913, 53913, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1004'), 'Kyla (varav 2 903 kr är indextillägg)', 1, 14778, 14778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1004'), 'Värme (varav 4 278 kr är indextillägg)', 1, 21778, 21778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000173'), (select id from public.objekt where objektnummer = '851-1008'), 'Hyra lokal (varav 606 kr är indextillägg)', 1, 3485, 3485, 'hyra');

-- 851000174 — Helioworks Slottsbacken AB, september 2026 (samma som augusti)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000174');
update public.fakturor set belopp = 849543 where fakturanummer = '851000174';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1004'), 'Hyra lokal (varav 113 069 kr är indextillägg)', 1, 575569, 575569, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1004'), 'El (varav 1 986 kr är indextillägg)', 1, 10111, 10111, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1004'), 'Fastighetsskatt', 1, 53913, 53913, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1004'), 'Kyla (varav 2 903 kr är indextillägg)', 1, 14778, 14778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1004'), 'Värme (varav 4 278 kr är indextillägg)', 1, 21778, 21778, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000174'), (select id from public.objekt where objektnummer = '851-1008'), 'Hyra lokal (varav 606 kr är indextillägg)', 1, 3485, 3485, 'hyra');

-- 851000175 — Telia Company AB, kvartal (inkl. påminnelseavgift)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000175');
update public.fakturor set belopp = 16129 where fakturanummer = '851000175';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000175'), (select id from public.objekt where objektnummer = '851-1006'), 'Hyra lager (varav 4 980 kr är indextillägg)', 1, 12855, 12855, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000175'), (select id from public.objekt where objektnummer = '851-1006'), 'Påminnelseavgift (851000165, 2026-04-01 - 2026-06-30)', 1, 60, 60, 'paminnelseavgift');

-- 851000176 — Helioworks Slottsbacken AB, kvartal
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000176');
update public.fakturor set belopp = 90708 where fakturanummer = '851000176';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000176'), (select id from public.objekt where objektnummer = '851-1007'), 'Hyra lokal (varav 4 166 kr är indextillägg)', 1, 72566, 72566, 'hyra');

-- 851000177 — Endra Systems AB, kvartal (rättar tidigare felaktig radsumma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000177');
update public.fakturor set belopp = 2074124, anmarkning = null where fakturanummer = '851000177';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000177'), (select id from public.objekt where objektnummer = '851-1011'), 'Hyra lokal', 1, 1485850, 1485850, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000177'), (select id from public.objekt where objektnummer = '851-1011'), 'Drifttillägg Lokaler', 1, 68735, 68735, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000177'), (select id from public.objekt where objektnummer = '851-1011'), 'Fastighetsskatt', 1, 104666, 104666, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000177'), (select id from public.objekt where objektnummer = '851-1011'), 'Påminnelseavgift (851000167, 2026-04-01 - 2026-06-30)', 1, 60, 60, 'paminnelseavgift');

-- 851000178 — Asko Appliances AB, kvartal (rättar tidigare felaktig radsumma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '851000178');
update public.fakturor set belopp = 1442600, anmarkning = null where fakturanummer = '851000178';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '851000178'), (select id from public.objekt where objektnummer = '851-1012'), 'Hyra lokal', 1, 1040000, 1040000, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '851000178'), (select id from public.objekt where objektnummer = '851-1012'), 'Drifttillägg Lokaler', 1, 47200, 47200, 'drift'),
  ((select id from public.fakturor where fakturanummer = '851000178'), (select id from public.objekt where objektnummer = '851-1012'), 'Fastighetsskatt', 1, 66880, 66880, 'drift');

-- 852000447 — Gigapay Sweden AB, kvartal
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000447');
update public.fakturor set belopp = 341761 where fakturanummer = '852000447';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000447'), (select id from public.objekt where objektnummer = '852-1002'), 'Hyra lokal (varav 21 239 kr är indextillägg)', 1, 252239, 252239, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000447'), (select id from public.objekt where objektnummer = '852-1002'), 'Fastighetsskatt', 1, 21170, 21170, 'drift');

-- 852000448 — Romersk-Katolska Kyrkan, juli 2026 (momsfri)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000448');
update public.fakturor set belopp = 85492 where fakturanummer = '852000448';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000448'), (select id from public.objekt where objektnummer = '852-1004'), 'Hyra lokal (varav 19 716 kr är indextillägg)', 1, 78049, 78049, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000448'), (select id from public.objekt where objektnummer = '852-1004'), 'Fastighetsskatt', 1, 7443, 7443, 'drift');

-- 852000449 — Romersk-Katolska Kyrkan, augusti 2026 (samma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000449');
update public.fakturor set belopp = 85492 where fakturanummer = '852000449';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000449'), (select id from public.objekt where objektnummer = '852-1004'), 'Hyra lokal (varav 19 716 kr är indextillägg)', 1, 78049, 78049, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000449'), (select id from public.objekt where objektnummer = '852-1004'), 'Fastighetsskatt', 1, 7443, 7443, 'drift');

-- 852000450 — Romersk-Katolska Kyrkan, september 2026 (samma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000450');
update public.fakturor set belopp = 85492 where fakturanummer = '852000450';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000450'), (select id from public.objekt where objektnummer = '852-1004'), 'Hyra lokal (varav 19 716 kr är indextillägg)', 1, 78049, 78049, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000450'), (select id from public.objekt where objektnummer = '852-1004'), 'Fastighetsskatt', 1, 7443, 7443, 'drift');

-- 852000451 — Old Castle House AB, juli 2026 (inkl. dröjsmålsränta + 2 påminnelseavgifter)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000451');
update public.fakturor set belopp = 622345 where fakturanummer = '852000451';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal, tillkommande yta om 128 kvm', 1, 31407, 31407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal (varav 101 256 kr är indextillägg)', 1, 404589, 404589, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Dröjsmålsränta (avser maj månads hyra)', 1, 4120, 4120, 'ovrigt'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Fastighetsskatt', 1, 45308, 45308, 'drift'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Kyla (varav 3 299 kr är indextillägg)', 1, 13180, 13180, 'drift'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Påminnelseavgift (852000430, 2026-04-01 - 2026-04-30)', 1, 60, 60, 'paminnelseavgift'),
  ((select id from public.fakturor where fakturanummer = '852000451'), (select id from public.objekt where objektnummer = '852-1005'), 'Påminnelseavgift (852000431, 2026-05-01 - 2026-05-31)', 1, 60, 60, 'paminnelseavgift');

-- 852000452 — Old Castle House AB, augusti 2026 (utan dröjsmålsränta/påminnelser)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000452');
update public.fakturor set belopp = 618105 where fakturanummer = '852000452';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000452'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal, tillkommande yta om 128 kvm', 1, 31407, 31407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000452'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal (varav 101 256 kr är indextillägg)', 1, 404589, 404589, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000452'), (select id from public.objekt where objektnummer = '852-1005'), 'Fastighetsskatt', 1, 45308, 45308, 'drift'),
  ((select id from public.fakturor where fakturanummer = '852000452'), (select id from public.objekt where objektnummer = '852-1005'), 'Kyla (varav 3 299 kr är indextillägg)', 1, 13180, 13180, 'drift');

-- 852000453 — Old Castle House AB, september 2026 (samma som augusti)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000453');
update public.fakturor set belopp = 618105 where fakturanummer = '852000453';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000453'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal, tillkommande yta om 128 kvm', 1, 31407, 31407, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000453'), (select id from public.objekt where objektnummer = '852-1005'), 'Hyra lokal (varav 101 256 kr är indextillägg)', 1, 404589, 404589, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000453'), (select id from public.objekt where objektnummer = '852-1005'), 'Fastighetsskatt', 1, 45308, 45308, 'drift'),
  ((select id from public.fakturor where fakturanummer = '852000453'), (select id from public.objekt where objektnummer = '852-1005'), 'Kyla (varav 3 299 kr är indextillägg)', 1, 13180, 13180, 'drift');

-- 852000454 — Wahlgrens Konsultbyrå AB, juli 2026
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000454');
update public.fakturor set belopp = 35305 where fakturanummer = '852000454';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000454'), (select id from public.objekt where objektnummer = '852-1006'), 'Hyra lokal (varav 6 452 kr är indextillägg)', 1, 25827, 25827, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000454'), (select id from public.objekt where objektnummer = '852-1006'), 'Fastighetsskatt', 1, 2417, 2417, 'drift');

-- 852000455 — Wahlgrens Konsultbyrå AB, augusti 2026 (samma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000455');
update public.fakturor set belopp = 35305 where fakturanummer = '852000455';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000455'), (select id from public.objekt where objektnummer = '852-1006'), 'Hyra lokal (varav 6 452 kr är indextillägg)', 1, 25827, 25827, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000455'), (select id from public.objekt where objektnummer = '852-1006'), 'Fastighetsskatt', 1, 2417, 2417, 'drift');

-- 852000456 — Wahlgrens Konsultbyrå AB, september 2026 (samma)
delete from public.faktura_rader where faktura_id = (select id from public.fakturor where fakturanummer = '852000456');
update public.fakturor set belopp = 35305 where fakturanummer = '852000456';
insert into public.faktura_rader (faktura_id, objekt_id, beskrivning, antal, a_pris, belopp, typ) values
  ((select id from public.fakturor where fakturanummer = '852000456'), (select id from public.objekt where objektnummer = '852-1006'), 'Hyra lokal (varav 6 452 kr är indextillägg)', 1, 25827, 25827, 'hyra'),
  ((select id from public.fakturor where fakturanummer = '852000456'), (select id from public.objekt where objektnummer = '852-1006'), 'Fastighetsskatt', 1, 2417, 2417, 'drift');
