export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-7 flex items-center gap-2.5 font-display text-sm italic text-ink-soft">
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
