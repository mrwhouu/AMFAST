import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Objekt } from '../types'
import { DrifttillaggPanel } from './DrifttillaggPanel'

type FormValues = {
  typ: string
  hyresgast: string
  hyresgast_orgnr: string
  hyresgast_kontakt: string
  hyresgast_epost: string
  faktureringsadress: string
  area_kvm: string
  kr_per_kvm: string
  hyra_ar: string
  fastighetsskatt_ar: string
  ovrigt_ar: string
  kontrakt_fran: string
  kontrakt_tom: string
  gata: string
  indexklausul: boolean
  uppsagningstid_manader: string
  forlangning_manader: string
}

const EMPTY: FormValues = {
  typ: '',
  hyresgast: '',
  hyresgast_orgnr: '',
  hyresgast_kontakt: '',
  hyresgast_epost: '',
  faktureringsadress: '',
  area_kvm: '0',
  kr_per_kvm: '0',
  hyra_ar: '0',
  fastighetsskatt_ar: '0',
  ovrigt_ar: '0',
  kontrakt_fran: '',
  kontrakt_tom: '',
  gata: '',
  indexklausul: false,
  uppsagningstid_manader: '9',
  forlangning_manader: '36',
}

export function NyHyresgastModal({
  fastighetId,
  onClose,
  onSaved,
}: {
  fastighetId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [objektnummer, setObjektnummer] = useState<string | null>(null)
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<Objekt | null>(null)

  useEffect(() => {
    supabase.rpc('next_objektnummer', { p_fastighet_id: fastighetId }).then(({ data, error }) => {
      if (error) setError(error.message)
      else setObjektnummer(data as string)
    })
  }, [fastighetId])

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!objektnummer) return
    setSaving(true)
    setError(null)

    const payload = {
      fastighet_id: fastighetId,
      objektnummer,
      typ: values.typ,
      hyresgast: values.hyresgast,
      hyresgast_orgnr: values.hyresgast_orgnr || null,
      hyresgast_kontakt: values.hyresgast_kontakt || null,
      hyresgast_epost: values.hyresgast_epost || null,
      faktureringsadress: values.faktureringsadress || null,
      area_kvm: Number(values.area_kvm) || 0,
      kr_per_kvm: Number(values.kr_per_kvm) || 0,
      hyra_ar: Number(values.hyra_ar) || 0,
      fastighetsskatt_ar: Number(values.fastighetsskatt_ar) || 0,
      ovrigt_ar: Number(values.ovrigt_ar) || 0,
      status: 'uthyrd' as const,
      kontrakt_fran: values.kontrakt_fran || null,
      kontrakt_tom: values.kontrakt_tom || null,
      gata: values.gata || null,
      indexklausul: values.indexklausul,
      bas_hyra_ar: values.indexklausul ? Number(values.hyra_ar) || 0 : null,
      uppsagningstid_manader: Number(values.uppsagningstid_manader) || 9,
      forlangning_manader: Number(values.forlangning_manader) || 36,
    }

    const { data, error } = await supabase.from('objekt').insert(payload).select('*').single()

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setCreated(data)
  }

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card">
          <h2 className="mb-1 font-display text-lg font-semibold">
            {created.objektnummer} skapat ✓
          </h2>
          <p className="mb-4 text-[12.5px] text-muted">
            Lägg till drifttillägg (värme, kyla, avfall m.m.) nu om det behövs, eller klicka Klar.
          </p>
          <DrifttillaggPanel objektId={created.id} rader={[]} canEdit onChanged={() => {}} />
          <div className="mt-5 flex justify-end">
            <button
              onClick={onSaved}
              className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
            >
              Klar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card"
      >
        <h2 className="mb-1 font-display text-lg font-semibold">Lägg till hyresgäst</h2>
        <p className="mb-4 text-[12.5px] text-muted">
          Objektnummer:{' '}
          <span className="font-mono font-semibold text-navy">{objektnummer ?? 'hämtar…'}</span>{' '}
          (låst — nästa lediga i fastighetens serie)
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Hyresgäst
            </span>
            <input required value={values.hyresgast} onChange={(e) => set('hyresgast', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Org.nr</span>
            <input value={values.hyresgast_orgnr} onChange={(e) => set('hyresgast_orgnr', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Kontaktperson
            </span>
            <input value={values.hyresgast_kontakt} onChange={(e) => set('hyresgast_kontakt', e.target.value)} className="input" />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Hyresgästens e-post
            </span>
            <input
              type="email"
              value={values.hyresgast_epost}
              onChange={(e) => set('hyresgast_epost', e.target.value)}
              className="input"
              placeholder="För att kunna skicka fakturor via e-post"
            />
          </label>
          <label className="col-span-2 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Faktureringsadress (postadress)
            </span>
            <textarea
              value={values.faktureringsadress}
              onChange={(e) => set('faktureringsadress', e.target.value)}
              className="input"
              rows={3}
              placeholder={'Egen rad per adressrad, t.ex.:\nBox 171\n831 22 Östersund'}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Typ</span>
            <input required value={values.typ} onChange={(e) => set('typ', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Gata</span>
            <input value={values.gata} onChange={(e) => set('gata', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Area (kvm)
            </span>
            <input type="number" step="0.1" value={values.area_kvm} onChange={(e) => set('area_kvm', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Kr/kvm</span>
            <input type="number" value={values.kr_per_kvm} onChange={(e) => set('kr_per_kvm', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">Hyra/år</span>
            <input type="number" value={values.hyra_ar} onChange={(e) => set('hyra_ar', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Fastighetsskatt/år
            </span>
            <input type="number" value={values.fastighetsskatt_ar} onChange={(e) => set('fastighetsskatt_ar', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Övrigt/år
            </span>
            <input type="number" value={values.ovrigt_ar} onChange={(e) => set('ovrigt_ar', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Kontrakt fr.o.m
            </span>
            <input type="date" value={values.kontrakt_fran} onChange={(e) => set('kontrakt_fran', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Kontrakt t.o.m
            </span>
            <input type="date" value={values.kontrakt_tom} onChange={(e) => set('kontrakt_tom', e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Uppsägningstid (mån)
            </span>
            <input
              type="number"
              value={values.uppsagningstid_manader}
              onChange={(e) => set('uppsagningstid_manader', e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Förlängning (mån)
            </span>
            <input
              type="number"
              value={values.forlangning_manader}
              onChange={(e) => set('forlangning_manader', e.target.value)}
              className="input"
            />
          </label>
          <label className="col-span-2 flex items-center gap-2 text-[12.5px] text-ink-soft">
            <input
              type="checkbox"
              checked={values.indexklausul}
              onChange={(e) => set('indexklausul', e.target.checked)}
            />
            Indexklausul (hyran räknas upp årligen enligt index)
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
            disabled={saving || !objektnummer}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {saving ? 'Sparar…' : 'Skapa'}
          </button>
        </div>
      </form>
    </div>
  )
}
