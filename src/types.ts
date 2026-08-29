export type Role = 'admin' | 'forvaltare' | 'agare' | 'viewer' | 'drifttekniker'
export type Behorighet = 'read' | 'write'
export type ObjektStatus = 'uthyrd' | 'vakant' | 'avslutat'
export type FakturaStatus = 'utkast' | 'skickad' | 'betald' | 'forsenad' | 'inkasso'
export type FakturaTyp = 'faktura' | 'kreditfaktura' | 'paminnelse'
export type Faktureringsintervall = 'manadsvis' | 'kvartalsvis'
export type Upprakningsmodell = 'kpi' | 'fast_procent' | 'fast_belopp' | 'fast_procent_kvartal'
export type RitningTyp = 'pdf' | 'dwg' | 'bim' | '3d_modell' | 'point_cloud' | 'ovrigt'
export type TekniskObjektStatus = 'aktiv' | 'inaktiv' | 'borttagen'
export type UnderhallStatus = 'planerad' | 'pagaende' | 'utford' | 'forsenad' | 'installd'
export type BesiktningStatus = 'planerad' | 'utford' | 'forsenad' | 'installd'

export interface Profile {
  id: string
  full_name: string | null
  role: Role
  created_at: string
}

export interface Fastighet {
  id: string
  namn: string
  adress: string | null
  agare: string | null
  forvaltare: string
  objektnummer_prefix: string | null
  bankgiro: string | null
  momsregnr: string | null
  organisationsnummer: string | null
  avsandare_adress: string | null
  telefon: string | null
  epost: string | null
  created_at: string
}

export interface Byggnad {
  id: string
  fastighet_id: string
  namn: string
  beskrivning: string | null
  ordning: number
  created_at: string
}

export interface Vaningsplan {
  id: string
  byggnad_id: string
  namn: string
  plannummer: number
  beskrivning: string | null
  created_at: string
}

export interface Ritning {
  id: string
  fastighet_id: string
  byggnad_id: string | null
  vaningsplan_id: string | null
  objekt_id: string | null
  namn: string
  typ: RitningTyp
  storage_path: string
  version: number
  is_current: boolean
  foregaende_version_id: string | null
  skala_kalibrering: { pixel_distans: number; verklig_distans_m: number; enhet: string } | null
  uppladdad_av: string | null
  created_at: string
}

export interface TekniskObjekt {
  id: string
  fastighet_id: string
  byggnad_id: string | null
  vaningsplan_id: string | null
  objekt_id: string | null
  namn: string
  kategori: string
  objekt_id_kod: string | null
  typ: string | null
  modell: string | null
  tillverkare: string | null
  installationsdatum: string | null
  teknisk_info: Record<string, string>
  ritning_id: string | null
  placering_x: number | null
  placering_y: number | null
  status: TekniskObjektStatus
  created_at: string
  updated_at: string
}

export interface Dokument {
  id: string
  fastighet_id: string
  byggnad_id: string | null
  vaningsplan_id: string | null
  objekt_id: string | null
  tekniskt_objekt_id: string | null
  dokumenttyp: string
  namn: string
  beskrivning: string | null
  storage_path: string
  version: number
  ansvarig: string | null
  datum: string
  created_at: string
}

export interface Garanti {
  id: string
  tekniskt_objekt_id: string
  leverantor: string | null
  installerat_datum: string | null
  garantitid_manader: number
  garanti_till: string | null
  dokument_id: string | null
  created_at: string
}

export interface UnderhallAtgard {
  id: string
  fastighet_id: string
  vaningsplan_id: string | null
  objekt_id: string | null
  tekniskt_objekt_id: string | null
  typ: string
  beskrivning: string | null
  ansvarig: string | null
  ansvarig_extern: string | null
  planerat_datum: string | null
  utfort_datum: string | null
  status: UnderhallStatus
  kostnad: number | null
  aterkommande: boolean
  intervall_manader: number | null
  foregaende_atgard_id: string | null
  created_at: string
  updated_at: string
}

export interface Besiktning {
  id: string
  fastighet_id: string
  vaningsplan_id: string | null
  objekt_id: string | null
  tekniskt_objekt_id: string | null
  typ: string
  datum: string | null
  forfallodatum: string | null
  ansvarig: string | null
  ansvarig_extern: string | null
  status: BesiktningStatus
  protokoll_dokument_id: string | null
  anmarkningar: string | null
  atgarder: string | null
  kostnad: number | null
  aterkommande: boolean
  intervall_manader: number | null
  foregaende_besiktning_id: string | null
  created_at: string
  updated_at: string
}

export interface Objekt {
  id: string
  fastighet_id: string
  vaningsplan_id: string | null
  objektnummer: string
  typ: string
  hyresgast: string | null
  hyresgast_orgnr: string | null
  hyresgast_kontakt: string | null
  area_kvm: number
  kr_per_kvm: number
  hyra_ar: number
  fastighetsskatt_ar: number
  ovrigt_ar: number
  status: ObjektStatus
  vakanshyra_ar: number | null
  kontrakt_fran: string | null
  kontrakt_tom: string | null
  gata: string | null
  parent_objekt_id: string | null
  indexklausul: boolean
  bas_hyra_ar: number | null
  uppsagningstid_manader: number
  forlangning_manader: number
  uppsagning_mottagen: boolean
  uppsagning_datum: string | null
  momsat: boolean
  faktureringsintervall: Faktureringsintervall
  upprakningsmodell: Upprakningsmodell | null
  fast_procent_kvartal: number | null
  created_at: string
  updated_at: string
}

export interface ObjektHistorik {
  id: string
  objekt_id: string
  hyresgast: string | null
  kontrakt_fran: string | null
  kontrakt_tom: string | null
  hyra_ar: number | null
  orsak_avslut: string | null
  skapad_av: string | null
  skapad_at: string
}

export interface ObjektDrifttillagg {
  id: string
  objekt_id: string
  typ: string
  belopp_ar: number
  indexklausul: boolean
  created_at: string
}

export interface IndexSerie {
  id: string
  ar: number
  procent: number
  kalla: string | null
  skapad_at: string
}

export interface Faktura {
  id: string
  fastighet_id: string
  objekt_id: string | null
  objektnummer: string | null
  hyresgast: string | null
  fakturanummer: string
  period: string
  forfallodatum: string
  belopp: number
  anmarkning: string | null
  status: FakturaStatus
  skickad_datum: string | null
  betald_datum: string | null
  inkasso_datum: string | null
  inkasso_av: string | null
  inkasso_markerad_at: string | null
  typ: FakturaTyp
  ursprunglig_faktura_id: string | null
  created_at: string
}

export interface FakturaRad {
  id: string
  faktura_id: string
  objekt_id: string | null
  beskrivning: string
  antal: number
  a_pris: number
  belopp: number
  typ: 'hyra' | 'index' | 'drift' | 'paminnelseavgift' | 'kreditering' | 'ovrigt'
  skapad_at: string
}

export interface AnvandareFastighet {
  user_id: string
  fastighet_id: string
  behorighet: Behorighet
}

/**
 * Total årshyra för ett objekt: hyra + fastighetsskatt + övrigt + ev. itemiserade
 * drifttillägg (eller vakanshyra om vakant). `drifttillaggSumma` är summan av
 * objektets rader i `objekt_drifttillagg` — 0 om inte laddat/inga finns.
 */
export function objektTotalAr(o: Objekt, drifttillaggSumma = 0): number {
  if (o.status === 'vakant') return o.vakanshyra_ar ?? 0
  return o.hyra_ar + o.fastighetsskatt_ar + o.ovrigt_ar + drifttillaggSumma
}

/** Dagar kvar till kontraktets slutdatum, eller null om inget slutdatum finns. */
export function dagarKvar(kontraktTom: string | null, asOf: Date = new Date()): number | null {
  if (!kontraktTom) return null
  const end = new Date(kontraktTom + 'T00:00:00')
  const ms = end.getTime() - new Date(asOf.toDateString()).getTime()
  return Math.round(ms / 86_400_000)
}
