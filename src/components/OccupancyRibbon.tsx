import type { Objekt } from '../types'

export function OccupancyRibbon({
  objekt,
  areaTot,
  color,
}: {
  objekt: Objekt[]
  areaTot: number
  color: string
}) {
  return (
    <div className="flex h-4 overflow-hidden rounded-[5px] border border-line-soft bg-surface-sunken">
      {objekt.map((o) => {
        const w = areaTot > 0 ? (o.area_kvm / areaTot) * 100 : 0
        if (o.status === 'vakant') {
          return (
            <div
              key={o.id}
              title={`${o.objektnummer} · vakant · ${o.area_kvm} kvm`}
              className="h-full border-r border-white/60"
              style={{
                width: `${w}%`,
                backgroundImage:
                  'repeating-linear-gradient(135deg, var(--color-wine-soft) 0 4px, #fff 4px 8px)',
              }}
            />
          )
        }
        return (
          <div
            key={o.id}
            title={`${o.objektnummer} · ${o.hyresgast ?? ''} · ${o.area_kvm} kvm`}
            className="h-full border-r border-white/55"
            style={{ width: `${w}%`, background: color }}
          />
        )
      })}
    </div>
  )
}
