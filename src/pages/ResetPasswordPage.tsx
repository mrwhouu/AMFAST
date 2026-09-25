import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { FullScreenState } from '../components/FullScreenState'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [redo, setRedo] = useState(true)
  const [giltig, setGiltig] = useState(false)
  const [losenord, setLosenord] = useState('')
  const [losenordUpprepat, setLosenordUpprepat] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [klart, setKlart] = useState(false)

  useEffect(() => {
    // Länken i återställningsmejlet loggar in användaren i en tillfällig
    // session (Supabase hanterar detta automatiskt via URL:en) — vi väntar
    // bara på att den sessionen dyker upp innan formuläret visas.
    supabase.auth.getSession().then(({ data }) => {
      setGiltig(!!data.session)
      setRedo(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setGiltig(true)
        setRedo(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (losenord.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken.')
      return
    }
    if (losenord !== losenordUpprepat) {
      setError('Lösenorden stämmer inte överens.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password: losenord })
    setSubmitting(false)
    if (error) {
      setError('Kunde inte spara lösenordet. Länken kan ha slutat gälla — begär en ny.')
      return
    }
    setKlart(true)
  }

  if (redo) return <FullScreenState label="Laddar…" />

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-gradient-to-br from-navy to-navy-deep font-display text-base font-bold text-gold-soft shadow-card">
            AM
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">AMfast Förvaltningsportal</div>
            <div className="text-[11.5px] tracking-wide text-muted">AMfast Fastighetsförvaltning AB</div>
          </div>
        </div>

        <div className="rounded-[10px] border border-line bg-surface p-7 shadow-card">
          {!giltig ? (
            <>
              <h1 className="mb-1 font-display text-xl font-semibold text-ink">Länken har slutat gälla</h1>
              <p className="mb-5 text-sm text-muted">
                Återställningslänkar gäller en begränsad tid. Begär en ny länk via "Glömt lösenord?" på
                inloggningssidan.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-[8px] bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
              >
                Till inloggningen
              </button>
            </>
          ) : klart ? (
            <>
              <h1 className="mb-1 font-display text-xl font-semibold text-ink">Lösenordet är sparat</h1>
              <p className="mb-5 text-sm text-muted">Du kan nu logga in med ditt nya lösenord.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-[8px] bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep"
              >
                Fortsätt till portalen
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="mb-1 font-display text-xl font-semibold text-ink">Välj nytt lösenord</h1>
              <p className="mb-5 text-sm text-muted">Minst 6 tecken.</p>

              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Nytt lösenord
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={losenord}
                onChange={(e) => setLosenord(e.target.value)}
                className="mb-4 w-full rounded-[8px] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy"
                placeholder="••••••••"
              />

              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Upprepa lösenord
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={losenordUpprepat}
                onChange={(e) => setLosenordUpprepat(e.target.value)}
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
                {submitting ? 'Sparar…' : 'Spara lösenord'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
