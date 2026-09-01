import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'
import { fmt } from '../utils/format'
import { AmfastLogo } from './AmfastLogo'

const AMFAST_NAMN = 'AM Fastighetsförvaltning AB'

function radMoms(rad: FakturaRad, objektById: Record<string, Objekt>): boolean {
  if (!rad.objekt_id) return false
  return objektById[rad.objekt_id]?.momsat ?? false
}

export function FakturaDocument({
  faktura,
  rader,
  fastighet,
  objektById,
}: {
  faktura: Faktura
  rader: FakturaRad[]
  fastighet: Fastighet
  objektById: Record<string, Objekt>
}) {
  const momspliktigtBelopp = rader
    .filter((r) => radMoms(r, objektById))
    .reduce((sum, r) => sum + r.belopp, 0)
  const momsfrittBelopp = rader
    .filter((r) => !radMoms(r, objektById))
    .reduce((sum, r) => sum + r.belopp, 0)
  const totaltExklMoms = momspliktigtBelopp + momsfrittBelopp
  const moms = Math.round(momspliktigtBelopp * 0.25)
  const totaltInklMoms = totaltExklMoms + moms

  const titel = faktura.typ === 'kreditfaktura' ? 'Kreditfaktura' : faktura.typ === 'paminnelse' ? 'Påminnelsefaktura' : 'Hyresfaktura'
  const objektForFaktura = faktura.objekt_id ? objektById[faktura.objekt_id] : null
  const objektGata = objektForFaktura?.gata ?? null
  const faktureringsadress = objektForFaktura?.faktureringsadress ?? null

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-[16mm] text-[13px] text-ink print:p-0 print:shadow-none">
      <div className="flex items-start justify-between border-b border-line pb-4">
        <AmfastLogo height={30} />
        <div className="text-right">
          <div className="font-display text-xl font-semibold text-navy-deep">{titel}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 text-[12.5px]">
        <div>
          <div className="mb-1 font-semibold uppercase tracking-wide text-muted">Fastighetsbeteckning och adress</div>
          <div>{fastighet.namn}</div>
          {objektGata && <div className="text-muted">{objektGata}</div>}
        </div>
        <div className="text-right">
          <table className="ml-auto">
            <tbody>
              <tr>
                <td className="pr-3 text-muted">Fakturanr</td>
                <td className="font-mono font-semibold">{faktura.fakturanummer}</td>
              </tr>
              <tr>
                <td className="pr-3 text-muted">Period</td>
                <td className="font-mono">{faktura.period}</td>
              </tr>
              <tr>
                <td className="pr-3 text-muted">Förfallodatum</td>
                <td className="font-mono">{faktura.forfallodatum}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 text-[12.5px] font-semibold uppercase tracking-wide text-muted">Faktureringsadress</div>
        <div className="text-[13px] font-medium">{faktura.hyresgast}</div>
        {faktureringsadress ? (
          <div className="whitespace-pre-line text-muted">{faktureringsadress}</div>
        ) : (
          <div className="text-[11.5px] italic text-wine">Ingen faktureringsadress angiven — kan ej postas</div>
        )}
        {faktura.objektnummer && <div className="font-mono text-[11.5px] text-muted">Objekt {faktura.objektnummer}</div>}
      </div>

      <table className="mt-6 w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b-2 border-ink text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
            <th className="py-1.5">Specifikation</th>
            <th className="py-1.5 text-right">Belopp</th>
          </tr>
        </thead>
        <tbody>
          {rader.map((r) => (
            <tr key={r.id} className="border-b border-line-soft">
              <td className="py-1.5">{r.beskrivning}</td>
              <td className="py-1.5 text-right font-mono">{fmt(r.belopp)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <table className="text-[12.5px]">
          <tbody>
            <tr>
              <td className="pr-6 py-0.5 text-muted">Totalt (exkl. moms)</td>
              <td className="py-0.5 text-right font-mono">{fmt(totaltExklMoms)}</td>
            </tr>
            {momspliktigtBelopp > 0 && (
              <>
                <tr>
                  <td className="pr-6 py-0.5 text-muted">Momspliktigt belopp</td>
                  <td className="py-0.5 text-right font-mono">{fmt(momspliktigtBelopp)}</td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-muted">Moms (25%)</td>
                  <td className="py-0.5 text-right font-mono">{fmt(moms)}</td>
                </tr>
              </>
            )}
            <tr className="border-t border-ink font-semibold">
              <td className="pr-6 pt-1 text-[13.5px]">
                {totaltInklMoms < 0 ? 'Att kreditera' : 'Summa att betala'}
              </td>
              <td className="pt-1 text-right font-mono text-[13.5px]">{fmt(totaltInklMoms)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {faktura.anmarkning && (
        <div className="mt-4 rounded-lg bg-surface-sunken px-3 py-2 text-[12px] text-ink-soft">{faktura.anmarkning}</div>
      )}

      <div className="mt-8 border-t-2 border-ink pt-3">
        <div className="grid grid-cols-2 gap-6 text-[10.5px] text-muted">
          <div>
            <div className="mb-1.5 font-semibold uppercase tracking-wide text-ink">Betalningsavsändare</div>
            <div className="text-ink">{fastighet.agare ?? AMFAST_NAMN}</div>
            {fastighet.avsandare_adress && <div>{fastighet.avsandare_adress}</div>}
            {fastighet.telefon && <div>Telefon: {fastighet.telefon}</div>}
            {fastighet.epost && <div>E-post: {fastighet.epost}</div>}
          </div>
          <div className="text-right">
            <div className="uppercase tracking-wide">Momsreg.nr</div>
            <div className="mb-1.5 font-mono text-ink">{fastighet.momsregnr ?? '—'}</div>
            <div className="uppercase tracking-wide">Org.nr</div>
            <div className="font-mono text-ink">{fastighet.organisationsnummer ?? '—'}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-lg border border-line bg-surface-sunken px-4 py-3">
          <table className="text-[11px]">
            <tbody>
              <tr>
                <td className="pr-4 text-muted">Fakturanummer</td>
                <td className="font-mono font-semibold">{faktura.fakturanummer}</td>
              </tr>
              <tr>
                <td className="pr-4 text-muted">Förfallodatum</td>
                <td className="font-mono">{faktura.forfallodatum}</td>
              </tr>
              {faktura.objektnummer && (
                <tr>
                  <td className="pr-4 text-muted">Objektnummer</td>
                  <td className="font-mono">{faktura.objektnummer}</td>
                </tr>
              )}
              <tr>
                <td className="pr-4 text-muted">Period</td>
                <td className="font-mono">{faktura.period}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Referens vid betalning
            </div>
            <div className="mt-1 rounded border-2 border-ink px-3 py-2 font-mono text-lg font-bold text-ink">
              {faktura.fakturanummer}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-2 text-[11px]">
          <div>
            <span className="text-muted">Till bankgironr </span>
            <span className="font-mono font-semibold">{fastighet.bankgiro ?? '(anges senare)'}</span>
          </div>
          <div>
            <span className="text-muted">Betalningsmottagare </span>
            <span className="font-semibold">{fastighet.agare ?? AMFAST_NAMN}</span>
          </div>
        </div>

        <div className="mt-2 text-[9.5px] italic text-muted">
          Ange alltid fakturanumret som referens vid betalning.
        </div>
      </div>
    </div>
  )
}
