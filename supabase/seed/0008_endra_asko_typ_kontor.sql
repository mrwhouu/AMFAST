-- Originalfakturorna (Savills, 851000177/851000178) visar "Kontor" som
-- lokaltyp för Endra Systems AB och Asko Appliances AB — den uppgiften
-- gick inte att läsa ur det tidigare underlaget (se 0002_endra_asko.sql,
-- där typ sattes till "Okänt" i väntan på avtal/originalfaktura).

update public.objekt set typ = 'Kontor' where objektnummer = '851-1011'; -- Endra Systems AB
update public.objekt set typ = 'Kontor' where objektnummer = '851-1012'; -- Asko Appliances AB
