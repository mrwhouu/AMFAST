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

function kapitalisera(ord: string): string {
  return ord.charAt(0).toUpperCase() + ord.slice(1)
}

/** Läsbar periodtext med månadsnamn, t.ex. "Juli 2026" eller "Juli–September 2026". */
export function periodManaderLabel(ar: number, typ: PeriodTyp, varde: number): string {
  if (typ === 'manad') return `${kapitalisera(MANADSNAMN[varde - 1])} ${ar}`
  const startManad = (varde - 1) * 3
  return `${kapitalisera(MANADSNAMN[startManad])}–${kapitalisera(MANADSNAMN[startManad + 2])} ${ar}`
}

const DINA_FASTIGHETER = new Set(['Aeolus 1', 'Diana 2', 'Juno 9'])

/** Avigrupp för filnedladdning: Aeolus 1/Diana 2/Juno 9 räknas som "Dina Försäkringar",
 * alla andra fastigheter räknas som Lindesås Fastigheter AB. */
export function avigruppForFastighet(fastighet: { namn: string }): string {
  return DINA_FASTIGHETER.has(fastighet.namn) ? 'Dina Försäkringar' : 'Lindesås Fastigheter AB'
}

/**
 * Formaterar ett datum som yyyy-mm-dd utifrån dess LOKALA kalenderdatum.
 * Medvetet inte `.toISOString()`, som konverterar till UTC och därför visar
 * fel dag (en dag för tidigt) i alla tidszoner som ligger före UTC, t.ex.
 * Sverige — lokal midnatt är fortfarande föregående dag i UTC.
 */
function formatLocalIsoDate(d: Date): string {
  const ar = d.getFullYear()
  const manad = String(d.getMonth() + 1).padStart(2, '0')
  const dag = String(d.getDate()).padStart(2, '0')
  return `${ar}-${manad}-${dag}`
}

/** Sista dagen innan periodens start, som yyyy-mm-dd (hyra betalas i förskott). */
export function dagenFore(d: Date): string {
  const prev = new Date(d)
  prev.setDate(prev.getDate() - 1)
  return formatLocalIsoDate(prev)
}

export function toIsoDate(d: Date): string {
  return formatLocalIsoDate(d)
}
