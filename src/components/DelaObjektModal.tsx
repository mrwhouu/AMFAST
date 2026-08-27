import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Objekt } from '../types'
import { fmtArea } from '../utils/format'

interface Del {
  typ: string
  area_kvm: string
}

export function DelaObjektModal({
  objekt,
  onClose,
  onSaved,
}: {
  objekt: Objekt
  onClose: () => void
  onSaved: () => void
}) {
  const [delar, setDelar] = useState<Del[]>([
    { typ: objekt.typ, area_kvm: '' },
    { typ: objekt.typ, area_kvm: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const summa = delar.reduce((s, d) => s + (Number(d.area_kvm) || 0), 0)
  const diff = summa - objekt.area_kvm
  const mismatch = Math.abs(diff) > 0.5

  function updateDel(i: number, patch: Partial<Del>) {
    setDelar((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  function addDel() {
    setDelar((prev) => [...prev, { typ: objekt.typ, area_kvm: '' }])
  }

  function removeDel(i: number) {
    setDelar((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = delar.map((d) => ({ typ: d.typ, area_kvm: Number(d.area_kvm) || 0 }))
    const { error } = await supabase.rpc('dela_objekt', {
      p_objekt_id: objekt.id,
      p_delar: payload,
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-1 font-display text-lg font-semibold">Dela {objekt.objektnummer}</h2>
        <p className="mb-4 text-[12.5px] text-muted">
          Ursprunglig area: <span className="font-mono font-semibold">{fmtArea(objekt.area_kvm)} kvm</span>.
          Objektet markeras som avslutat och nya objekt skapas med egna objektnummer.
        </p>

        <div className="space-y-2.5">
          {delar.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={d.typ}
                onChange={(e) => updateDel(i, { typ: e.target.value })}
                placeholder="Typ"
                className="input flex-1"
              />
              <input
                type="number"
                step="0.1"
                required
                value={d.area_kvm}
                onChange={(e) => updateDel(i, { area_kvm: e.target.value })}
                placeholder="Kvm"
                className="input !w-24"
              />
              {delar.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeDel(i)}
                  className="text-[11.5px] font-semibold text-wine hover:text-wine/70"
                >
                  Ta bort
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addDel}
          className="mt-2.5 text-[12.5px] font-semibold text-navy hover:text-gold"
        >
          + Lägg till ännu en del
        </button>

        <div
          className={`mt-4 rounded-lg px-3 py-2 text-[12.5px] ${
            mismatch ? 'bg-amber-soft text-amber' : 'bg-green-soft text-green'
          }`}
        >
          Summa: {fmtArea(summa)} kvm ({diff >= 0 ? '+' : ''}
          {fmtArea(diff)} kvm mot ursprunget)
          {mismatch && ' — stämmer inte med ursprungsarean, men du kan ändå fortsätta.'}
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] font-medium text-wine">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
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
            {saving ? 'Delar…' : 'Dela objekt'}
          </button>
        </div>
      </form>
    </div>
  )
}
