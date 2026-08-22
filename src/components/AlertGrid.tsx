import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { AlertsData } from '../utils/alerts'
import { fmt, fmtArea } from '../utils/format'

function AlertCard({
  title,
  count,
  pillColor,
  emptyLabel,
  children,
}: {
  title: string
  count: number
  pillColor: 'wine' | 'amber' | 'navy'
  emptyLabel: string
  children: React.ReactNode
}) {
  const pillClasses: Record<string, string> = {
    wine: 'bg-wine-soft text-wine',
    amber: 'bg-amber-soft text-amber',
    navy: 'bg-[#E7ECF3] text-navy',
  }
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line-soft px-[18px] py-3.5">
        <h4 className="m-0 flex items-center gap-2 text-[13.5px] font-bold">{title}</h4>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold ${pillClasses[pillColor]}`}>
          {count} st
        </span>
      </div>
      {count === 0 ? (
        <div className="px-[18px] py-4 text-[12.5px] italic text-muted">{emptyLabel}</div>
      ) : (
        children
      )}
    </div>
  )
}

function Row({ left, sub, right }: { left: React.ReactNode; sub?: string; right: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2.5 border-b border-line-soft px-[18px] py-2.5 text-[13px] last:border-none">
      <div>
        {left}
        {sub && <div className="mt-0.5 text-[11.5px] text-muted">{sub}</div>}
      </div>
      <div className="whitespace-nowrap text-right font-mono text-xs text-muted">{right}</div>
    </div>
  )
}

export function AlertGrid({
  data,
  canWrite,
  onChanged,
}: {
  data: AlertsData
  canWrite?: (fastighetId: string) => boolean
  onChanged?: () => void
}) {
  const { vacant, expiring, paymentRisk, unregistered, forlangningPasserad, forlangningKommande } = data
  const [confirming, setConfirming] = useState<string | null>(null)

  async function bekraftaForlangning(objektId: string) {
    setConfirming(objektId)
    const { error } = await supabase.rpc('bekrafta_forlangning', { p_objekt_id: objektId })
    setConfirming(null)
    if (error) {
      alert(error.message)
      return
    }
    onChanged?.()
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
      {(forlangningPasserad.length > 0 || forlangningKommande.length > 0) && (
        <AlertCard
          title="Avtalsförlängning — uppsägningstid"
          count={forlangningPasserad.length + forlangningKommande.length}
          pillColor="wine"
          emptyLabel=""
        >
          {forlangningPasserad.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-2.5 border-b border-line-soft px-[18px] py-2.5 text-[13px] last:border-none"
            >
              <div>
                <b className="font-semibold">{o.hyresgast}</b>
                <div className="mt-0.5 text-[11.5px] text-wine">
                  {o.objektnummer} · uppsägningstid gick ut för {Math.abs(o.dagarTillFrist)} dagar sedan — inget
                  svar registrerat. Väntar bekräftelse av automatisk förlängning ({o.forlangning_manader} mån).
                </div>
              </div>
              {canWrite?.(o.fastighet_id) && (
                <button
                  onClick={() => bekraftaForlangning(o.id)}
                  disabled={confirming === o.id}
                  className="whitespace-nowrap rounded-full bg-navy px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
                >
                  Bekräfta förlängning
                </button>
              )}
            </div>
          ))}
          {forlangningKommande.map((o) => (
            <Row
              key={o.id}
              left={<b className="font-semibold">{o.hyresgast}</b>}
              sub={o.objektnummer}
              right={
                <>
                  Uppsägningstid går ut om {o.dagarTillFrist} dagar
                  <br />
                  inget svar registrerat än
                </>
              }
            />
          ))}
        </AlertCard>
      )}

      <AlertCard title="Vakanta objekt" count={vacant.length} pillColor="wine" emptyLabel="Inga vakanser.">
        {vacant.map((o) => (
          <Row
            key={o.id}
            left={
              <>
                <b className="font-semibold">{o.objektnummer}</b> · {o.typ}
              </>
            }
            sub={`${fmtArea(o.area_kvm)} kvm`}
            right={
              <>
                {fmt(o.vakanshyra_ar ?? 0)} kr/år
                <br />i förlorat hyresvärde
              </>
            }
          />
        ))}
      </AlertCard>

      <AlertCard
        title="Kontrakt som löper ut inom ~6 mån"
        count={expiring.length}
        pillColor="amber"
        emptyLabel="Inga kontrakt inom horisonten."
      >
        {expiring.map((o) => (
          <Row
            key={o.id}
            left={<b className="font-semibold">{o.hyresgast}</b>}
            sub={o.objektnummer}
            right={
              <>
                {o.kontrakt_tom}
                <br />({o.dagarKvar} dagar)
              </>
            }
          />
        ))}
      </AlertCard>

      <AlertCard
        title="Betalningsanmärkningar i fakturering"
        count={paymentRisk.length}
        pillColor="amber"
        emptyLabel="Inga anmärkningar."
      >
        {paymentRisk.map((i) => (
          <Row
            key={i.id}
            left={<b className="font-semibold">{i.hyresgast}</b>}
            sub={`Faktura ${i.fakturanummer} · ${i.period}`}
            right={i.anmarkning ?? (i.status === 'inkasso' ? 'Inkasso' : 'Försenad')}
          />
        ))}
      </AlertCard>

      <AlertCard
        title="Fakturerade objekt saknas i rentroll"
        count={unregistered.length}
        pillColor="navy"
        emptyLabel="Alla fakturerade objekt är registrerade."
      >
        {unregistered.map((i) => (
          <Row
            key={i.id}
            left={
              <>
                <b className="font-semibold">{i.objektnummer ?? '—'}</b> · {i.hyresgast}
              </>
            }
            right="Behöver registreras"
          />
        ))}
      </AlertCard>
    </div>
  )
}
