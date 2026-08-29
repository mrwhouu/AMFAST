import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TekniskObjekt } from '../types'
import { useTekniskObjektDetalj } from '../hooks/useTekniskObjektDetalj'
import { DokumentList } from './DokumentList'
import { UnderhallFormModal } from './UnderhallFormModal'
import { BesiktningFormModal } from './BesiktningFormModal'
import { GarantiFormModal } from './GarantiFormModal'
import { KATEGORI_LABEL } from './TekniskObjektFormModal'

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  planerad: { label: 'Planerad', cls: 'bg-line-soft text-ink-soft' },
  pagaende: { label: 'Pågående', cls: 'bg-amber-soft text-amber' },
  utford: { label: 'Utförd', cls: 'bg-green-soft text-green' },
  forsenad: { label: 'Försenad', cls: 'bg-wine-soft text-wine' },
  installd: { label: 'Inställd', cls: 'bg-line-soft text-muted' },
}

/**
 * Objektets "informationskort" — hela kapitel 5/32-flödet: klicka på ett
 * objekt och se all kopplad information (teknisk info, underhåll,
 * besiktningar, garanti, dokument) på samma plats.
 */
export function TekniskObjektDetailModal({
  objekt,
  canWrite,
  onClose,
}: {
  objekt: TekniskObjekt
  canWrite: boolean
  onClose: () => void
}) {
  const { dokument, underhall, besiktningar, garantier, loading, error, reload } = useTekniskObjektDetalj(objekt.id)
  const [showUnderhall, setShowUnderhall] = useState(false)
  const [showBesiktning, setShowBesiktning] = useState(false)
  const [showGaranti, setShowGaranti] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  async function slutforUnderhall(id: string) {
    setBusy(id)
    await supabase.rpc('slutfor_underhall', { p_id: id })
    setBusy(null)
    reload()
  }

  async function slutforBesiktning(id: string) {
    setBusy(id)
    await supabase.rpc('slutfor_besiktning', { p_id: id })
    setBusy(null)
    reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">{objekt.namn}</h2>
            <p className="text-[12.5px] text-muted">
              {KATEGORI_LABEL[objekt.kategori] ?? objekt.kategori}
              {objekt.objekt_id_kod && <> · {objekt.objekt_id_kod}</>}
            </p>
          </div>
          <button onClick={onClose} className="text-sm font-semibold text-muted hover:text-ink">
            Stäng
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-line-soft bg-surface-sunken px-4 py-3 text-[12.5px]">
          <InfoRad label="Modell" varde={objekt.modell} />
          <InfoRad label="Tillverkare" varde={objekt.tillverkare} />
          <InfoRad label="Installationsdatum" varde={objekt.installationsdatum} />
          <InfoRad label="Status" varde={objekt.status} />
        </div>

        {loading && <div className="py-4 text-center text-sm text-muted">Laddar…</div>}
        {error && <div className="mb-3 rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] text-wine">{error}</div>}

        {!loading && (
          <div className="space-y-5">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Garanti</span>
                {canWrite && garantier.length === 0 && (
                  <button
                    onClick={() => setShowGaranti(true)}
                    className="text-[11.5px] font-semibold text-navy hover:text-gold"
                  >
                    + Registrera garanti
                  </button>
                )}
              </div>
              {garantier.length === 0 ? (
                <div className="text-[12.5px] italic text-muted">Ingen garanti registrerad.</div>
              ) : (
                <ul className="space-y-1.5">
                  {garantier.map((g) => (
                    <li key={g.id} className="flex items-center justify-between text-[12.5px]">
                      <span>{g.leverantor ?? 'Okänd leverantör'}</span>
                      <span className="font-mono text-[11px] text-muted">Till {g.garanti_till}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Underhåll & service
                </span>
                {canWrite && (
                  <button
                    onClick={() => setShowUnderhall(true)}
                    className="text-[11.5px] font-semibold text-navy hover:text-gold"
                  >
                    + Ny åtgärd
                  </button>
                )}
              </div>
              {underhall.length === 0 ? (
                <div className="text-[12.5px] italic text-muted">Inga underhållsåtgärder registrerade.</div>
              ) : (
                <ul className="space-y-1.5">
                  {underhall.map((u) => (
                    <li key={u.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span>
                        {u.typ}
                        {u.aterkommande && <span className="ml-1 text-muted">(återkommande)</span>}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted">
                          {u.utfort_datum ?? u.planerat_datum}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_LABEL[u.status].cls}`}
                        >
                          {STATUS_LABEL[u.status].label}
                        </span>
                        {canWrite && u.status !== 'utford' && (
                          <button
                            disabled={busy === u.id}
                            onClick={() => slutforUnderhall(u.id)}
                            className="text-[11px] font-semibold text-navy hover:text-gold disabled:opacity-60"
                          >
                            Slutför
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Besiktningar</span>
                {canWrite && (
                  <button
                    onClick={() => setShowBesiktning(true)}
                    className="text-[11.5px] font-semibold text-navy hover:text-gold"
                  >
                    + Ny besiktning
                  </button>
                )}
              </div>
              {besiktningar.length === 0 ? (
                <div className="text-[12.5px] italic text-muted">Inga besiktningar registrerade.</div>
              ) : (
                <ul className="space-y-1.5">
                  {besiktningar.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span>{b.typ}</span>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted">{b.datum ?? b.forfallodatum}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${STATUS_LABEL[b.status].cls}`}
                        >
                          {STATUS_LABEL[b.status].label}
                        </span>
                        {canWrite && b.status !== 'utford' && (
                          <button
                            disabled={busy === b.id}
                            onClick={() => slutforBesiktning(b.id)}
                            className="text-[11px] font-semibold text-navy hover:text-gold disabled:opacity-60"
                          >
                            Slutför
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <DokumentList
                fastighetId={objekt.fastighet_id}
                tekniskObjektId={objekt.id}
                dokument={dokument}
                canWrite={canWrite}
                onChanged={reload}
              />
            </section>
          </div>
        )}
      </div>

      {showUnderhall && (
        <UnderhallFormModal
          fastighetId={objekt.fastighet_id}
          tekniskObjektId={objekt.id}
          onClose={() => setShowUnderhall(false)}
          onSaved={() => {
            setShowUnderhall(false)
            reload()
          }}
        />
      )}

      {showBesiktning && (
        <BesiktningFormModal
          fastighetId={objekt.fastighet_id}
          tekniskObjektId={objekt.id}
          onClose={() => setShowBesiktning(false)}
          onSaved={() => {
            setShowBesiktning(false)
            reload()
          }}
        />
      )}

      {showGaranti && (
        <GarantiFormModal
          tekniskObjektId={objekt.id}
          onClose={() => setShowGaranti(false)}
          onSaved={() => {
            setShowGaranti(false)
            reload()
          }}
        />
      )}
    </div>
  )
}

function InfoRad({ label, varde }: { label: string; varde: string | null }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div>{varde ?? <span className="italic text-muted">Ej angivet</span>}</div>
    </div>
  )
}
