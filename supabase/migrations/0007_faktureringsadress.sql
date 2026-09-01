-- Egen faktureringsadress per hyresgäst/objekt, separat från objektets egen
-- gatuadress (lokalen kan ligga på en annan adress än dit fakturan ska
-- postas, t.ex. till huvudkontor eller en extern redovisningsbyrå).
alter table public.objekt add column if not exists faktureringsadress text;

comment on column public.objekt.faktureringsadress is
  'Hyresgästens postadress för fakturautskick. Skiljer sig ofta från objektets egen gata (kolumnen "gata").';
