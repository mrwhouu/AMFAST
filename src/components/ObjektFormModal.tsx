import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Objekt, ObjektStatus } from '../types'

type FormValues = {
  objektnummer: string
  typ: string
  hyresgast: string
  area_kvm: string
  kr_per_kvm: string
  hyra_ar: string
  fastighetsskatt_ar: string
  ovrigt_ar: string
  status: ObjektStatus
  vakanshyra_ar: string
  kontrakt_fran: string
  kontrakt_tom: string
  gata: string
}

function toValues(o?: Objekt | null): FormValues {
  return {
    objektnummer: o?.objektnummer ?? '',
    typ: o?.typ ?? '',
    hyresgast: o?.hyresgast ?? '',
    area_kvm: o ? String(o.area_kvm) : '0',
    kr_per_kvm: o ? String(o.kr_per_kvm) : '0',
    hyra_ar: o ? String(o.hyra_ar) : '0',
    fastighetsskatt_ar: o ? String(o.fastighetsskatt_ar) : '0',
    ovrigt_ar: o ? String(o.ovrigt_ar) : '0',
    status: o?.status ?? 'vakant',
    vakanshyra_ar: o?.vakanshyra_ar != null ? String(o.vakanshyra_ar) : '0',
    kontrakt_fran: o?.kontrakt_fran ?? '',
    kontrakt_tom: o?.kontrakt_tom ?? '',
    gata: o?.gata ?? '',
  }
}

export function ObjektFormModal({
  fastighetId,
  objekt,
  onClose,
  onSaved,
}: {
  fastighetId: string
  objekt?: Objekt | null
  onClose: () => void
  onSaved: () => void
}) {
  const [values, setValues] = useState<FormValues>(toValues(objekt))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      fastighet_id: fastighetId,
      objektnummer: values.objektnummer,
      typ: values.typ,
      hyresgast: values.hyresgast || null,
      area_kvm: Number(values.area_kvm) || 0,
      kr_per_kvm: Number(values.kr_per_kvm) || 0,
      hyra_ar: Number(values.hyra_ar) || 0,
      fastighetsskatt_ar: Number(values.fastighetsskatt_ar) || 0,
      ovrigt_ar: Number(values.ovrigt_ar) || 0,
      status: values.status,
      vakanshyra_ar: values.status === 'vakant' ? Number(values.vakanshyra_ar) || 0 : null,
      kontrakt_fran: values.kontrakt_fran || null,
      kontrakt_tom: values.kontrakt_tom || null,
      gata: values.gata || null,
    }

    const { error } = objekt
      ? await supabase.from('objekt').update(payload).eq('id', objekt.id)
      : await supabase.from('objekt').insert(payload)

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
        <h2 className="mb-4 font-display text-lg font-semibold">
          {objekt ? `Redigera ${objekt.objektnummer}` : 'Nytt objekt'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Objektnummer">
            <input
              required
              value={values.objektnummer}
              onChange={(e) => set('objektnummer', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Typ">
            <input required value={values.typ} onChange={(e) => set('typ', e.target.value)} className="input" />
          </Field>
          <Field label="Hyresgäst" full>
            <input
              value={values.hyresgast}
              onChange={(e) => set('hyresgast', e.target.value)}
              className="input"
              placeholder="Lämna tomt om vakant"
            />
          </Field>
          <Field label="Gata">
            <input value={values.gata} onChange={(e) => set('gata', e.target.value)} className="input" />
          </Field>
          <Field label="Status">
            <select
              value={values.status}
              onChange={(e) => set('status', e.target.value as ObjektStatus)}
              className="input"
            >
              <option value="uthyrd">Uthyrd</option>
              <option value="vakant">Vakant</option>
            </select>
          </Field>
          <Field label="Area (kvm)">
            <input
              type="number"
              step="0.1"
              value={values.area_kvm}
              onChange={(e) => set('area_kvm', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Kr/kvm">
            <input
              type="number"
              value={values.kr_per_kvm}
              onChange={(e) => set('kr_per_kvm', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Hyra/år">
            <input
              type="number"
              value={values.hyra_ar}
              onChange={(e) => set('hyra_ar', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Fastighetsskatt/år">
            <input
              type="number"
              value={values.fastighetsskatt_ar}
              onChange={(e) => set('fastighetsskatt_ar', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Övrigt/år">
            <input
              type="number"
              value={values.ovrigt_ar}
              onChange={(e) => set('ovrigt_ar', e.target.value)}
              className="input"
            />
          </Field>
          {values.status === 'vakant' && (
            <Field label="Vakanshyra/år">
              <input
                type="number"
                value={values.vakanshyra_ar}
                onChange={(e) => set('vakanshyra_ar', e.target.value)}
                className="input"
              />
            </Field>
          )}
          <Field label="Kontrakt fr.o.m">
            <input
              type="date"
              value={values.kontrakt_fran}
              onChange={(e) => set('kontrakt_fran', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Kontrakt t.o.m">
            <input
              type="date"
              value={values.kontrakt_tom}
              onChange={(e) => set('kontrakt_tom', e.target.value)}
              className="input"
            />
          </Field>
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

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? 'col-span-2' : ''}`}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  )
}
