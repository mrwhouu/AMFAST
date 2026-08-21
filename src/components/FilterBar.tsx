import type { Fastighet } from '../types'

export function FilterBar({
  fastigheter,
  active,
  onChange,
  search,
  onSearch,
}: {
  fastigheter: Fastighet[]
  active: string
  onChange: (v: string) => void
  search: string
  onSearch: (v: string) => void
}) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2">
      <button
        onClick={() => onChange('alla')}
        className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
          active === 'alla'
            ? 'border-navy bg-navy text-white'
            : 'border-line bg-surface text-ink-soft hover:border-navy'
        }`}
      >
        Alla fastigheter
      </button>
      {fastigheter.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.namn)}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
            active === f.namn
              ? 'border-navy bg-navy text-white'
              : 'border-line bg-surface text-ink-soft hover:border-navy'
          }`}
        >
          {f.namn}
        </button>
      ))}
      <div className="relative ml-auto">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          className="pointer-events-none absolute left-2.5 top-2.5 opacity-40"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.6" y2="16.6" />
        </svg>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Sök hyresgäst eller objekt…"
          className="w-[220px] rounded-lg border border-line bg-surface py-2 pl-[30px] pr-3 text-[13px] outline-none focus:border-navy"
        />
      </div>
    </div>
  )
}
