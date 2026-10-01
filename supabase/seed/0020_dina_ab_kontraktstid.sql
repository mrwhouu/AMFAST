-- Dina AB (852-2003): bekräftat slutdatum för avtalet, 3 år
-- (2026-12-01 – 2029-11-30), ersätter det tillsvidare-läge som sattes i 0016.

update public.objekt
set kontrakt_tom = '2029-11-30'
where objektnummer = '852-2003';
