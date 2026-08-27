-- Rättar objekt.momsat för Aeolus 1/Diana 2 utifrån vad de riktiga
-- Savills-fakturorna (Dina_Försäkringar_Hyresavier_Q32026.pdf) faktiskt visar
-- (momsrad 25% eller inte per faktura). Kolumnen fick default false i
-- migration 0005 och har aldrig satts korrekt för dessa objekt förrän nu.
-- Juno 9 saknas i det inskickade fakturaunderlaget — lämnas orört.

update public.objekt set momsat = true
where objektnummer in (
  '851-1001', '851-1002', '851-1009', -- Bistro Nordique AB
  '851-1004', '851-1008',             -- Helioworks Slottsbacken AB (Kontorshotell/Förråd)
  '851-1006',                          -- Telia Company AB
  '851-1007',                          -- Helioworks Slottsbacken AB (Lokal)
  '851-1011',                          -- Endra Systems AB
  '851-1012',                          -- Asko Appliances AB
  '852-1002',                          -- Gigapay Sweden AB
  '852-1005',                          -- Old Castle House AB
  '852-1006'                           -- Wahlgrens Konsultbyrå AB
);

update public.objekt set momsat = false
where objektnummer in (
  '851-1003', -- Dina Försäkring AB — fakturan visar ingen moms-rad
  '852-1004'  -- Romersk-Katolska Kyrkan — fakturan visar ingen moms-rad
);
