import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFakturaDetalj } from '../hooks/useFakturaDetalj'
import { FakturaDocument } from '../components/FakturaDocument'
import { FullScreenState } from '../components/FullScreenState'

function formatNedladdad(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('sv-SE')} ${d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`
}

export function FakturaPrintPage() {
  const { id } = useParams<{ id: string }>()
  const { faktura, rader, fastighet, objektById, loading, error, reload } = useFakturaDetalj(id)
  const [laddarNer, setLaddarNer] = useState(false)

  async function laddaNer() {
    if (!faktura || !fastighet) return
    if (
      faktura.pdf_nedladdad_at &&
      !confirm(
        `Den här fakturan laddades redan ner ${formatNedladdad(faktura.pdf_nedladdad_at)}. Ladda ner igen?`,
      )
    ) {
      return
    }
    setLaddarNer(true)
    try {
      const { laddaNerFakturorSomPdf } = await import('../pdf/fakturaPdf')
      await laddaNerFakturorSomPdf([{ faktura, rader, fastighet }], objektById, `faktura-${faktura.fakturanummer}.pdf`)
      reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kunde inte skapa PDF:en')
    } finally {
      setLaddarNer(false)
    }
  }

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
        <div className="flex items-center gap-3">
          {faktura.pdf_nedladdad_at && (
            <span className="text-[11.5px] text-green">✓ Nedladdad {formatNedladdad(faktura.pdf_nedladdad_at)}</span>
          )}
          <div className="flex gap-2">
            <button
              onClick={laddaNer}
              disabled={laddarNer}
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
      </div>
      <div className="mx-auto max-w-[210mm] rounded-card border border-line bg-white shadow-card print:rounded-none print:border-none print:shadow-none">
        <FakturaDocument faktura={faktura} rader={rader} fastighet={fastighet} objektById={objektById} />
      </div>
    </div>
  )
}
