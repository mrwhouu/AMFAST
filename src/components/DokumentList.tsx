import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Dokument } from '../types'
import { getSignedUrl, uploadToBucket } from '../utils/storage'

const DOKUMENTTYP_LABEL: Record<string, string> = {
  manual: 'Manual',
  serviceprotokoll: 'Serviceprotokoll',
  besiktningsprotokoll: 'Besiktningsprotokoll',
  hyresavtal: 'Hyresavtal',
  ovrigt: 'Övrigt',
}

export function DokumentList({
  fastighetId,
  tekniskObjektId,
  dokument,
  canWrite,
  onChanged,
}: {
  fastighetId: string
  tekniskObjektId: string
  dokument: Dokument[]
  canWrite: boolean
  onChanged: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const path = await uploadToBucket('dokument', fastighetId, file)
      const { error } = await supabase.from('dokument').insert({
        fastighet_id: fastighetId,
        tekniskt_objekt_id: tekniskObjektId,
        dokumenttyp: 'ovrigt',
        namn: file.name,
        storage_path: path,
      })
      if (error) throw error
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Uppladdning misslyckades')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleView(d: Dokument) {
    try {
      const url = await getSignedUrl('dokument', d.storage_path)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunde inte öppna dokumentet')
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Dokument</span>
        {canWrite && (
          <>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="text-[11.5px] font-semibold text-navy hover:text-gold disabled:opacity-60"
            >
              {uploading ? 'Laddar upp…' : '+ Ladda upp'}
            </button>
          </>
        )}
      </div>
      {error && <div className="mb-2 text-[11.5px] text-wine">{error}</div>}
      {dokument.length === 0 ? (
        <div className="text-[12.5px] italic text-muted">Inga dokument uppladdade.</div>
      ) : (
        <ul className="space-y-1.5">
          {dokument.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-[12.5px]">
              <button type="button" onClick={() => handleView(d)} className="text-left text-navy hover:text-gold">
                {d.namn}
              </button>
              <span className="font-mono text-[10.5px] text-muted">
                {DOKUMENTTYP_LABEL[d.dokumenttyp] ?? d.dokumenttyp} · {d.datum}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
