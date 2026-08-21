import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Fastighet } from '../types'

export function FastighetFormModal({
  fastighet,
  onClose,
  onSaved,
}: {
  fastighet?: Fastighet | null
  onClose: () => void
  onSaved: () => void
}) {
  const [namn, setNamn] = useState(fastighet?.namn ?? '')
  const [adress, setAdress] = useState(fastighet?.adress ?? '')
  const [agare, setAgare] = useState(fastighet?.agare ?? '')
  const [forvaltare, setForvaltare] = useState(fastighet?.forvaltare ?? 'AMfast Fastighetsförvaltning AB')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { namn, adress: adress || null, agare: agare || null, forvaltare }
    const { error } = fastighet
      ? await supabase.from('fastigheter').update(payload).eq('id', fastighet.id)
      : await supabase.from('fastigheter').insert(payload)
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
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-4 font-display text-lg font-semibold">
          {fastighet ? `Redigera ${fastighet.namn}` : 'Ny fastighet'}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Namn
            </span>
            <input required value={namn} onChange={(e) => setNamn(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Adress
            </span>
            <input value={adress} onChange={(e) => setAdress(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Ägare
            </span>
            <input value={agare} onChange={(e) => setAgare(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Förvaltare
            </span>
            <input value={forvaltare} onChange={(e) => setForvaltare(e.target.value)} className="input" />
          </label>
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
            {saving ? 'Sparar…' : 'Spara'}
          </button>
        </div>
      </form>
    </div>
  )
}
