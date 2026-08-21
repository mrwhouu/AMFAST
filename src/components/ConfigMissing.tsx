export function ConfigMissing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-lg rounded-card border border-line bg-surface p-8 shadow-card">
        <h1 className="mb-2 font-display text-xl font-semibold text-ink">
          Supabase är inte konfigurerat
        </h1>
        <p className="mb-4 text-sm leading-relaxed text-ink-soft">
          Kopiera <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs">.env.example</code> till{' '}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs">.env</code> och fyll i{' '}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_URL</code> och{' '}
          <code className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>{' '}
          från ditt Supabase-projekt (Project Settings → API), starta sedan om dev-servern.
        </p>
        <p className="text-sm text-muted">Se README.md för fullständiga instruktioner.</p>
      </div>
    </div>
  )
}
