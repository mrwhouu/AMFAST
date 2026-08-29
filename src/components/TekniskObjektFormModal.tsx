import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Vaningsplan } from '../types'

const KATEGORIER = [
  'ventilation',
  'pump',
  'flakt',
  'hiss',
  'elcentral',
  'brandutrustning',
  'dorr',
  'fonster',
  'vitvara',
  'vvs',
  'teknisk_installation',
  'byggnadsdel',
  'ovrigt',
]

const KATEGORI_LABEL: Record<string, string> = {
  ventilation: 'Ventilation',
  pump: 'Pump',
  flakt: 'Fläkt',
  hiss: 'Hiss',
  elcentral: 'Elcentral',
  brandutrustning: 'Brandutrustning',
  dorr: 'Dörr',
  fonster: 'Fönster',
  vitvara: 'Vitvara',
  vvs: 'VVS',
  teknisk_installation: 'Teknisk installation',
  byggnadsdel: 'Byggnadsdel',
  ovrigt: 'Övrigt',
}

export function TekniskObjektFormModal({
  fastighetId,
  vaningsplan,
  onClose,
  onSaved,
}: {
  fastighetId: string
  vaningsplan: Vaningsplan[]
  onClose: () => void
  onSaved: () => void
}) {
  const [namn, setNamn] = useState('')
  const [kategori, setKategori] = useState('ovrigt')
  const [objektIdKod, setObjektIdKod] = useState('')
  const [modell, setModell] = useState('')
  const [tillverkare, setTillverkare] = useState('')
  const [installationsdatum, setInstallationsdatum] = useState('')
  const [vaningsplanId, setVaningsplanId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('tekniska_objekt').insert({
      fastighet_id: fastighetId,
      vaningsplan_id: vaningsplanId || null,
      namn,
      kategori,
      objekt_id_kod: objektIdKod || null,
      modell: modell || null,
      tillverkare: tillverkare || null,
      installationsdatum: installationsdatum || null,
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-4 font-display text-lg font-semibold">Nytt tekniskt objekt</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Namn</span>
            <input required autoFocus value={namn} onChange={(e) => setNamn(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Kategori
            </span>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="input">
              {KATEGORIER.map((k) => (
                <option key={k} value={k}>
                  {KATEGORI_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Objekt-ID
            </span>
            <input
              value={objektIdKod}
              onChange={(e) => setObjektIdKod(e.target.value)}
              className="input"
              placeholder="t.ex. FTX-03"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Modell</span>
            <input value={modell} onChange={(e) => setModell(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Tillverkare
            </span>
            <input value={tillverkare} onChange={(e) => setTillverkare(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Installationsdatum
            </span>
            <input
              type="date"
              value={installationsdatum}
              onChange={(e) => setInstallationsdatum(e.target.value)}
              className="input"
            />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Våningsplan
            </span>
            <select value={vaningsplanId} onChange={(e) => setVaningsplanId(e.target.value)} className="input">
              <option value="">Ej placerat</option>
              {vaningsplan.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.namn}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <div className="mt-3 rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] font-medium text-wine">{error}</div>
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

export { KATEGORI_LABEL }
