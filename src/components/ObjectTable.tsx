import { useState } from 'react'
import { dagarKvar, objektTotalAr, type Objekt } from '../types'
import { fmt, fmtArea } from '../utils/format'
import { ObjektFormModal } from './ObjektFormModal'

export function ObjectTable({
  objekt,
  canWrite,
  onChanged,
}: {
  objekt: Objekt[]
  canWrite: (fastighetId: string) => boolean
  onChanged: () => void
}) {
  const [editing, setEditing] = useState<Objekt | null>(null)

  return (
    <>
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.8px]">
            <thead>
              <tr>
                {['Objekt', 'Typ', 'Hyresgäst', 'Area', 'Kr/m²', 'Hyra/år', 'Fskatt/år', 'Totalt/år', 'Kontrakt t.o.m', 'Status', ''].map(
                  (h, i) => (
                    <th
                      key={h + i}
                      className={`whitespace-nowrap border-b border-line bg-surface-sunken px-3.5 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-wide text-muted ${
                        i >= 3 && i <= 7 ? 'text-right' : ''
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
                  <td colSpan={11} className="px-6 py-6 text-center text-muted">
                    Inga objekt matchar filtret.
                  </td>
                </tr>
              )}
              {objekt.map((o) => {
                const dk = dagarKvar(o.kontrakt_tom)
                const soon = dk !== null && dk < 200
                const total = objektTotalAr(o)
                return (
                  <tr key={o.id} className="border-b border-line-soft last:border-none hover:bg-[#FAFBFD]">
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
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold">{fmt(total)}</td>
                    <td className="px-3.5 py-2.5">
                      {o.kontrakt_tom ? (
                        <span className={soon ? 'font-semibold text-amber' : ''}>{o.kontrakt_tom}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5">
                      {o.status === 'vakant' ? (
                        <span className="rounded-full bg-wine-soft px-2 py-0.5 text-[10.5px] font-bold text-wine">
                          Vakant
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-soft px-2 py-0.5 text-[10.5px] font-bold text-green">
                          Uthyrd
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5">
                      {canWrite(o.fastighet_id) && (
                        <button
                          onClick={() => setEditing(o)}
                          className="text-[11.5px] font-semibold text-navy hover:text-gold"
                        >
                          Redigera
                        </button>
                      )}
                    </td>
                  </tr>
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
    </>
  )
}
