import { useState } from 'react'
import type { TekniskObjekt, Vaningsplan } from '../types'
import { TekniskObjektFormModal, KATEGORI_LABEL } from './TekniskObjektFormModal'
import { TekniskObjektDetailModal } from './TekniskObjektDetailModal'

export function TekniskaObjektTable({
  fastighetId,
  tekniskaObjekt,
  vaningsplan,
  canWrite,
  onChanged,
}: {
  fastighetId: string
  tekniskaObjekt: TekniskObjekt[]
  vaningsplan: Vaningsplan[]
  canWrite: boolean
  onChanged: () => void
}) {
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<TekniskObjekt | null>(null)

  const vaningsplanNamn = new Map(vaningsplan.map((v) => [v.id, v.namn]))

  return (
    <div>
      {canWrite && (
        <div className="mb-3.5 flex justify-end">
          <button
            onClick={() => setShowNew(true)}
            className="rounded-full bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
          >
            + Nytt tekniskt objekt
          </button>
        </div>
      )}

      {tekniskaObjekt.length === 0 ? (
        <div className="rounded-card border border-line bg-surface px-5 py-6 text-center text-sm italic text-muted">
          Inga tekniska objekt registrerade än.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-sunken text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5">Namn</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5">Objekt-ID</th>
                <th className="px-4 py-2.5">Våningsplan</th>
                <th className="px-4 py-2.5">Tillverkare</th>
              </tr>
            </thead>
            <tbody>
              {tekniskaObjekt.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-surface-sunken"
                >
                  <td className="px-4 py-2.5 font-semibold">{o.namn}</td>
                  <td className="px-4 py-2.5">{KATEGORI_LABEL[o.kategori] ?? o.kategori}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{o.objekt_id_kod ?? '—'}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {o.vaningsplan_id ? (vaningsplanNamn.get(o.vaningsplan_id) ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-muted">{o.tillverkare ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <TekniskObjektFormModal
          fastighetId={fastighetId}
          vaningsplan={vaningsplan}
          onClose={() => setShowNew(false)}
          onSaved={() => {
            setShowNew(false)
            onChanged()
          }}
        />
      )}

      {selected && (
        <TekniskObjektDetailModal objekt={selected} canWrite={canWrite} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
