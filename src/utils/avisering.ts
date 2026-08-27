export type PeriodTyp = 'manad' | 'kvartal'

export interface PeriodRange {
  start: Date
  end: Date
  label: string
}

const MANADSNAMN = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
]

export function periodRange(ar: number, typ: PeriodTyp, varde: number): PeriodRange {
  if (typ === 'manad') {
    const start = new Date(ar, varde - 1, 1)
    const end = new Date(ar, varde, 0)
    return { start, end, label: `${MANADSNAMN[varde - 1]} ${ar}` }
  }
  const startMonth = (varde - 1) * 3
  const start = new Date(ar, startMonth, 1)
  const end = new Date(ar, startMonth + 3, 0)
  return { start, end, label: `Q${varde} ${ar}` }
}

export function periodString(ar: number, typ: PeriodTyp, varde: number): string {
  return typ === 'manad' ? `${ar}-${String(varde).padStart(2, '0')}` : `${ar}-Q${varde}`
}

/** Sista dagen innan periodens start, som yyyy-mm-dd (hyra betalas i förskott). */
export function dagenFore(d: Date): string {
  const prev = new Date(d)
  prev.setDate(prev.getDate() - 1)
  return prev.toISOString().slice(0, 10)
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
