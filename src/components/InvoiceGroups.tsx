import { useState, type ReactNode } from 'react'
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

function IconButton({
  title,
  color,
  disabled,
  onClick,
  children,
}: {
  title: string
  color: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md ${color} hover:bg-surface-sunken disabled:opacity-40`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
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
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [marking, setMarking] = useState<string | null>(null)
  const [datumFilter, setDatumFilter] = useState('')

  const synligaFakturor = datumFilter ? fakturor.filter((f) => f.skickad_datum === datumFilter) : fakturor
  const groups = groupInvoices(synligaFakturor, fastighetNamnById)

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

  async function taBort(fakturaId: string, fakturanummer: string) {
    if (!confirm(`Ta bort faktura ${fakturanummer}? Det går inte att ångra — använd bara om den skapades av misstag.`)) return
    setMarking(fakturaId)
    const { error } = await supabase.from('fakturor').delete().eq('id', fakturaId)
    setMarking(null)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px]">
        <label className="flex items-center gap-1.5 text-muted">
          Visa skickade
          <input
            type="date"
            value={datumFilter}
            onChange={(e) => setDatumFilter(e.target.value)}
            className="input !w-auto py-1"
          />
        </label>
        {datumFilter && (
          <button onClick={() => setDatumFilter('')} className="font-semibold text-navy hover:text-gold">
            Visa alla
          </button>
        )}
        {datumFilter && (
          <span className="text-muted">
            {synligaFakturor.length} faktur{synligaFakturor.length === 1 ? 'a' : 'or'} skickade{' '}
            {new Date(datumFilter).toLocaleDateString('sv-SE')}
          </span>
        )}
      </div>
      {groups.length === 0 && datumFilter && (
        <div className="rounded-card border border-line bg-surface px-5 py-6 text-center text-[12.5px] italic text-muted shadow-card">
          Inga fakturor skickade den {new Date(datumFilter).toLocaleDateString('sv-SE')}.
        </div>
      )}
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
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-navy">
                          <Link to={`/faktura/${r.id}`} className="hover:text-gold hover:underline" title="Visa/skriv ut faktura">
                            {r.fakturanummer}
                          </Link>
                          <Link
                            to={`/faktura/${r.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Visa faktura i ny flik"
                            className="text-muted hover:text-navy"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
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
                        <div className="flex items-center gap-1">
                          <IconButton
                            title="Markera som betald"
                            color="text-green"
                            disabled={marking === r.id}
                            onClick={() => markBetald(r.id)}
                          >
                            <path d="M4 12l5 5L20 6" />
                          </IconButton>
                          {r.typ === 'faktura' && (
                            <IconButton
                              title="Skicka påminnelse"
                              color="text-amber"
                              disabled={marking === r.id}
                              onClick={() => skickaPaminnelse(r.id)}
                            >
                              <path d="M12 3a5 5 0 0 0-5 5v3.2c0 .7-.25 1.37-.7 1.9L5 15h14l-1.3-1.9a3 3 0 0 1-.7-1.9V8a5 5 0 0 0-5-5z" />
                              <path d="M9.5 18a2.5 2.5 0 0 0 5 0" />
                            </IconButton>
                          )}
                          <IconButton
                            title="Markera som skickad till inkasso"
                            color="text-wine"
                            disabled={marking === r.id}
                            onClick={() => markInkasso(r.id)}
                          >
                            <path d="M12 3l9 18H3z" />
                            <path d="M12 10v4M12 17.5v.01" />
                          </IconButton>
                          <IconButton
                            title="Ta bort (endast om skapad av misstag)"
                            color="text-muted hover:text-wine"
                            disabled={marking === r.id}
                            onClick={() => taBort(r.id, r.fakturanummer)}
                          >
                            <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" />
                          </IconButton>
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
