-- The Flow E-Networks AB (852-2010): avtalet har förlängts med 3 år från
-- föregående slutdatum (2026-03-31 → 2029-03-31). Tenanten finns kvar,
-- status/hyresgäst oförändrade — endast kontrakt_tom uppdateras.

update public.objekt
set kontrakt_tom = '2029-03-31'
where objektnummer = '852-2010';
