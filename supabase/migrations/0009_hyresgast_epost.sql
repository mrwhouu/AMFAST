-- Hyresgästens e-postadress, för att kunna skicka fakturor som e-postutkast
-- (.eml) direkt till rätt mottagare.
alter table public.objekt
  add column hyresgast_epost text;
