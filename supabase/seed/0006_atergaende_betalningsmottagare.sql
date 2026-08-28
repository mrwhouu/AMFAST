-- Ångrar betalningsmodell-ändringen i 0004_amfast_billerinfo.sql: hyresgäster
-- betalar INTE AMfast centralt, utan respektive ägarbolags eget konto — precis
-- som när Savills administrerade fastigheterna. AMfast:s uppgifter
-- (avsandare_adress/telefon/epost) fortsätter synas som avsändare/kontakt,
-- men org.nr, momsregnr och bankgiro sätts tillbaka till ägarbolagens egna
-- (hämtade direkt ur de riktiga Savills-fakturorna).
--
-- Juno 9 ägs enligt registret av samma bolag som Diana 2 (Dina Försäkringar AB)
-- och får därför samma konto — bekräftat av användaren 2026-08-27.

update public.fastigheter
set organisationsnummer = '556610-8980',
    momsregnr = 'SE556610898001',
    bankgiro = '602-5415'
where namn = 'Aeolus 1';

update public.fastigheter
set organisationsnummer = '516401-8029',
    momsregnr = 'SE516401802901',
    bankgiro = '264-1926'
where namn in ('Diana 2', 'Juno 9');
