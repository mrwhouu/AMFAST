-- Komplettering till 0016: bekräftade belopp för Decurias minskade lokal
-- och vakanshyra för den avstyckade ytan.
--
-- Decuria AB (852-2002, nu 93 kvm): ny årshyra 372 000 kr, fastighetsskatt
-- 41 850 kr/år (ersätter de oförändrade beloppen från 0016).
--
-- 852-2011 (49 kvm, delad från 852-2002): vakanshyra ca 3 500 kr/kvm/år,
-- dvs 3500 * 49 = 171 500 kr/år.

update public.objekt
set hyra_ar = 372000,
    fastighetsskatt_ar = 41850,
    kr_per_kvm = round(372000::numeric / 93)
where objektnummer = '852-2002';

update public.objekt
set vakanshyra_ar = round(3500::numeric * area_kvm),
    kr_per_kvm = 3500
where objektnummer = '852-2011';
