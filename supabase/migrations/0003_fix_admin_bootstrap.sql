-- Bugfix: protect_profile_columns() blockerade ALLA rolländringar gjorda
-- utanför en inloggad session (t.ex. via SQL Editor eller service role),
-- eftersom auth.uid() är null i det sammanhanget och is_admin() därmed alltid
-- blev false. Det gjorde det omöjligt att någonsin sätta den första
-- admin-rollen. Tillåt nu ändringar när auth.uid() är null (direktanslutning/
-- SQL Editor/service role — redan en betrodd kontext som kringgår RLS) eller
-- när den inloggade användaren redan är admin.

create or replace function public.protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.id := old.id;
  end if;
  return new;
end;
$$;
