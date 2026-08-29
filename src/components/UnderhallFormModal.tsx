import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export function UnderhallFormModal({
  fastighetId,
  tekniskObjektId,
  onClose,
  onSaved,
}: {
  fastighetId: string
  tekniskObjektId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [typ, setTyp] = useState('')
  const [beskrivning, setBeskrivning] = useState('')
  const [planeratDatum, setPlaneratDatum] = useState('')
  const [aterkommande, setAterkommande] = useState(false)
  const [intervallManader, setIntervallManader] = useState('6')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('underhall_atgarder').insert({
      fastighet_id: fastighetId,
      tekniskt_objekt_id: tekniskObjektId,
      typ,
      beskrivning: beskrivning || null,
      planerat_datum: planeratDatum || null,
      aterkommande,
      intervall_manader: aterkommande ? Number(intervallManader) || null : null,
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
        <h2 className="mb-4 font-display text-lg font-semibold">Ny underhållsåtgärd</h2>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Typ</span>
          <input
            required
            autoFocus
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            className="input"
            placeholder="t.ex. Filterbyte, Service"
          />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Beskrivning
          </span>
          <input value={beskrivning} onChange={(e) => setBeskrivning(e.target.value)} className="input" />
        </label>
        <label className="mb-3 block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Planerat datum
          </span>
          <input
            type="date"
            value={planeratDatum}
            onChange={(e) => setPlaneratDatum(e.target.value)}
            className="input"
          />
        </label>
        <label className="mb-3 flex items-center gap-2 text-[12.5px] text-ink-soft">
          <input type="checkbox" checked={aterkommande} onChange={(e) => setAterkommande(e.target.checked)} />
          Återkommande åtgärd
        </label>
        {aterkommande && (
          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Intervall (månader)
            </span>
            <input
              type="number"
              value={intervallManader}
              onChange={(e) => setIntervallManader(e.target.value)}
              className="input"
            />
          </label>
        )}
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
