import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Ritning, RitningTyp } from '../types'
import { getSignedUrl, uploadToBucket } from '../utils/storage'

const TYP_LABEL: Record<RitningTyp, string> = {
  pdf: 'PDF',
  dwg: 'DWG',
  bim: 'BIM',
  '3d_modell': '3D-modell',
  point_cloud: 'Point cloud',
  ovrigt: 'Övrigt',
}

/**
 * Ritningar kopplade till en viss nivå (våningsplan eller byggnad). Visning
 * sker via en tidsbegränsad länk i webbläsarens inbyggda PDF-visare —
 * en avancerad ritningsvisare med zoom/mätning/kalibrering (se
 * `ritningar.skala_kalibrering`) är ett senare steg ovanpå den här listan.
 */
export function RitningarList({
  fastighetId,
  byggnadId,
  vaningsplanId,
  ritningar,
  canWrite,
  onChanged,
}: {
  fastighetId: string
  byggnadId?: string
  vaningsplanId?: string
  ritningar: Ritning[]
  canWrite: boolean
  onChanged: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const relevanta = ritningar.filter((r) =>
    vaningsplanId ? r.vaningsplan_id === vaningsplanId : byggnadId ? r.byggnad_id === byggnadId && !r.vaningsplan_id : false,
  )

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const path = await uploadToBucket('ritningar', fastighetId, file)
      const typ: RitningTyp = /\.dwg$/i.test(file.name) ? 'dwg' : /\.pdf$/i.test(file.name) ? 'pdf' : 'ovrigt'
      const { error } = await supabase.from('ritningar').insert({
        fastighet_id: fastighetId,
        byggnad_id: byggnadId ?? null,
        vaningsplan_id: vaningsplanId ?? null,
        namn: file.name,
        typ,
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

  async function handleView(r: Ritning) {
    try {
      const url = await getSignedUrl('ritningar', r.storage_path)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Kunde inte öppna ritningen')
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-line-soft bg-surface-sunken px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ritningar</span>
        {canWrite && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.dwg"
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
      {error && <div className="mb-1.5 text-[11.5px] text-wine">{error}</div>}
      {relevanta.length === 0 ? (
        <div className="text-[12px] italic text-muted">Inga ritningar uppladdade.</div>
      ) : (
        <ul className="space-y-1">
          {relevanta.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-[12.5px]">
              <button type="button" onClick={() => handleView(r)} className="text-left text-navy hover:text-gold">
                {r.namn}
              </button>
              <span className="font-mono text-[10.5px] text-muted">
                {TYP_LABEL[r.typ]} · v{r.version}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
