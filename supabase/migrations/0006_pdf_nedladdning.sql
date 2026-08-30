-- Spårar när en fakturas PDF senast laddades ner, så man i fakturalistan kan
-- se om en faktura redan skickats/laddats ner — och undvika att skicka den
-- till hyresgästen två gånger av misstag.

alter table public.fakturor
  add column pdf_nedladdad_at timestamptz;

comment on column public.fakturor.pdf_nedladdad_at is 'Senaste gången fakturans PDF laddades ner i portalen. Null = aldrig nedladdad.';
