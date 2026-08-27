import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Objekt } from '../types'
import { objektTotalAr } from '../types'
import { fmt } from '../utils/format'
import { periodRange, periodString, dagenFore, toIsoDate, type PeriodTyp } from '../utils/avisering'

interface Rad {
  objekt: Objekt
  belopp: string
  anmarkning: string
  forfallodatum: string
  inkluderad: boolean
}

const AR_NU = new Date().getFullYear()

export function AviseringView({
  objekt,
  drifttillaggSummaByObjekt,
  fastighetNamnById,
  canWrite,
  onCreated,
}: {
  objekt: Objekt[]
  drifttillaggSummaByObjekt: Record<string, number>
  fastighetNamnById: Record<string, string>
  canWrite: (fastighetId: string) => boolean
  onCreated: () => void
}) {
  const [ar, setAr] = useState(AR_NU)
  const [typ, setTyp] = useState<PeriodTyp>('kvartal')
  const [varde, setVarde] = useState(1)
  const [rader, setRader] = useState<Rad[] | null>(null)
  const [sending, setSending] = useState(false)
  const [resultat, setResultat] = useState<{ ok: number; fel: string[] } | null>(null)

  function byggLista() {
    const range = periodRange(ar, typ, varde)
    const perioder = typ === 'manad' ? 12 : 4
    const forfallo = dagenFore(range.start)

    const nya = objekt
      .filter((o) => {
        if (o.status !== 'uthyrd' || !canWrite(o.fastighet_id)) return false
        if (o.kontrakt_fran && new Date(o.kontrakt_fran) > range.end) return false
        if (o.kontrakt_tom && new Date(o.kontrakt_tom) < range.start) return false
        return true
      })
      .map((o) => {
        const total = objektTotalAr(o, drifttillaggSummaByObjekt[o.id] ?? 0)
        return {
          objekt: o,
          belopp: String(Math.round(total / perioder)),
          anmarkning: '',
          forfallodatum: forfallo,
          inkluderad: true,
        }
      })

    setRader(nya)
    setResultat(null)
  }

  function updateRad(i: number, patch: Partial<Rad>) {
    setRader((prev) => prev?.map((r, idx) => (idx === i ? { ...r, ...patch } : r)) ?? null)
  }

  async function godkannOchSkicka() {
    if (!rader) return
    const attSkicka = rader.filter((r) => r.inkluderad)
    if (attSkicka.length === 0) return
    if (!confirm(`Skapa ${attSkicka.length} fakturor för ${periodRange(ar, typ, varde).label}?`)) return

    setSending(true)
    let ok = 0
    const fel: string[] = []
    const periodLabel = periodString(ar, typ, varde)

    for (const r of attSkicka) {
      const fakturanummer = `${r.objekt.objektnummer}-${periodLabel}`
      const belopp = Number(r.belopp) || 0
      const { data, error } = await supabase
        .from('fakturor')
        .insert({
          fastighet_id: r.objekt.fastighet_id,
          objekt_id: r.objekt.id,
          objektnummer: r.objekt.objektnummer,
          hyresgast: r.objekt.hyresgast,
          fakturanummer,
          period: periodLabel,
          forfallodatum: r.forfallodatum,
          belopp,
          anmarkning: r.anmarkning || null,
          status: 'skickad',
          skickad_datum: toIsoDate(new Date()),
        })
        .select()
        .single()

      if (error || !data) {
        fel.push(`${r.objekt.objektnummer} (${r.objekt.hyresgast}): ${error?.message ?? 'okänt fel'}`)
        continue
      }

      const { error: radError } = await supabase.from('faktura_rader').insert({
        faktura_id: data.id,
        objekt_id: r.objekt.id,
        beskrivning: `Hyra ${periodRange(ar, typ, varde).label}`,
        antal: 1,
        a_pris: belopp,
        belopp,
        typ: 'hyra',
      })
      if (radError) fel.push(`${r.objekt.objektnummer} (${r.objekt.hyresgast}): faktura skapad men rad misslyckades — ${radError.message}`)
      else ok++
    }

    setSending(false)
    setResultat({ ok, fel })
    if (ok > 0) {
      setRader(null)
      onCreated()
    }
  }

  const summa = rader?.filter((r) => r.inkluderad).reduce((s, r) => s + (Number(r.belopp) || 0), 0) ?? 0

  return (
    <div>
      <div className="mb-5 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 text-[13.5px] font-bold">Bygg aviseringslista</div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">År</span>
            <input
              type="number"
              value={ar}
              onChange={(e) => setAr(Number(e.target.value) || AR_NU)}
              className="input !w-24"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Periodtyp
            </span>
            <select
              value={typ}
              onChange={(e) => {
                setTyp(e.target.value as PeriodTyp)
                setVarde(1)
              }}
              className="input !w-32"
            >
              <option value="kvartal">Kvartal</option>
              <option value="manad">Månad</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
              {typ === 'manad' ? 'Månad' : 'Kvartal'}
            </span>
            <select value={varde} onChange={(e) => setVarde(Number(e.target.value))} className="input !w-28">
              {Array.from({ length: typ === 'manad' ? 12 : 4 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {typ === 'manad' ? n : `Q${n}`}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={byggLista}
            className="rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
          >
            Bygg lista
          </button>
        </div>
        <p className="mt-2 text-[11.5px] text-muted">
          Period: <b>{periodRange(ar, typ, varde).label}</b>. Listar objekt med aktivt kontrakt under perioden,
          bland de fastigheter du har skrivbehörighet till. Inget skapas förrän du godkänner.
        </p>
      </div>

      {rader && (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line-soft px-[18px] py-3">
            <span className="text-[13.5px] font-bold">
              Förhandsgranskning — {rader.filter((r) => r.inkluderad).length} av {rader.length} objekt
            </span>
            <span className="font-mono text-sm font-semibold">{fmt(summa)} kr</span>
          </div>

          {rader.length === 0 ? (
            <div className="px-[18px] py-6 text-center text-[12.5px] italic text-muted">
              Inga aktiva kontrakt hittades för den perioden.
            </div>
          ) : (
            <div>
              {rader.map((r, i) => (
                <div
                  key={r.objekt.id}
                  className={`grid grid-cols-[24px_90px_1fr_120px_140px_100px] items-center gap-2.5 border-b border-line-soft px-[18px] py-2.5 text-[12.5px] last:border-none ${
                    r.inkluderad ? '' : 'opacity-40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={r.inkluderad}
                    onChange={(e) => updateRad(i, { inkluderad: e.target.checked })}
                  />
                  <div className="font-mono font-semibold text-navy">{r.objekt.objektnummer}</div>
                  <div>
                    {r.objekt.hyresgast}
                    <div className="text-[11px] text-muted">{fastighetNamnById[r.objekt.fastighet_id]}</div>
                  </div>
                  <input
                    value={r.anmarkning}
                    onChange={(e) => updateRad(i, { anmarkning: e.target.value })}
                    placeholder="Anmärkning (valfritt)"
                    className="input"
                  />
                  <input
                    type="date"
                    value={r.forfallodatum}
                    onChange={(e) => updateRad(i, { forfallodatum: e.target.value })}
                    className="input"
                  />
                  <input
                    type="number"
                    value={r.belopp}
                    onChange={(e) => updateRad(i, { belopp: e.target.value })}
                    className="input text-right"
                  />
                </div>
              ))}
            </div>
          )}

          {rader.length > 0 && (
            <div className="flex justify-end gap-2 border-t border-line-soft px-[18px] py-3">
              <button
                onClick={() => setRader(null)}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-ink"
              >
                Avbryt
              </button>
              <button
                onClick={godkannOchSkicka}
                disabled={sending}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {sending ? 'Skickar…' : 'Godkänn och skicka'}
              </button>
            </div>
          )}
        </div>
      )}

      {resultat && (
        <div
          className={`mt-4 rounded-card border px-4 py-3 text-[12.5px] ${
            resultat.fel.length ? 'border-amber-soft bg-amber-soft text-amber' : 'border-green-soft bg-green-soft text-green'
          }`}
        >
          <div className="font-semibold">{resultat.ok} fakturor skapade.</div>
          {resultat.fel.length > 0 && (
            <ul className="mt-1.5 list-disc pl-4">
              {resultat.fel.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
