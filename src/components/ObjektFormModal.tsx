import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Faktureringsintervall, Objekt, ObjektStatus, Upprakningsmodell } from '../types'

type FormValues = {
  objektnummer: string
  typ: string
  hyresgast: string
  faktureringsadress: string
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
  uppsagningstid_manader: string
  forlangning_manader: string
  uppsagning_mottagen: boolean
  uppsagning_datum: string
  indexklausul: boolean
  bas_hyra_ar: string
  momsat: boolean
  faktureringsintervall: Faktureringsintervall
  upprakningsmodell: Upprakningsmodell | ''
  fast_procent_kvartal: string
}

function toValues(o?: Objekt | null): FormValues {
  return {
    objektnummer: o?.objektnummer ?? '',
    typ: o?.typ ?? '',
    hyresgast: o?.hyresgast ?? '',
    faktureringsadress: o?.faktureringsadress ?? '',
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
    uppsagningstid_manader: o ? String(o.uppsagningstid_manader) : '9',
    forlangning_manader: o ? String(o.forlangning_manader) : '36',
    uppsagning_mottagen: o?.uppsagning_mottagen ?? false,
    uppsagning_datum: o?.uppsagning_datum ?? '',
    indexklausul: o?.indexklausul ?? false,
    bas_hyra_ar: o?.bas_hyra_ar != null ? String(o.bas_hyra_ar) : '',
    momsat: o?.momsat ?? false,
    faktureringsintervall: o?.faktureringsintervall ?? 'kvartalsvis',
    upprakningsmodell: o?.upprakningsmodell ?? '',
    fast_procent_kvartal: o?.fast_procent_kvartal != null ? String(o.fast_procent_kvartal) : '0.5',
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
      faktureringsadress: values.faktureringsadress || null,
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
      uppsagningstid_manader: Number(values.uppsagningstid_manader) || 9,
      forlangning_manader: Number(values.forlangning_manader) || 36,
      uppsagning_mottagen: values.uppsagning_mottagen,
      uppsagning_datum: values.uppsagning_mottagen ? values.uppsagning_datum || null : null,
      indexklausul: values.indexklausul,
      bas_hyra_ar: values.indexklausul ? Number(values.bas_hyra_ar) || Number(values.hyra_ar) || 0 : null,
      momsat: values.momsat,
      faktureringsintervall: values.faktureringsintervall,
      upprakningsmodell: values.indexklausul && values.upprakningsmodell ? values.upprakningsmodell : null,
      fast_procent_kvartal:
        values.indexklausul && values.upprakningsmodell === 'fast_procent_kvartal'
          ? Number(values.fast_procent_kvartal) || 0.5
          : null,
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
          <Field label="Faktureringsadress (postadress)" full>
            <textarea
              value={values.faktureringsadress}
              onChange={(e) => set('faktureringsadress', e.target.value)}
              className="input"
              rows={3}
              placeholder={'Egen rad per adressrad, t.ex.:\nBox 171\n831 22 Östersund'}
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
          <Field label="Uppsägningstid (mån)">
            <input
              type="number"
              value={values.uppsagningstid_manader}
              onChange={(e) => set('uppsagningstid_manader', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Förlängning (mån)">
            <input
              type="number"
              value={values.forlangning_manader}
              onChange={(e) => set('forlangning_manader', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Uppsägning mottagen">
            <label className="flex h-[38px] items-center gap-2 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={values.uppsagning_mottagen}
                onChange={(e) => set('uppsagning_mottagen', e.target.checked)}
              />
              Ja, uppsägning mottagen
            </label>
          </Field>
          {values.uppsagning_mottagen && (
            <Field label="Uppsägningsdatum">
              <input
                type="date"
                value={values.uppsagning_datum}
                onChange={(e) => set('uppsagning_datum', e.target.value)}
                className="input"
              />
            </Field>
          )}
          <Field label="Moms">
            <label className="flex h-[38px] items-center gap-2 text-[12.5px] text-ink-soft">
              <input type="checkbox" checked={values.momsat} onChange={(e) => set('momsat', e.target.checked)} />
              Momspliktig hyra (25%)
            </label>
          </Field>
          <Field label="Faktureringsintervall">
            <select
              value={values.faktureringsintervall}
              onChange={(e) => set('faktureringsintervall', e.target.value as Faktureringsintervall)}
              className="input"
            >
              <option value="manadsvis">Månadsvis</option>
              <option value="kvartalsvis">Kvartalsvis</option>
            </select>
          </Field>
          <Field label="Indexklausul">
            <label className="flex h-[38px] items-center gap-2 text-[12.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={values.indexklausul}
                onChange={(e) => set('indexklausul', e.target.checked)}
              />
              Räknas upp enligt index
            </label>
          </Field>
          {values.indexklausul && (
            <>
              <Field label="Bashyra/år (innan index)">
                <input
                  type="number"
                  value={values.bas_hyra_ar}
                  onChange={(e) => set('bas_hyra_ar', e.target.value)}
                  className="input"
                  placeholder={values.hyra_ar}
                />
              </Field>
              <Field label="Uppräkningsmodell">
                <select
                  value={values.upprakningsmodell}
                  onChange={(e) => set('upprakningsmodell', e.target.value as Upprakningsmodell)}
                  className="input"
                >
                  <option value="">Ej vald</option>
                  <option value="kpi">KPI (årlig, applicera_index)</option>
                  <option value="fast_procent">Fast procent (årlig)</option>
                  <option value="fast_belopp">Fast belopp (årlig)</option>
                  <option value="fast_procent_kvartal">Fast minimiökning per kvartal</option>
                </select>
              </Field>
              {values.upprakningsmodell === 'fast_procent_kvartal' && (
                <Field label="Procent/kvartal">
                  <input
                    type="number"
                    step="0.01"
                    value={values.fast_procent_kvartal}
                    onChange={(e) => set('fast_procent_kvartal', e.target.value)}
                    className="input"
                  />
                </Field>
              )}
            </>
          )}
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
