import { fmt, fmtPct } from '../utils/format'
import type { Aggregate } from '../utils/aggregate'
import { Skyline } from './Skyline'

export function Hero({
  eyebrow,
  title,
  sub,
  agg,
}: {
  eyebrow: string
  title: string
  sub: string
  agg: Aggregate
}) {
  const beladgning = agg.areaTot > 0 ? ((agg.areaTot - agg.areaVac) / agg.areaTot) * 100 : 0

  const kpis: [string, string | number, string][] = [
    ['Antal objekt', agg.n, ''],
    ['Uthyrningsgrad, area', fmtPct(beladgning), '%'],
    ['Uthyrd area', fmt(agg.areaTot - agg.areaVac), 'kvm'],
    ['Vakant area', fmt(agg.areaVac), 'kvm'],
    ['Vakanta objekt', agg.nVac, 'st'],
  ]

  return (
    <div className="relative mb-6 overflow-hidden rounded-[18px] bg-gradient-to-br from-navy-deep via-navy to-[#2A4E78] p-8 pb-7 text-[#EEF2F8] shadow-card">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(100deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 64px)',
        }}
      />
      <Skyline />
      <div className="relative flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#B9C6DA]">
            {eyebrow}
          </div>
          <h1 className="m-0 mb-1.5 font-display text-[32px] font-semibold tracking-[.1px]">
            {title}
          </h1>
          <p className="m-0 max-w-[520px] text-sm leading-relaxed text-[#C4D0E2]">{sub}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-[36px] font-semibold tracking-[.2px]">
            {fmt(agg.hyraTot)} kr
          </div>
          <div className="mt-0.5 text-[11.5px] uppercase tracking-[.08em] text-[#B9C6DA]">
            Kontrakterad hyresintäkt / år
          </div>
        </div>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-5">
        {kpis.map(([lbl, val, unit]) => (
          <div key={lbl} className="bg-white/5 px-4 py-4">
            <div className="mb-1.5 text-[11px] uppercase tracking-[.06em] text-[#AFC0D6]">
              {lbl}
            </div>
            <div className="font-mono text-xl font-semibold text-[#F5F7FB]">
              {val}
              <small className="ml-1 font-body text-xs font-medium text-[#AFC0D6]">{unit}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
