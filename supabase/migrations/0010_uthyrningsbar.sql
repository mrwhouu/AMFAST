-- Vakanta objekt är inte alla i uthyrningsbart skick — vissa kräver
-- upprustning innan de kan hyras ut. Används för statusmarkeringen
-- (grön/gul/röd) i objektlistorna.
alter table public.objekt
  add column uthyrningsbar boolean not null default true;

comment on column public.objekt.uthyrningsbar is 'Om en vakant enhet är i uthyrningsbart skick. Irrelevant för uthyrda objekt.';
