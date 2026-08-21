export type Role = 'admin' | 'forvaltare' | 'agare' | 'viewer'
export type Behorighet = 'read' | 'write'
export type ObjektStatus = 'uthyrd' | 'vakant'

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
  created_at: string
}

export interface Objekt {
  id: string
  fastighet_id: string
  objektnummer: string
  typ: string
  hyresgast: string | null
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
  created_at: string
  updated_at: string
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
  created_at: string
}

export interface AnvandareFastighet {
  user_id: string
  fastighet_id: string
  behorighet: Behorighet
}

/** Total årshyra för ett objekt: hyra + fastighetsskatt + övrigt (eller vakanshyra om vakant). */
export function objektTotalAr(o: Objekt): number {
  if (o.status === 'vakant') return o.vakanshyra_ar ?? 0
  return o.hyra_ar + o.fastighetsskatt_ar + o.ovrigt_ar
}

/** Dagar kvar till kontraktets slutdatum, eller null om inget slutdatum finns. */
export function dagarKvar(kontraktTom: string | null, asOf: Date = new Date()): number | null {
  if (!kontraktTom) return null
  const end = new Date(kontraktTom + 'T00:00:00')
  const ms = end.getTime() - new Date(asOf.toDateString()).getTime()
  return Math.round(ms / 86_400_000)
}
