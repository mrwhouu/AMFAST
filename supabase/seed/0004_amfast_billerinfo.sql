-- Uppdaterar avsändarinfo för de tre fastigheter som tidigare fakturerades
-- via Savills (c/o Savills Förvaltning AB) till AMfast:s egna uppgifter,
-- eftersom AMfast nu sköter förvaltningen och tar emot hyresbetalningarna
-- direkt (bekräftat av användaren 2026-08-27).
--
-- Bankgiro lämnas medvetet NULL tills vidare — användaren har inte angett
-- kontonumret än. Fakturavyn visar "(bankgiro anges senare)" tills det
-- fylls i här.

update public.fastigheter
set organisationsnummer = '559068-8411',
    momsregnr = 'SE559068841101',
    avsandare_adress = 'c/o AMfast AB, Skeppsbron 2, 111 30 Stockholm',
    telefon = '070-385 00 98',
    epost = 'ekonomi@amfast.se'
where namn in ('Aeolus 1', 'Diana 2', 'Juno 9');

-- När bankgiro finns, kör:
-- update public.fastigheter set bankgiro = '<NUMMER>' where namn in ('Aeolus 1', 'Diana 2', 'Juno 9');
