import { objektTotalAr, type Objekt } from '../types'

export interface Aggregate {
  areaTot: number
  areaVac: number
  hyraTot: number
  vakansHyraTot: number
  nVac: number
  n: number
}

export function aggregate(objs: Objekt[]): Aggregate {
  const areaTot = objs.reduce((s, o) => s + o.area_kvm, 0)
  const areaVac = objs.filter((o) => o.status === 'vakant').reduce((s, o) => s + o.area_kvm, 0)
  const hyraTot = objs.reduce((s, o) => s + objektTotalAr(o), 0)
  const vakansHyraTot = objs.reduce((s, o) => s + (o.vakanshyra_ar ?? 0), 0)
  const nVac = objs.filter((o) => o.status === 'vakant').length
  return { areaTot, areaVac, hyraTot, vakansHyraTot, nVac, n: objs.length }
}
