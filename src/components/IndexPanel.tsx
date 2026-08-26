import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useIndexSerier } from '../hooks/useIndexSerier'
import type { Objekt } from '../types'
import { fmt } from '../utils/format'

export function IndexPanel({ objekt, onApplied }: { objekt: Objekt[]; onApplied: () => void }) {
  const { serier, loading, reload } = useIndexSerier()
  const [open, setOpen] = useState(false)
  const [ar, setAr] = useState('')
  const [procent, setProcent] = useState('')
  const [kalla, setKalla] = useState('')
  const [saving, setSaving] = useState(false)
  const [previewAr, setPreviewAr] = useState<number | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const indexObjekt = useMemo(
    () => objekt.filter((o) => o.indexklausul && o.status === 'uthyrd'),
    [objekt],
  )

  const kvartalsObjekt = useMemo(
    () => objekt.filter((o) => o.upprakningsmodell === 'fast_procent_kvartal' && o.status === 'uthyrd'),
    [objekt],
  )
  const nu = new Date()
  const [kvartalsAr, setKvartalsAr] = useState(String(nu.getFullYear()))
  const [kvartal, setKvartal] = useState(String(Math.floor(nu.getMonth() / 3) + 1))
  const [applyingKvartal, setApplyingKvartal] = useState(false)

  const previewProcent = previewAr != null ? serier.find((s) => s.ar === previewAr)?.procent : undefined

  async function addSerie(e: FormEvent) {
    e.preventDefault()
    if (!ar || !procent) return
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('index_serier').insert({
      ar: Number(ar),
      procent: Number(procent),
      kalla: kalla || null,
    })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setAr('')
    setProcent('')
    setKalla('')
    reload()
  }

  async function applicera() {
    if (previewAr == null) return
    if (!confirm(`Applicera ${previewProcent}% indexuppräkning för ${indexObjekt.length} objekt med indexklausul?`))
      return
    setApplying(true)
    const { error } = await supabase.rpc('applicera_index', { p_ar: previewAr })
    setApplying(false)
    if (error) {
      alert(error.message)
      return
    }
    setPreviewAr(null)
    onApplied()
  }

  async function applicerakvartal() {
    if (
      !confirm(
        `Applicera kvartalsvis minimiökning för Q${kvartal} ${kvartalsAr} på ${kvartalsObjekt.length} objekt?`,
      )
    )
      return
    setApplyingKvartal(true)
    const { error } = await supabase.rpc('applicera_kvartals_minimiokning', {
      p_ar: Number(kvartalsAr),
      p_kvartal: Number(kvartal),
    })
    setApplyingKvartal(false)
    if (error) {
      alert(error.message)
      return
    }
    onApplied()
  }

  return (
    <div className="mb-5 overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-[18px] py-3 text-left"
      >
        <span className="text-[13.5px] font-bold">Indexuppräkning</span>
        <span className="font-mono text-[11px] text-muted">
          {indexObjekt.length} objekt med indexklausul {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border-t border-line-soft px-[18px] py-4">
          <div className="mb-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Registrerade indexserier
            </div>
            {loading ? (
              <div className="text-[12.5px] text-muted">Laddar…</div>
            ) : serier.length === 0 ? (
              <div className="text-[12.5px] italic text-muted">Inga indexserier registrerade än.</div>
            ) : (
              <div className="space-y-1">
                {serier.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-[12.5px]">
                    <span>
                      <span className="font-mono font-semibold">{s.ar}</span>{' '}
                      <span className="text-muted">{s.kalla}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono">{s.procent}%</span>
                      <button
                        onClick={() => setPreviewAr(s.ar)}
                        className="text-[11.5px] font-semibold text-navy hover:text-gold"
                      >
                        Förhandsgranska uppräkning
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={addSerie} className="flex flex-wrap items-end gap-2 border-t border-line-soft pt-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">År</span>
              <input type="number" value={ar} onChange={(e) => setAr(e.target.value)} className="input !w-20" />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Procent
              </span>
              <input
                type="number"
                step="0.01"
                value={procent}
                onChange={(e) => setProcent(e.target.value)}
                className="input !w-20"
              />
            </label>
            <label className="block flex-1 min-w-[140px]">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                Källa
              </span>
              <input
                value={kalla}
                onChange={(e) => setKalla(e.target.value)}
                placeholder="t.ex. KPI oktober 2026"
                className="input"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-navy px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
            >
              Lägg till år
            </button>
          </form>

          {error && (
            <div className="mt-3 rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] font-medium text-wine">{error}</div>
          )}

          {previewAr != null && (
            <div className="mt-4 rounded-lg border border-line-soft bg-surface-sunken p-3">
              <div className="mb-2 text-[12.5px] font-semibold">
                Förhandsgranskning — {previewAr} ({previewProcent}%)
              </div>
              {indexObjekt.length === 0 ? (
                <div className="text-[12.5px] italic text-muted">Inga objekt med indexklausul.</div>
              ) : (
                <div className="space-y-1">
                  {indexObjekt.map((o) => {
                    const ny = Math.round(o.hyra_ar * (1 + (previewProcent ?? 0) / 100))
                    return (
                      <div key={o.id} className="flex justify-between text-[12px]">
                        <span>
                          {o.objektnummer} · {o.hyresgast}
                        </span>
                        <span className="font-mono">
                          {fmt(o.hyra_ar)} → <span className="font-semibold">{fmt(ny)}</span> kr/år
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setPreviewAr(null)}
                  className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:border-ink"
                >
                  Avbryt
                </button>
                <button
                  onClick={applicera}
                  disabled={applying || indexObjekt.length === 0}
                  className="rounded-lg bg-navy px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
                >
                  {applying ? 'Applicerar…' : 'Applicera uppräkning'}
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-line-soft pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Kvartalsvis fast minimiökning
              </span>
              <span className="font-mono text-[11px] text-muted">
                {kvartalsObjekt.length} objekt med uppräkningsmodell fast_procent_kvartal
              </span>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  År
                </span>
                <input
                  type="number"
                  value={kvartalsAr}
                  onChange={(e) => setKvartalsAr(e.target.value)}
                  className="input !w-20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Kvartal
                </span>
                <select value={kvartal} onChange={(e) => setKvartal(e.target.value)} className="input !w-20">
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </label>
              <button
                onClick={applicerakvartal}
                disabled={applyingKvartal || kvartalsObjekt.length === 0}
                className="rounded-lg bg-navy px-3 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {applyingKvartal ? 'Applicerar…' : 'Applicera minimiökning'}
              </button>
            </div>
            {kvartalsObjekt.length > 0 && (
              <div className="mt-3 space-y-1">
                {kvartalsObjekt.map((o) => {
                  const p = o.fast_procent_kvartal ?? 0.5
                  const ny = Math.round(o.hyra_ar * (1 + p / 100))
                  return (
                    <div key={o.id} className="flex justify-between text-[12px]">
                      <span>
                        {o.objektnummer} · {o.hyresgast} ({p}%/kvartal)
                      </span>
                      <span className="font-mono">
                        {fmt(o.hyra_ar)} → <span className="font-semibold">{fmt(ny)}</span> kr/år
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
