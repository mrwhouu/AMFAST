import { Link } from 'react-router-dom'
import type { Fastighet, Objekt } from '../types'
import { aggregate } from '../utils/aggregate'
import { fmt, fmtArea } from '../utils/format'
import { OccupancyRibbon } from './OccupancyRibbon'

const PROP_COLORS = ['#1F3A5F', '#A6812E', '#2E7D5B', '#8E2A3B', '#B4711E']

export function PropertyCard({
  fastighet,
  objekt,
  drifttillaggSummaByObjekt = {},
  colorIndex,
}: {
  fastighet: Fastighet
  objekt: Objekt[]
  drifttillaggSummaByObjekt?: Record<string, number>
  colorIndex: number
}) {
  const active = objekt.filter((o) => o.status !== 'avslutat')
  const agg = aggregate(objekt, drifttillaggSummaByObjekt)
  const color = PROP_COLORS[colorIndex % PROP_COLORS.length]
  const belPct = agg.areaTot > 0 ? Math.round(((agg.areaTot - agg.areaVac) / agg.areaTot) * 100) : 0
  const streets = [...new Set(active.map((o) => o.gata).filter(Boolean))].join(' · ')

  return (
    <div className="rounded-card border border-line bg-surface px-5 pb-4 pt-[18px] shadow-card">
      <div className="mb-0.5 flex items-baseline justify-between">
        <h3 className="m-0 font-display text-[19px] font-semibold">{fastighet.namn}</h3>
        <span className="font-mono text-[11px] text-muted">{active.length} objekt</span>
      </div>
      <div className="mb-3.5 text-[11.5px] text-muted">{fastighet.agare}</div>
      {streets && <div className="-mt-2.5 mb-3.5 text-xs text-muted">{streets}</div>}

      <OccupancyRibbon objekt={active} areaTot={agg.areaTot} color={color} />
      <div className="mt-[7px] flex justify-between font-mono text-[11px] text-muted">
        <span>{belPct}% uthyrt</span>
        <span>{fmtArea(agg.areaTot)} kvm totalt</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div>
          <div className="text-[10.5px] uppercase tracking-[.05em] text-muted">
            Hyresintäkt/år
          </div>
          <div className="mt-0.5 font-mono text-[15px] font-semibold">{fmt(agg.hyraTot)} kr</div>
        </div>
        <div>
          <div className="text-[10.5px] uppercase tracking-[.05em] text-muted">
            Vakant hyresvärde/år
          </div>
          <div className={`mt-0.5 font-mono text-[15px] font-semibold ${agg.vakansHyraTot > 0 ? 'text-wine' : ''}`}>
            {fmt(agg.vakansHyraTot)} kr
          </div>
        </div>
      </div>

      <Link
        to={`/fastighet/${fastighet.id}`}
        className="mt-3.5 flex cursor-pointer items-center gap-1.5 border-t border-dashed border-line pt-3 text-xs font-semibold text-navy hover:text-gold"
      >
        Visa objekt →
      </Link>
    </div>
  )
}
