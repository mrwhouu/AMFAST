import { Link, useParams } from 'react-router-dom'
import { useFakturaDetalj } from '../hooks/useFakturaDetalj'
import { FakturaDocument } from '../components/FakturaDocument'
import { FullScreenState } from '../components/FullScreenState'

export function FakturaPrintPage() {
  const { id } = useParams<{ id: string }>()
  const { faktura, rader, fastighet, objektById, loading, error } = useFakturaDetalj(id)

  if (loading) return <FullScreenState label="Hämtar faktura…" />
  if (error || !faktura || !fastighet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
          <div className="mb-2 text-[13px] font-semibold text-wine">Kunde inte hämta faktura</div>
          <div className="mb-4 text-[12.5px] text-muted">{error ?? 'Fakturan hittades inte'}</div>
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
        <Link to={`/fastighet/${faktura.fastighet_id}`} className="text-[12.5px] font-semibold text-navy hover:text-gold">
          ← Tillbaka
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep"
        >
          Skriv ut / Spara som PDF
        </button>
      </div>
      <div className="mx-auto max-w-[210mm] rounded-card border border-line bg-white shadow-card print:rounded-none print:border-none print:shadow-none">
        <FakturaDocument faktura={faktura} rader={rader} fastighet={fastighet} objektById={objektById} />
      </div>
    </div>
  )
}
