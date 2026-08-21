import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (error) setError('Fel e-post eller lösenord.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-gradient-to-br from-navy to-navy-deep font-display text-base font-bold text-gold-soft shadow-card">
            AM
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">AMfast Förvaltningsportal</div>
            <div className="text-[11.5px] tracking-wide text-muted">
              AMfast Fastighetsförvaltning AB
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[10px] border border-line bg-surface p-7 shadow-card"
        >
          <h1 className="mb-1 font-display text-xl font-semibold text-ink">Logga in</h1>
          <p className="mb-5 text-sm text-muted">Ange dina inloggningsuppgifter för portalen.</p>

          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            E-post
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy"
            placeholder="namn@amfast.se"
          />

          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Lösenord
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 rounded-[8px] bg-wine-soft px-3 py-2 text-[12.5px] font-medium text-wine">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[8px] bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep disabled:opacity-60"
          >
            {submitting ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>

        <p className="mt-4 text-center text-[11.5px] text-muted">
          Kontakta din förvaltare för att få ett konto.
        </p>
      </div>
    </div>
  )
}
