import { Fragment, useState } from 'react'
import { dagarKvar, objektTotalAr, type Objekt, type ObjektDrifttillagg } from '../types'
import { fmt, fmtArea } from '../utils/format'
import { ObjektFormModal } from './ObjektFormModal'
import { ObjektHistorikModal } from './ObjektHistorikModal'
import { DrifttillaggPanel } from './DrifttillaggPanel'
import { DelaObjektModal } from './DelaObjektModal'

const STATUS_BADGE: Record<Objekt['status'], string> = {
  uthyrd: 'bg-green-soft text-green',
  vakant: 'bg-wine-soft text-wine',
  avslutat: 'bg-surface-sunken text-muted',
}
const STATUS_LABEL: Record<Objekt['status'], string> = {
  uthyrd: 'Uthyrd',
  vakant: 'Vakant',
  avslutat: 'Avslutat',
}

export function ObjectTable({
  objekt,
  drifttillaggByObjekt = {},
  canWrite,
  onChanged,
}: {
  objekt: Objekt[]
  drifttillaggByObjekt?: Record<string, ObjektDrifttillagg[]>
  canWrite: (fastighetId: string) => boolean
  onChanged: () => void
}) {
  const [editing, setEditing] = useState<Objekt | null>(null)
  const [historikFor, setHistorikFor] = useState<Objekt | null>(null)
  const [delningFor, setDelningFor] = useState<Objekt | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.8px]">
            <thead>
              <tr>
                {['Objekt', 'Typ', 'Hyresgäst', 'Area', 'Kr/m²', 'Hyra/år', 'Fskatt/år', 'Drift/år', 'Totalt/år', 'Kontrakt t.o.m', 'Status', ''].map(
                  (h, i) => (
                    <th
                      key={h + i}
                      className={`whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted ${
                        i >= 3 && i <= 8 ? 'text-right' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {objekt.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-6 text-center text-muted">
                    Inga objekt matchar filtret.
                  </td>
                </tr>
              )}
              {objekt.map((o) => {
                const dk = dagarKvar(o.kontrakt_tom)
                const soon = dk !== null && dk < 200
                const drift = drifttillaggByObjekt[o.id] ?? []
                const driftSumma = drift.reduce((s, d) => s + d.belopp_ar, 0)
                const total = objektTotalAr(o, driftSumma)
                const isOpen = expanded === o.id
                return (
                  <Fragment key={o.id}>
                    <tr className="border-b border-line-soft last:border-none hover:bg-[#FAFBFD]">
                      <td className="px-3.5 py-2.5 font-mono font-semibold text-navy">{o.objektnummer}</td>
                      <td className="px-3.5 py-2.5">{o.typ}</td>
                      <td className="px-3.5 py-2.5">
                        {o.hyresgast ?? <span className="italic text-muted">Outhyrt</span>}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">{fmtArea(o.area_kvm)}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono">
                        {o.kr_per_kvm ? fmt(o.kr_per_kvm) : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">
                        {fmt(o.status === 'vakant' ? (o.vakanshyra_ar ?? 0) : o.hyra_ar)}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">
                        {o.fastighetsskatt_ar ? fmt(o.fastighetsskatt_ar) : '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono">
                        <button
                          onClick={() => setExpanded(isOpen ? null : o.id)}
                          className="underline decoration-dotted underline-offset-2 hover:text-navy"
                          title="Visa/dölj drifttillägg"
                        >
                          {driftSumma ? fmt(driftSumma) : '—'}
                        </button>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold">{fmt(total)}</td>
                      <td className="px-3.5 py-2.5">
                        {o.kontrakt_tom ? (
                          <span className={soon ? 'font-semibold text-amber' : ''}>{o.kontrakt_tom}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${STATUS_BADGE[o.status]}`}>
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="space-x-2.5 whitespace-nowrap px-3.5 py-2.5">
                        <button
                          onClick={() => setHistorikFor(o)}
                          className="text-[11.5px] font-semibold text-ink-soft hover:text-navy"
                        >
                          Historik
                        </button>
                        {canWrite(o.fastighet_id) && (
                          <button
                            onClick={() => setEditing(o)}
                            className="text-[11.5px] font-semibold text-navy hover:text-gold"
                          >
                            Redigera
                          </button>
                        )}
                        {canWrite(o.fastighet_id) && o.status !== 'avslutat' && (
                          <button
                            onClick={() => setDelningFor(o)}
                            className="text-[11.5px] font-semibold text-ink-soft hover:text-navy"
                          >
                            Dela
                          </button>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-line-soft last:border-none">
                        <td colSpan={12} className="p-0">
                          <DrifttillaggPanel
                            objektId={o.id}
                            rader={drift}
                            canEdit={canWrite(o.fastighet_id)}
                            onChanged={onChanged}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <ObjektFormModal
          fastighetId={editing.fastighet_id}
          objekt={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            onChanged()
          }}
        />
      )}

      {historikFor && <ObjektHistorikModal objekt={historikFor} onClose={() => setHistorikFor(null)} />}

      {delningFor && (
        <DelaObjektModal
          objekt={delningFor}
          onClose={() => setDelningFor(null)}
          onSaved={() => {
            setDelningFor(null)
            onChanged()
          }}
        />
      )}
    </>
  )
}
