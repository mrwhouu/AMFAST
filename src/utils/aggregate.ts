import { objektTotalAr, type Objekt } from '../types'

export interface Aggregate {
  areaTot: number
  areaVac: number
  hyraTot: number
  vakansHyraTot: number
  nVac: number
  n: number
}

/**
 * `drifttillaggSummaByObjekt` är valfri: objekt-id → summa drifttillägg/år.
 * Objekt med status 'avslutat' (skapade genom delning) räknas inte in —
 * deras area/hyra lever vidare i de nya objekt som ersatte dem, så att
 * även räkna det ursprungliga skulle dubbelräkna arean.
 */
export function aggregate(
  objs: Objekt[],
  drifttillaggSummaByObjekt: Record<string, number> = {},
): Aggregate {
  const active = objs.filter((o) => o.status !== 'avslutat')
  const areaTot = active.reduce((s, o) => s + o.area_kvm, 0)
  const areaVac = active.filter((o) => o.status === 'vakant').reduce((s, o) => s + o.area_kvm, 0)
  const hyraTot = active.reduce((s, o) => s + objektTotalAr(o, drifttillaggSummaByObjekt[o.id] ?? 0), 0)
  const vakansHyraTot = active.reduce((s, o) => s + (o.vakanshyra_ar ?? 0), 0)
  const nVac = active.filter((o) => o.status === 'vakant').length
  return { areaTot, areaVac, hyraTot, vakansHyraTot, nVac, n: active.length }
}
