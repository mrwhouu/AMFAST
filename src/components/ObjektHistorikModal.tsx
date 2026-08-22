import type { Objekt } from '../types'
import { useObjektHistorik } from '../hooks/useObjektHistorik'
import { fmt } from '../utils/format'

export function ObjektHistorikModal({ objekt, onClose }: { objekt: Objekt; onClose: () => void }) {
  const { historik, loading, error } = useObjektHistorik(objekt.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Historik — {objekt.objektnummer}</h2>
            <p className="text-[12.5px] text-muted">Tidigare hyresgäster och kontraktsändringar, senaste först.</p>
          </div>
          <button onClick={onClose} className="text-sm font-semibold text-muted hover:text-ink">
            Stäng
          </button>
        </div>

        {loading && <div className="py-6 text-center text-sm text-muted">Laddar…</div>}
        {error && <div className="rounded-lg bg-wine-soft px-3 py-2 text-[12.5px] text-wine">{error}</div>}

        {!loading && !error && historik.length === 0 && (
          <div className="py-6 text-center text-sm italic text-muted">
            Ingen historik registrerad för det här objektet än.
          </div>
        )}

        {!loading && historik.length > 0 && (
          <div className="space-y-3">
            {historik.map((h) => (
              <div key={h.id} className="rounded-lg border border-line-soft bg-surface-sunken px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-semibold">
                    {h.hyresgast ?? <span className="italic text-muted">Vakant</span>}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {new Date(h.skapad_at).toLocaleDateString('sv-SE')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                  {h.kontrakt_fran && <span>Fr.o.m {h.kontrakt_fran}</span>}
                  {h.kontrakt_tom && <span>T.o.m {h.kontrakt_tom}</span>}
                  {h.hyra_ar != null && <span className="font-mono">{fmt(h.hyra_ar)} kr/år</span>}
                </div>
                {h.orsak_avslut && (
                  <div className="mt-1.5 inline-block rounded-full bg-amber-soft px-2 py-0.5 text-[10.5px] font-semibold text-amber">
                    {h.orsak_avslut}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
