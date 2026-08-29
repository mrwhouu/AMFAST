import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Byggnad, Objekt, Ritning, TekniskObjekt, Vaningsplan } from '../types'
import { ByggnadFormModal } from './ByggnadFormModal'
import { VaningsplanFormModal } from './VaningsplanFormModal'
import { RitningarList } from './RitningarList'

/**
 * Fastighetsstrukturen: Byggnad → Våningsplan → Lokaler/tekniska objekt,
 * med ritningar kopplade på byggnads- och våningsplansnivå. Det här är
 * navigeringsträdet den digitala tvillingen byggs ovanpå (se
 * produktbeskrivningens kapitel 5 och 6) — ren visuell 3D-navigering är ett
 * senare steg ovanpå samma datamodell.
 */
export function FastighetsstrukturPanel({
  fastighetId,
  byggnader,
  vaningsplan,
  ritningar,
  objekt,
  tekniskaObjekt,
  canWrite,
  onChanged,
}: {
  fastighetId: string
  byggnader: Byggnad[]
  vaningsplan: Vaningsplan[]
  ritningar: Ritning[]
  objekt: Objekt[]
  tekniskaObjekt: TekniskObjekt[]
  canWrite: boolean
  onChanged: () => void
}) {
  const [showNyByggnad, setShowNyByggnad] = useState(false)
  const [nyttPlanForByggnad, setNyttPlanForByggnad] = useState<string | null>(null)

  const oplacerade = objekt.filter((o) => !o.vaningsplan_id)

  async function placeraLokal(objektId: string, vaningsplanId: string) {
    await supabase.from('objekt').update({ vaningsplan_id: vaningsplanId || null }).eq('id', objektId)
    onChanged()
  }

  return (
    <div>
      {canWrite && (
        <div className="mb-3.5 flex justify-end">
          <button
            onClick={() => setShowNyByggnad(true)}
            className="rounded-full border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-navy"
          >
            + Ny byggnad
          </button>
        </div>
      )}

      {byggnader.length === 0 && (
        <div className="rounded-card border border-line bg-surface px-5 py-6 text-center text-sm italic text-muted">
          Inga byggnader registrerade än.
        </div>
      )}

      <div className="space-y-4">
        {byggnader.map((b) => {
          const plan = vaningsplan.filter((v) => v.byggnad_id === b.id)
          return (
            <div key={b.id} className="rounded-card border border-line bg-surface p-4 shadow-card">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold">{b.namn}</h3>
                  {b.beskrivning && <p className="text-[12.5px] text-muted">{b.beskrivning}</p>}
                </div>
                {canWrite && (
                  <button
                    onClick={() => setNyttPlanForByggnad(b.id)}
                    className="text-[12px] font-semibold text-navy hover:text-gold"
                  >
                    + Våningsplan
                  </button>
                )}
              </div>

              <RitningarList
                fastighetId={fastighetId}
                byggnadId={b.id}
                ritningar={ritningar}
                canWrite={canWrite}
                onChanged={onChanged}
              />

              {plan.length === 0 ? (
                <div className="mt-3 text-[12.5px] italic text-muted">Inga våningsplan registrerade än.</div>
              ) : (
                <div className="mt-3 space-y-3">
                  {plan.map((v) => {
                    const lokaler = objekt.filter((o) => o.vaningsplan_id === v.id)
                    const tekn = tekniskaObjekt.filter((t) => t.vaningsplan_id === v.id)
                    return (
                      <div key={v.id} className="rounded-lg border border-line-soft bg-surface-sunken p-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[13px] font-semibold">{v.namn}</span>
                          <span className="font-mono text-[11px] text-muted">
                            {lokaler.length} lokal(er) · {tekn.length} tekniskt objekt
                          </span>
                        </div>
                        {lokaler.length > 0 && (
                          <ul className="mb-1 flex flex-wrap gap-1.5">
                            {lokaler.map((o) => (
                              <li
                                key={o.id}
                                className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[11px]"
                              >
                                {o.objektnummer}
                              </li>
                            ))}
                          </ul>
                        )}
                        <RitningarList
                          fastighetId={fastighetId}
                          vaningsplanId={v.id}
                          ritningar={ritningar}
                          canWrite={canWrite}
                          onChanged={onChanged}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {oplacerade.length > 0 && (
        <div className="mt-5 rounded-card border border-line-soft bg-surface-sunken p-4">
          <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Lokaler utan placering ({oplacerade.length})
          </div>
          <ul className="space-y-1.5">
            {oplacerade.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="font-mono">{o.objektnummer}</span>
                {canWrite ? (
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && placeraLokal(o.id, e.target.value)}
                    className="input max-w-[220px]"
                  >
                    <option value="">Placera på våningsplan…</option>
                    {vaningsplan.map((v) => {
                      const byggnad = byggnader.find((b) => b.id === v.byggnad_id)
                      return (
                        <option key={v.id} value={v.id}>
                          {byggnad?.namn} — {v.namn}
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <span className="italic text-muted">Ej placerad</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showNyByggnad && (
        <ByggnadFormModal
          fastighetId={fastighetId}
          onClose={() => setShowNyByggnad(false)}
          onSaved={() => {
            setShowNyByggnad(false)
            onChanged()
          }}
        />
      )}

      {nyttPlanForByggnad && (
        <VaningsplanFormModal
          byggnadId={nyttPlanForByggnad}
          onClose={() => setNyttPlanForByggnad(null)}
          onSaved={() => {
            setNyttPlanForByggnad(null)
            onChanged()
          }}
        />
      )}
    </div>
  )
}
