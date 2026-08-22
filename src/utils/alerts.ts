import { dagarKvar, type Faktura, type Objekt } from '../types'
import { buildForlangningAlerts, type ForlangningPost } from './forlangning'

export interface AlertsData {
  vacant: Objekt[]
  expiring: (Objekt & { dagarKvar: number })[]
  paymentRisk: Faktura[]
  unregistered: Faktura[]
  forlangningPasserad: ForlangningPost[]
  forlangningKommande: ForlangningPost[]
}

export function buildAlerts(objekt: Objekt[], fakturor: Faktura[]): AlertsData {
  const vacant = objekt.filter((o) => o.status === 'vakant')

  const expiring = objekt
    .filter((o) => o.status === 'uthyrd' && o.kontrakt_tom)
    .map((o) => ({ ...o, dagarKvar: dagarKvar(o.kontrakt_tom)! }))
    .filter((o) => o.dagarKvar < 200)
    .sort((a, b) => a.dagarKvar - b.dagarKvar)

  const paymentRisk = fakturor.filter(
    (i) =>
      i.status === 'forsenad' ||
      i.status === 'inkasso' ||
      (i.anmarkning && (i.anmarkning.includes('Dröjsmålsränta') || i.anmarkning.includes('Påminnelseavgift'))),
  )

  const unregistered = fakturor.filter((i) => i.anmarkning?.includes('Saknas') || !i.objekt_id)

  const { passerade: forlangningPasserad, kommande: forlangningKommande } = buildForlangningAlerts(objekt)

  return { vacant, expiring, paymentRisk, unregistered, forlangningPasserad, forlangningKommande }
}
