export function FullScreenState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-3 font-mono text-sm text-muted shadow-card">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green shadow-[0_0_0_3px_var(--color-green-soft)]" />
        {label}
      </div>
    </div>
  )
}
