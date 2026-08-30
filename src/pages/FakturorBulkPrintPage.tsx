import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useFakturorBulk } from '../hooks/useFakturorBulk'
import { FakturaDocument } from '../components/FakturaDocument'
import { FullScreenState } from '../components/FullScreenState'

export function FakturorBulkPrintPage() {
  const [params] = useSearchParams()
  const { entries, objektById, loading, error } = useFakturorBulk(params.get('ids') ?? '')
  const [laddarNer, setLaddarNer] = useState(false)

  const antalRedanNedladdade = entries.filter((e) => e.faktura.pdf_nedladdad_at).length

  async function laddaNer() {
    if (entries.length === 0) return
    if (
      antalRedanNedladdade > 0 &&
      !confirm(`${antalRedanNedladdade} av ${entries.length} fakturor är redan nedladdade sedan tidigare. Ladda ner alla igen?`)
    ) {
      return
    }
    setLaddarNer(true)
    try {
      const { laddaNerFakturorSomPdf } = await import('../pdf/fakturaPdf')
      await laddaNerFakturorSomPdf(entries, objektById, 'avisering.pdf')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kunde inte skapa PDF:en')
    } finally {
      setLaddarNer(false)
    }
  }

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
        <div className="text-[12.5px] text-muted">
          {entries.length} fakturor
          {antalRedanNedladdade > 0 && <span className="ml-2 text-green">✓ {antalRedanNedladdade} redan nedladdade</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={laddaNer}
            disabled={laddarNer || entries.length === 0}
            className="rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            {laddarNer ? 'Skapar PDF…' : 'Ladda ner PDF'}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-line px-4 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-navy"
          >
            Skriv ut
          </button>
        </div>
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
