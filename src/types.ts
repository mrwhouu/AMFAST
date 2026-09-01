export type Role = 'admin' | 'forvaltare' | 'agare' | 'viewer'
export type Behorighet = 'read' | 'write'
export type ObjektStatus = 'uthyrd' | 'vakant' | 'avslutat'
export type FakturaStatus = 'utkast' | 'skickad' | 'betald' | 'forsenad' | 'inkasso'
export type FakturaTyp = 'faktura' | 'kreditfaktura' | 'paminnelse'
export type Faktureringsintervall = 'manadsvis' | 'kvartalsvis'
export type Upprakningsmodell = 'kpi' | 'fast_procent' | 'fast_belopp' | 'fast_procent_kvartal'

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

export interface Objekt {
  id: string
  fastighet_id: string
  objektnummer: string
  typ: string
  hyresgast: string | null
  hyresgast_orgnr: string | null
  hyresgast_kontakt: string | null
  faktureringsadress: string | null
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
  pdf_nedladdad_at: string | null
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
