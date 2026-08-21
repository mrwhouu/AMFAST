export interface TabDef {
  key: string
  label: string
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="mb-4 mt-6 flex flex-wrap gap-1.5 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`mr-5 -mb-px cursor-pointer border-b-2 pb-2.5 pt-2 text-[13.5px] font-semibold transition-colors ${
            active === t.key
              ? 'border-gold text-navy'
              : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
