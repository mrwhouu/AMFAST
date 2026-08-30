import { Link } from 'react-router-dom'
import type { Fastighet, Objekt } from '../types'
import { aggregate } from '../utils/aggregate'
import { fmt, fmtArea } from '../utils/format'

export function FastighetQuickView({
  fastighet,
  objekt,
  drifttillaggSummaByObjekt,
  onClose,
}: {
  fastighet: Fastighet
  objekt: Objekt[]
  drifttillaggSummaByObjekt: Record<string, number>
  onClose: () => void
}) {
  const active = objekt.filter((o) => o.status !== 'avslutat')
  const agg = aggregate(objekt, drifttillaggSummaByObjekt)
  const belPct = agg.areaTot > 0 ? Math.round(((agg.areaTot - agg.areaVac) / agg.areaTot) * 100) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <div className="mb-1 flex items-start justify-between">
          <h2 className="font-display text-lg font-semibold">{fastighet.namn}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Stäng">
            ✕
          </button>
        </div>
        <div className="mb-4 text-[12.5px] text-muted">{fastighet.agare}</div>

        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-surface-sunken p-3.5 sm:grid-cols-4">
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-muted">Uthyrt</div>
            <div className="mt-0.5 font-mono text-[15px] font-semibold">{belPct}%</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-muted">Area</div>
            <div className="mt-0.5 font-mono text-[15px] font-semibold">{fmtArea(agg.areaTot)} kvm</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-muted">Hyresintäkt/år</div>
            <div className="mt-0.5 font-mono text-[15px] font-semibold">{fmt(agg.hyraTot)} kr</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wide text-muted">Vakant/år</div>
            <div className={`mt-0.5 font-mono text-[15px] font-semibold ${agg.vakansHyraTot > 0 ? 'text-wine' : ''}`}>
              {fmt(agg.vakansHyraTot)} kr
            </div>
          </div>
        </div>

        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Objekt ({active.length})
        </div>
        <div className="mb-4 max-h-[280px] space-y-1 overflow-y-auto rounded-lg border border-line-soft">
          {active.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between border-b border-line-soft px-3 py-2 text-[12px] last:border-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-navy">{o.objektnummer}</span>
                <span className="text-ink-soft">{o.hyresgast ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    o.status === 'uthyrd' ? 'bg-green-soft text-green' : 'bg-amber-soft text-amber'
                  }`}
                >
                  {o.status === 'uthyrd' ? 'Uthyrd' : 'Vakant'}
                </span>
                <span className="font-mono text-muted">{fmt(o.hyra_ar)} kr</span>
              </div>
            </div>
          ))}
          {active.length === 0 && (
            <div className="px-3 py-4 text-center text-[12px] italic text-muted">Inga objekt registrerade.</div>
          )}
        </div>

        <Link
          to={`/fastighet/${fastighet.id}`}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-navy-deep"
        >
          Öppna fastighetssidan →
        </Link>
      </div>
    </div>
  )
}
