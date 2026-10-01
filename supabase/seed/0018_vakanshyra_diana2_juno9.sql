-- Vakanshyra + fastighetsskatt-estimat (kr/kvm/år) för vakanta objekt i
-- Diana 2 och Juno 9, för budget/uthyrningsbedömning. Objekten är
-- fortfarande vakanta (status oförändrad) — detta är bedömda belopp, inte
-- faktiska intäkter.
--
-- 852-1001 (750 kvm): 2 500 kr/kvm/år hyra, 385 kr/kvm/år fastighetsskatt
-- 852-1003 (530 kvm): 3 000 kr/kvm/år hyra, 385 kr/kvm/år fastighetsskatt
-- 852-2004 (20 kvm):  3 500 kr/kvm/år hyra, 450 kr/kvm/år fastighetsskatt
-- 852-2005 (37 kvm):  3 000 kr/kvm/år hyra, 450 kr/kvm/år fastighetsskatt
-- 852-2011 (49 kvm):  3 500 kr/kvm/år hyra, 450 kr/kvm/år fastighetsskatt

update public.objekt
set vakanshyra_ar = round(2500::numeric * area_kvm),
    fastighetsskatt_ar = round(385::numeric * area_kvm),
    kr_per_kvm = 2500
where objektnummer = '852-1001';

update public.objekt
set vakanshyra_ar = round(3000::numeric * area_kvm),
    fastighetsskatt_ar = round(385::numeric * area_kvm),
    kr_per_kvm = 3000
where objektnummer = '852-1003';

update public.objekt
set vakanshyra_ar = round(3500::numeric * area_kvm),
    fastighetsskatt_ar = round(450::numeric * area_kvm),
    kr_per_kvm = 3500
where objektnummer = '852-2004';

update public.objekt
set vakanshyra_ar = round(3000::numeric * area_kvm),
    fastighetsskatt_ar = round(450::numeric * area_kvm),
    kr_per_kvm = 3000
where objektnummer = '852-2005';

update public.objekt
set vakanshyra_ar = round(3500::numeric * area_kvm),
    fastighetsskatt_ar = round(450::numeric * area_kvm),
    kr_per_kvm = 3500
where objektnummer = '852-2011';
