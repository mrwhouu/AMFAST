import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function GarantiFormModal({
  tekniskObjektId,
  onClose,
  onSaved,
}: {
  tekniskObjektId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [leverantor, setLeverantor] = useState('')
  const [installeratDatum, setInstalleratDatum] = useState('')
  const [garantitidManader, setGarantitidManader] = useState('60')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('garantier').insert({
      tekniskt_objekt_id: tekniskObjektId,
      leverantor: leverantor || null,
      installerat_datum: installeratDatum || null,
      garantitid_manader: Number(garantitidManader) || 0,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-4 font-display text-lg font-semibold">Registrera garanti</h2>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Leverantör
          </span>
          <input autoFocus value={leverantor} onChange={(e) => setLeverantor(e.target.value)} className="input" />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Installerat
          </span>
          <input
            type="date"
            required
            value={installeratDatum}
            onChange={(e) => setInstalleratDatum(e.target.value)}
            className="input"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Garantitid (månader)
          </span>
          <input
            type="number"
            required
            value={garantitidManader}
            onChange={(e) => setGarantitidManader(e.target.value)}
            className="input"
          />
        </label>
        {error && (
          <div className="mb-3 rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] font-medium text-wine">{error}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-ink"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {saving ? 'Sparar…' : 'Spara'}
          </button>
        </div>
      </form>
    </div>
  )
}
