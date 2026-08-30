import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Faktura, FakturaStatus } from '../types'
import { fmt } from '../utils/format'

interface Group {
  hyresgast: string
  fastighetNamn: string
  objekt: string
  rows: Faktura[]
  total: number
  flags: string[]
}

function groupInvoices(fakturor: Faktura[], fastighetNamnById: Record<string, string>): Group[] {
  const groups = new Map<string, Group>();
  for (const f of fakturor) {
    const key = f.hyresgast ?? '—'
    if (!groups.has(key)) {
      groups.set(key, {
        hyresgast: key,
        fastighetNamn: fastighetNamnById[f.fastighet_id] ?? '',
        objekt: f.objektnummer ?? '',
        rows: [],
        total: 0,
        flags: [],
      })
    }
    const g = groups.get(key)!
    g.rows.push(f)
    g.total += f.belopp
    if (f.anmarkning) g.flags.push(f.anmarkning)
  }
  return [...groups.values()]
}

const STATUS_LABEL: Record<FakturaStatus, string> = {
  utkast: 'Utkast',
  skickad: 'Skickad',
  betald: 'Betald',
  forsenad: 'Försenad',
  inkasso: 'Inkasso',
}
const STATUS_CLASS: Record<FakturaStatus, string> = {
  utkast: 'bg-surface-sunken text-muted',
  skickad: 'bg-[#E7ECF3] text-navy',
  betald: 'bg-green-soft text-green',
  forsenad: 'bg-amber-soft text-amber',
  inkasso: 'bg-wine-soft text-wine',
}

function StatusBadge({ status }: { status: FakturaStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function formatNedladdad(iso: string) {
  const d = new Date(iso)
  const datum = d.toLocaleDateString('sv-SE')
  const tid = d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
  return `${datum} ${tid}`
}

function NedladdadBadge({ nedladdadAt }: { nedladdadAt: string | null }) {
  if (!nedladdadAt) return null
  return (
    <span
      title={`PDF nedladdad ${formatNedladdad(nedladdadAt)} — se upp så du inte skickar den igen av misstag`}
      className="inline-flex items-center gap-1 rounded-full bg-green-soft px-2 py-0.5 text-[10px] font-bold text-green"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
        <path d="M4 19h16" />
      </svg>
      Nedladdad {formatNedladdad(nedladdadAt)}
    </span>
  )
}

export function InvoiceGroups({
  fakturor,
  fastighetNamnById,
  canWrite,
  onChanged,
}: {
  fakturor: Faktura[]
  fastighetNamnById: Record<string, string>
  canWrite: (fastighetId: string) => boolean
  onChanged: () => void
}) {
  const groups = groupInvoices(fakturor, fastighetNamnById)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [marking, setMarking] = useState<string | null>(null)

  async function markInkasso(fakturaId: string) {
    if (!confirm('Markera denna faktura som skickad till inkasso?')) return
    setMarking(fakturaId)
    const { error } = await supabase.rpc('markera_faktura_inkasso', { p_faktura_id: fakturaId })
    setMarking(null)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  async function markBetald(fakturaId: string) {
    if (!confirm('Markera denna faktura som betald?')) return
    setMarking(fakturaId)
    const { error } = await supabase.rpc('markera_faktura_betald', { p_faktura_id: fakturaId })
    setMarking(null)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  async function skickaPaminnelse(fakturaId: string) {
    if (!confirm('Skicka en påminnelse för denna faktura? En ny påminnelsefaktura (60 kr, 14 dagars förfallotid) skapas.')) return
    setMarking(fakturaId)
    const { error } = await supabase.rpc('skicka_paminnelse', { p_faktura_id: fakturaId })
    setMarking(null)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  return (
    <div>
      {groups.map((g) => {
        const open = openKey === g.hyresgast
        return (
          <div
            key={g.hyresgast}
            className="mb-3 overflow-hidden rounded-card border border-line bg-surface shadow-card"
          >
            <div
              onClick={() => setOpenKey(open ? null : g.hyresgast)}
              className="flex cursor-pointer items-center justify-between px-[18px] py-3.5 hover:bg-surface-sunken"
            >
              <div>
                <span className="text-[13.5px] font-bold">{g.hyresgast}</span>
                <span className="ml-2 font-mono text-[11px] text-muted">
                  {g.fastighetNamn} · {g.objekt}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {g.flags.map((flag, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      flag.includes('Saknas') ? 'bg-wine-soft text-wine' : 'bg-amber-soft text-amber'
                    }`}
                  >
                    {flag}
                  </span>
                ))}
                <span className="font-mono text-sm font-semibold">{fmt(g.total)} kr</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  className={`opacity-50 transition-transform ${open ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
            {open && (
              <div>
                {g.rows.map((r) => (
                  <div key={r.id} className="border-t border-line-soft px-[18px] py-2.5 text-[12.5px]">
                    <div className="overflow-x-auto">
                      <div className="grid min-w-[540px] grid-cols-[90px_90px_1fr_110px_90px] items-center gap-2.5">
                        <div className="font-mono font-semibold text-navy">
                          <Link to={`/faktura/${r.id}`} className="hover:text-gold hover:underline" title="Visa/skriv ut faktura">
                            {r.fakturanummer}
                          </Link>
                        </div>
                        <div className="font-mono text-muted">{r.period}</div>
                        <div className="text-[11.5px] text-amber">{r.anmarkning ?? ''}</div>
                        <div className="text-right font-mono text-muted">förf. {r.forfallodatum}</div>
                        <div className="text-right font-mono font-semibold">{fmt(r.belopp)} kr</div>
                      </div>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        <StatusBadge status={r.status} />
                        <NedladdadBadge nedladdadAt={r.pdf_nedladdad_at} />
                        {r.skickad_datum && <span>Skickad {r.skickad_datum}</span>}
                        {r.betald_datum && <span>Betald {r.betald_datum}</span>}
                        {r.inkasso_datum && <span>Inkasso {r.inkasso_datum}</span>}
                      </div>
                      {canWrite(r.fastighet_id) && r.status !== 'inkasso' && r.status !== 'betald' && (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => markBetald(r.id)}
                            disabled={marking === r.id}
                            className="text-[11px] font-semibold text-green hover:text-green/70 disabled:opacity-60"
                          >
                            Markera som betald
                          </button>
                          {r.typ === 'faktura' && (
                            <button
                              onClick={() => skickaPaminnelse(r.id)}
                              disabled={marking === r.id}
                              className="text-[11px] font-semibold text-amber hover:text-amber/70 disabled:opacity-60"
                            >
                              Skicka påminnelse
                            </button>
                          )}
                          <button
                            onClick={() => markInkasso(r.id)}
                            disabled={marking === r.id}
                            className="text-[11px] font-semibold text-wine hover:text-wine/70 disabled:opacity-60"
                          >
                            Markera som skickad till inkasso
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
