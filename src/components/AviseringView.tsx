import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'
import { objektTotalAr } from '../types'
import { fmt } from '../utils/format'
import {
  periodRange,
  periodString,
  periodManaderLabel,
  avigruppForFastighet,
  dagenFore,
  toIsoDate,
  type PeriodTyp,
} from '../utils/avisering'
import type { FakturaPdfEntry } from '../pdf/fakturaPdf'

interface Rad {
  objekt: Objekt
  belopp: string
  anmarkning: string
  forfallodatum: string
  inkluderad: boolean
  redanFakturerad: boolean
  befintligaFakturaIds: string[]
}

const AR_NU = new Date().getFullYear()

/** "Hyra lager" för förråd/lager, annars "Hyra lokal" — matchar hur de riktiga Savills-fakturorna benämner hyresraden. */
function hyraBeskrivning(o: Objekt): string {
  return /lager|förråd|forrad/i.test(o.typ) ? 'Hyra lager' : 'Hyra lokal'
}

/**
 * Bryter upp ett objekts periodbelopp i separata rader — Hyra/Fastighetsskatt/Övrigt
 * (+ ev. "Varav X kr är indextillägg"-notering under hyresraden) — precis som
 * specifikationen i de riktiga historiska Savills-fakturorna alltid varit uppbyggd.
 * Om användaren redigerat totalbeloppet i förhandsgranskningen skalas komponenterna
 * proportionellt så delsummorna fortfarande summerar till det redigerade beloppet.
 */
function byggRadposter(
  o: Objekt,
  redigeratBelopp: number,
  perioder: number,
  drifttillaggSumma: number,
): { beskrivning: string; belopp: number; typ: FakturaRad['typ'] }[] {
  const hyraPerAr = o.hyra_ar
  const skattPerAr = o.fastighetsskatt_ar
  const ovrigtPerAr = o.ovrigt_ar + drifttillaggSumma
  const totalPerAr = hyraPerAr + skattPerAr + ovrigtPerAr
  const skala = totalPerAr > 0 ? redigeratBelopp / (totalPerAr / perioder) : 1

  const hyraBelopp = Math.round((hyraPerAr / perioder) * skala)
  const skattBelopp = Math.round((skattPerAr / perioder) * skala)
  const ovrigtBelopp = Math.round((ovrigtPerAr / perioder) * skala)

  const poster: { beskrivning: string; belopp: number; typ: FakturaRad['typ'] }[] = [
    { beskrivning: hyraBeskrivning(o), belopp: hyraBelopp, typ: 'hyra' },
  ]

  if (o.indexklausul && o.bas_hyra_ar != null && hyraPerAr > o.bas_hyra_ar) {
    const indexBelopp = Math.round(((hyraPerAr - o.bas_hyra_ar) / perioder) * skala)
    if (indexBelopp > 0) {
      poster.push({ beskrivning: `Varav ${fmt(indexBelopp)} kr är indextillägg`, belopp: 0, typ: 'index' })
    }
  }

  if (skattBelopp > 0) poster.push({ beskrivning: 'Fastighetsskatt', belopp: skattBelopp, typ: 'ovrigt' })
  if (ovrigtBelopp > 0) poster.push({ beskrivning: 'Övrigt', belopp: ovrigtBelopp, typ: 'ovrigt' })

  return poster
}

function slugifyFilnamn(namn: string) {
  return namn
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AviseringView({
  fastigheter,
  objekt,
  fakturor,
  drifttillaggSummaByObjekt,
  fastighetNamnById,
  canWrite,
  onCreated,
}: {
  fastigheter: Fastighet[]
  objekt: Objekt[]
  fakturor: Faktura[]
  drifttillaggSummaByObjekt: Record<string, number>
  fastighetNamnById: Record<string, string>
  canWrite: (fastighetId: string) => boolean
  onCreated: () => void
}) {
  const skrivbaraFastigheter = useMemo(() => fastigheter.filter((f) => canWrite(f.id)), [fastigheter, canWrite])
  const fastighetById = useMemo(() => Object.fromEntries(fastigheter.map((f) => [f.id, f])), [fastigheter])
  const [ar, setAr] = useState(AR_NU)
  const [typ, setTyp] = useState<PeriodTyp>('kvartal')
  const [varde, setVarde] = useState(1)
  const [valdaFastigheter, setValdaFastigheter] = useState<Set<string>>(
    () => new Set(skrivbaraFastigheter.map((f) => f.id)),
  )
  const [rader, setRader] = useState<Rad[] | null>(null)
  const [sending, setSending] = useState(false)
  const [resultat, setResultat] = useState<{ ok: number; fel: string[]; ids: string[] } | null>(null)

  function toggleFastighet(id: string) {
    setValdaFastigheter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function byggLista() {
    const range = periodRange(ar, typ, varde)
    const perioder = typ === 'manad' ? 12 : 4
    const forfallo = dagenFore(range.start)
    const periodManader = periodManaderLabel(ar, typ, varde)

    // Redan-fakturerad kollas per hyresgäst+fastighet+period (inte per objekt),
    // eftersom flera objekt för samma hyresgäst nu slås ihop till EN faktura —
    // detta fångar även äldre fakturor som skapades innan ihopslagningen fanns,
    // då varje objekt fortfarande fick en egen faktura.
    const befintligaFakturorByGrupp = new Map<string, string[]>()
    for (const f of fakturor) {
      const key = `${f.fastighet_id}::${f.hyresgast}::${f.period}`
      const lista = befintligaFakturorByGrupp.get(key)
      if (lista) lista.push(f.id)
      else befintligaFakturorByGrupp.set(key, [f.id])
    }

    const nya = objekt
      .filter((o) => {
        if (o.status !== 'uthyrd' || !canWrite(o.fastighet_id)) return false
        if (!valdaFastigheter.has(o.fastighet_id)) return false
        if (o.kontrakt_fran && new Date(o.kontrakt_fran) > range.end) return false
        if (o.kontrakt_tom && new Date(o.kontrakt_tom) < range.start) return false
        return true
      })
      .map((o) => {
        const total = objektTotalAr(o, drifttillaggSummaByObjekt[o.id] ?? 0)
        const grupNyckel = `${o.fastighet_id}::${o.hyresgast}::${periodManader}`
        const befintligaFakturaIds = befintligaFakturorByGrupp.get(grupNyckel) ?? []
        const redanFakturerad = befintligaFakturaIds.length > 0
        return {
          objekt: o,
          belopp: String(Math.round(total / perioder)),
          anmarkning: '',
          forfallodatum: forfallo,
          inkluderad: !redanFakturerad,
          redanFakturerad,
          befintligaFakturaIds,
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

    // Slå ihop objekt som tillhör samma hyresgäst i samma fastighet till EN
    // faktura med flera rader — matchar hur de riktiga fakturorna alltid
    // varit uppbyggda (en hyresgäst med flera lokaler får en samlad faktura).
    const grupper = new Map<string, Rad[]>()
    for (const r of attSkicka) {
      const key = `${r.objekt.fastighet_id}::${r.objekt.hyresgast}`
      const lista = grupper.get(key)
      if (lista) lista.push(r)
      else grupper.set(key, [r])
    }

    if (!confirm(`Skapa ${grupper.size} fakturor (för ${attSkicka.length} objekt) för ${periodRange(ar, typ, varde).label}?`)) return

    setSending(true)
    let ok = 0
    const fel: string[] = []
    const skapadeIds: string[] = []
    const pdfEntriesByAgare = new Map<string, FakturaPdfEntry[]>()
    const objektById: Record<string, Objekt> = {}
    const periodLabel = periodString(ar, typ, varde)
    const periodManader = periodManaderLabel(ar, typ, varde)
    const perioder = typ === 'manad' ? 12 : 4

    for (const gruppRader of grupper.values()) {
      // Primärt objekt (störst belopp) avgör fakturanummer/objektnummer-fältet,
      // precis som originalfakturorna alltid utgick från huvudlokalen.
      const primar = gruppRader.reduce((a, b) => (Number(b.belopp) > Number(a.belopp) ? b : a))
      const fakturanummer = `${primar.objekt.objektnummer}-${periodLabel}`
      const belopp = gruppRader.reduce((s, r) => s + (Number(r.belopp) || 0), 0)
      const anmarkningar = gruppRader.map((r) => r.anmarkning).filter(Boolean)

      const { data, error } = await supabase
        .from('fakturor')
        .insert({
          fastighet_id: primar.objekt.fastighet_id,
          objekt_id: primar.objekt.id,
          objektnummer: primar.objekt.objektnummer,
          hyresgast: primar.objekt.hyresgast,
          fakturanummer,
          period: periodManader,
          forfallodatum: primar.forfallodatum,
          belopp,
          anmarkning: anmarkningar.length > 0 ? anmarkningar.join(' / ') : null,
          status: 'skickad',
          skickad_datum: toIsoDate(new Date()),
        })
        .select()
        .single()

      if (error || !data) {
        const meddelande =
          error?.code === '23505'
            ? 'Faktura för denna period finns redan för den här hyresgästen.'
            : (error?.message ?? 'okänt fel')
        fel.push(`${primar.objekt.hyresgast} (${gruppRader.map((r) => r.objekt.objektnummer).join(', ')}): ${meddelande}`)
        continue
      }

      const fakturaRader: FakturaRad[] = []
      for (const r of gruppRader) {
        const radBelopp = Number(r.belopp) || 0
        const poster = byggRadposter(r.objekt, radBelopp, perioder, drifttillaggSummaByObjekt[r.objekt.id] ?? 0)

        let objektMisslyckades = false
        for (const post of poster) {
          // Sekventiella inserts (inte en batch) så att skapad_at ökar i insättningsordning —
          // avgörande för att raderna sedan hämtas i rätt ordning (Hyra → indextillägg → Fastighetsskatt → Övrigt).
          const { error: radError } = await supabase.from('faktura_rader').insert({
            faktura_id: data.id,
            objekt_id: r.objekt.id,
            beskrivning: post.beskrivning,
            antal: 1,
            a_pris: post.belopp,
            belopp: post.belopp,
            typ: post.typ,
          })
          if (radError) {
            fel.push(`${primar.objekt.hyresgast} (${r.objekt.objektnummer}): faktura skapad men rad misslyckades — ${radError.message}`)
            objektMisslyckades = true
            break
          }
          fakturaRader.push({
            id: `${data.id}-${r.objekt.id}-${fakturaRader.length}`,
            faktura_id: data.id,
            objekt_id: r.objekt.id,
            beskrivning: post.beskrivning,
            antal: 1,
            a_pris: post.belopp,
            belopp: post.belopp,
            typ: post.typ,
            skapad_at: '',
          })
        }
        if (objektMisslyckades) continue
        objektById[r.objekt.id] = r.objekt
      }
      if (fakturaRader.length === 0) continue

      ok++
      skapadeIds.push(data.id)
      const fastighetForRad = fastighetById[data.fastighet_id]
      if (fastighetForRad) {
        const grupp = avigruppForFastighet(fastighetForRad)
        const entry: FakturaPdfEntry = { faktura: data, fastighet: fastighetForRad, rader: fakturaRader }
        const lista = pdfEntriesByAgare.get(grupp)
        if (lista) lista.push(entry)
        else pdfEntriesByAgare.set(grupp, [entry])
      }
    }

    setSending(false)
    setResultat({ ok, fel, ids: skapadeIds })
    if (ok > 0) {
      setRader(null)
      onCreated()
      if (pdfEntriesByAgare.size > 0) {
        import('../pdf/fakturaPdf')
          .then(async ({ laddaNerFakturorSomPdf }) => {
            for (const [grupp, entries] of pdfEntriesByAgare) {
              await laddaNerFakturorSomPdf(entries, objektById, `avisering-${slugifyFilnamn(grupp)}-${periodLabel}.pdf`)
            }
          })
          .catch((err) => {
            setResultat((prev) => (prev ? { ...prev, fel: [...prev.fel, `PDF-nedladdning misslyckades: ${err.message ?? err}`] } : prev))
          })
      }
    }
  }

  const summa = rader?.filter((r) => r.inkluderad).reduce((s, r) => s + (Number(r.belopp) || 0), 0) ?? 0

  return (
    <div>
      <div className="mb-5 rounded-card border border-line bg-surface p-5 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[13.5px] font-bold">Bygg aviseringslista</span>
          <details className="group relative">
            <summary className="flex h-[18px] w-[18px] cursor-pointer list-none items-center justify-center rounded-full border border-line text-[11px] font-bold text-muted hover:border-navy hover:text-navy [&::-webkit-details-marker]:hidden">
              ?
            </summary>
            <div className="absolute left-0 top-[26px] z-10 w-[280px] rounded-lg border border-line bg-surface p-3 text-[12px] leading-relaxed text-ink-soft shadow-card">
              <b className="text-ink">Så funkar det:</b> välj period → bocka i vilka fastigheter → "Bygg lista" → granska beloppen → "Godkänn och skicka". En PDF per fastighetsägare (t.ex. en för Dina Försäkringar, en för Lindesås) laddas ner automatiskt till din dator direkt efteråt — klart!
            </div>
          </details>
        </div>
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
            disabled={valdaFastigheter.size === 0}
            className="rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            Bygg lista
          </button>
        </div>

        <div className="mt-3 border-t border-line-soft pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Fastigheter</span>
            <span className="flex gap-3 text-[11.5px] font-semibold">
              <button
                onClick={() => setValdaFastigheter(new Set(skrivbaraFastigheter.map((f) => f.id)))}
                className="text-navy hover:text-gold"
              >
                Alla
              </button>
              <button onClick={() => setValdaFastigheter(new Set())} className="text-navy hover:text-gold">
                Ingen
              </button>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {skrivbaraFastigheter.map((f) => (
              <label key={f.id} className="flex items-center gap-1.5 text-[12.5px]">
                <input
                  type="checkbox"
                  checked={valdaFastigheter.has(f.id)}
                  onChange={() => toggleFastighet(f.id)}
                />
                {f.namn}
              </label>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11.5px] text-muted">
          Period: <b>{periodRange(ar, typ, varde).label}</b>. Listar objekt med aktivt kontrakt under perioden,
          bland valda fastigheter du har skrivbehörighet till. Inget skapas förrän du godkänner.
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

          {rader.some((r) => r.redanFakturerad) && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-soft bg-amber-soft px-[18px] py-2 text-[12px] text-amber">
              <span>
                {rader.filter((r) => r.redanFakturerad).length} objekt har redan en faktura för den här perioden och
                är avbockade nedan. Vill du bara ha PDF:erna igen (t.ex. efter att adresser rättats till)? Bygg inte
                om listan — ladda ner dem direkt istället:
              </span>
              <Link
                to={`/fakturor/skriv-ut?ids=${[...new Set(rader.filter((r) => r.redanFakturerad).flatMap((r) => r.befintligaFakturaIds))].join(',')}`}
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap rounded-full bg-navy px-3 py-1 text-[12px] font-semibold text-white hover:bg-navy-deep"
              >
                Ladda ner dessa som PDF →
              </Link>
            </div>
          )}

          {rader.length === 0 ? (
            <div className="px-[18px] py-6 text-center text-[12.5px] italic text-muted">
              Inga aktiva kontrakt hittades för den perioden.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {rader.map((r, i) => (
                <div
                  key={r.objekt.id}
                  className={`grid min-w-[620px] grid-cols-[24px_90px_1fr_120px_140px_100px] items-center gap-2.5 border-b border-line-soft px-[18px] py-2.5 text-[12.5px] last:border-none ${
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
                    {r.redanFakturerad && (
                      <span className="ml-1.5 rounded-full bg-amber-soft px-1.5 py-0.5 text-[10px] font-bold text-amber">
                        Redan fakturerad
                      </span>
                    )}
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
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">
              {resultat.ok} fakturor skapade{resultat.ok > 0 ? ' — en PDF per fastighetsägare har laddats ner automatiskt.' : '.'}
            </div>
            {resultat.ids.length > 0 && (
              <Link
                to={`/fakturor/skriv-ut?ids=${resultat.ids.join(',')}`}
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:border-navy"
              >
                Öppna igen
              </Link>
            )}
          </div>
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
