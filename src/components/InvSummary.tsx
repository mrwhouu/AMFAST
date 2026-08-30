import type { Faktura } from '../types'
import { fmt } from '../utils/format'

export function InvSummary({ fakturor }: { fakturor: Faktura[] }) {
  const total = fakturor.reduce((s, i) => s + i.belopp, 0)
  const flagged = fakturor.filter((i) => i.anmarkning)
  const missing = fakturor.filter((i) => i.anmarkning?.includes('Saknas') || !i.objekt_id)
  const idag = new Date().toISOString().slice(0, 10)
  const skickadeIdag = fakturor.filter((i) => i.skickad_datum === idag)

  const cards: [string, string, string][] = [
    ['Antal fakturor', `${fakturor.length} st`, ''],
    ['Skickade idag', `${skickadeIdag.length} st`, skickadeIdag.length > 0 ? 'text-green' : ''],
    ['Fakturerat belopp, period', `${fmt(total)} kr`, ''],
    ['Med anmärkning', `${flagged.length} st`, 'text-amber'],
    ['Ej i rentroll', `${missing.length} st`, 'text-wine'],
  ]

  return (
    <div className="mb-4.5 flex flex-wrap gap-3.5">
      {cards.map(([lbl, val, color]) => (
        <div
          key={lbl}
          className="min-w-[160px] flex-1 rounded-card border border-line bg-surface px-5 py-3.5 shadow-card"
        >
          <div className="text-[10.5px] uppercase tracking-wide text-muted">{lbl}</div>
          <div className={`mt-1 font-mono text-[19px] font-semibold ${color}`}>{val}</div>
        </div>
      ))}
    </div>
  )
}
