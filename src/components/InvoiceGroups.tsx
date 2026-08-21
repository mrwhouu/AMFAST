import { useState } from 'react'
import type { Faktura } from '../types'
import { fmt } from '../utils/format'

interface Group {
  hyresgast: string
  fastighetNamn: string
  objekt: string
  rows: Faktura[]
  total: number
  flags: string[]
}

function groupInvoices(fakturor: Faktura[], fastighetNamnById: Record<string, string>): Group[] {
  const groups = new Map<string, Group>();
  for (const f of fakturor) {
    const key = f.hyresgast ?? '—'
    if (!groups.has(key)) {
      groups.set(key, {
        hyresgast: key,
        fastighetNamn: fastighetNamnById[f.fastighet_id] ?? '',
        objekt: f.objektnummer ?? '',
        rows: [],
        total: 0,
        flags: [],
      })
    }
    const g = groups.get(key)!
    g.rows.push(f)
    g.total += f.belopp
    if (f.anmarkning) g.flags.push(f.anmarkning)
  }
  return [...groups.values()]
}

export function InvoiceGroups({
  fakturor,
  fastighetNamnById,
}: {
  fakturor: Faktura[]
  fastighetNamnById: Record<string, string>
}) {
  const groups = groupInvoices(fakturor, fastighetNamnById)
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div>
      {groups.map((g) => {
        const open = openKey === g.hyresgast
        return (
          <div
            key={g.hyresgast}
            className="mb-3 overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <div
              onClick={() => setOpenKey(open ? null : g.hyresgast)}
              className="flex cursor-pointer items-center justify-between px-[18px] py-3.5 hover:bg-surface-sunken"
            >
              <div>
                <span className="text-[13.5px] font-bold">{g.hyresgast}</span>
                <span className="ml-2 font-mono text-[11px] text-muted">
                  {g.fastighetNamn} · {g.objekt}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {g.flags.map((flag, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      flag.includes('Saknas') ? 'bg-wine-soft text-wine' : 'bg-amber-soft text-amber'
                    }`}
                  >
                    {flag}
                  </span>
                ))}
                <span className="font-mono text-sm font-semibold">{fmt(g.total)} kr</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className={`opacity-50 transition-transform ${open ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
            {open && (
              <div>
                {g.rows.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[90px_100px_1fr_110px_90px] items-center gap-2.5 border-t border-line-soft px-[18px] py-2.5 text-[12.5px]"
                  >
                    <div className="font-mono font-semibold text-navy">{r.fakturanummer}</div>
                    <div className="font-mono text-muted">{r.period}</div>
                    <div className="text-[11.5px] text-amber">{r.anmarkning ?? ''}</div>
                    <div className="text-right font-mono text-muted">förf. {r.forfallodatum}</div>
                    <div className="text-right font-mono font-semibold">{fmt(r.belopp)} kr</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
