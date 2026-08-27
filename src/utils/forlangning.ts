import type { Objekt } from '../types'

function addMonths(dateStr: string, months: number): Date {
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  return d
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000)
}

export interface ForlangningPost extends Objekt {
  uppsagningsfrist: Date
  dagarTillFrist: number
}

export interface ForlangningAlerts {
  /** Uppsägningsfristen har redan passerat utan registrerad uppsägning — väntar bekräftelse av förlängning. */
  passerade: ForlangningPost[]
  /** Uppsägningsfristen närmar sig (inom ~90 dagar) men har inte passerat än. */
  kommande: ForlangningPost[]
}

const VARNING_DAGAR = 90

/**
 * Hittar objekt vars uppsägningsfrist (kontrakt_tom - uppsagningstid_manader)
 * har passerat, eller snart passerar, utan att uppsagning_mottagen är satt.
 */
export function buildForlangningAlerts(objekt: Objekt[], asOf: Date = new Date()): ForlangningAlerts {
  const today = new Date(asOf.toDateString())
  const passerade: ForlangningPost[] = []
  const kommande: ForlangningPost[] = []

  for (const o of objekt) {
    if (o.status !== 'uthyrd' || !o.kontrakt_tom || o.uppsagning_mottagen) continue
    const frist = addMonths(o.kontrakt_tom, -o.uppsagningstid_manader)
    const dagarTillFrist = daysBetween(frist, today)
    const post: ForlangningPost = { ...o, uppsagningsfrist: frist, dagarTillFrist }

    if (dagarTillFrist < 0) passerade.push(post)
    else if (dagarTillFrist <= VARNING_DAGAR) kommande.push(post)
  }

  passerade.sort((a, b) => a.dagarTillFrist - b.dagarTillFrist)
  kommande.sort((a, b) => a.dagarTillFrist - b.dagarTillFrist)

  return { passerade, kommande }
}
