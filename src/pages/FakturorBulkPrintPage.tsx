import { Link, useSearchParams } from 'react-router-dom'
import { useFakturorBulk } from '../hooks/useFakturorBulk'
import { FakturaDocument } from '../components/FakturaDocument'
import { FullScreenState } from '../components/FullScreenState'

export function FakturorBulkPrintPage() {
  const [params] = useSearchParams()
  const { entries, objektById, loading, error } = useFakturorBulk(params.get('ids') ?? '')

  if (loading) return <FullScreenState label="Hämtar fakturor…" />
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
          <div className="mb-2 text-[13px] font-semibold text-wine">Kunde inte hämta fakturorna</div>
          <div className="mb-4 text-[12.5px] text-muted">{error}</div>
          <Link to="/" className="text-[12.5px] font-semibold text-navy hover:text-gold">
            Till startsidan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-warm py-8">
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between px-2 print:hidden">
        <Link to="/" className="text-[12.5px] font-semibold text-navy hover:text-gold">
          ← Tillbaka
        </Link>
        <div className="text-[12.5px] text-muted">{entries.length} fakturor</div>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
        >
          Skriv ut / Spara som PDF
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mx-auto max-w-[210mm] rounded-card border border-line bg-white p-8 text-center text-[13px] text-muted shadow-card">
          Inga fakturor hittades.
        </div>
      ) : (
        entries.map((e, i) => (
          <div
            key={e.faktura.id}
            className="mx-auto mb-6 max-w-[210mm] rounded-card border border-line bg-white shadow-card print:mb-0 print:rounded-none print:border-none print:shadow-none"
            style={i < entries.length - 1 ? { breakAfter: 'page' } : undefined}
          >
            <FakturaDocument faktura={e.faktura} rader={e.rader} fastighet={e.fastighet} objektById={objektById} />
          </div>
        ))
      )}
    </div>
  )
}
