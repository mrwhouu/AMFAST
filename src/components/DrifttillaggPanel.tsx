import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ObjektDrifttillagg } from '../types'
import { fmt } from '../utils/format'

export function DrifttillaggPanel({
  objektId,
  rader,
  canEdit,
  onChanged,
}: {
  objektId: string
  rader: ObjektDrifttillagg[]
  canEdit: boolean
  onChanged: () => void
}) {
  const [typ, setTyp] = useState('')
  const [belopp, setBelopp] = useState('')
  const [indexklausul, setIndexklausul] = useState(false)
  const [saving, setSaving] = useState(false)

  async function addRad(e: FormEvent) {
    e.preventDefault()
    if (!typ || !belopp) return
    setSaving(true)
    const { error } = await supabase.from('objekt_drifttillagg').insert({
      objekt_id: objektId,
      typ,
      belopp_ar: Number(belopp) || 0,
      indexklausul,
    })
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    setTyp('')
    setBelopp('')
    setIndexklausul(false)
    onChanged()
  }

  async function removeRad(id: string) {
    const { error } = await supabase.from('objekt_drifttillagg').delete().eq('id', id)
    if (error) alert(error.message)
    else onChanged()
  }

  return (
    <div className="bg-surface-sunken px-4 py-3">
      {rader.length === 0 ? (
        <div className="mb-2 text-[12px] italic text-muted">Inga drifttillägg registrerade.</div>
      ) : (
        <div className="mb-2 space-y-1">
          {rader.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-[12.5px]">
              <span>
                {r.typ}
                {r.indexklausul && (
                  <span className="ml-1.5 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold">
                    index
                  </span>
                )}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono">{fmt(r.belopp_ar)} kr/år</span>
                {canEdit && (
                  <button onClick={() => removeRad(r.id)} className="text-[11px] font-semibold text-wine hover:text-wine/70">
                    Ta bort
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <form onSubmit={addRad} className="flex flex-wrap items-center gap-2 border-t border-line-soft pt-2.5">
          <input
            value={typ}
            onChange={(e) => setTyp(e.target.value)}
            placeholder="Typ (t.ex. Värme)"
            className="input !w-auto flex-1 min-w-[120px]"
          />
          <input
            type="number"
            value={belopp}
            onChange={(e) => setBelopp(e.target.value)}
            placeholder="Kr/år"
            className="input !w-24"
          />
          <label className="flex items-center gap-1.5 text-[11.5px] text-ink-soft">
            <input type="checkbox" checked={indexklausul} onChange={(e) => setIndexklausul(e.target.checked)} />
            Indexklausul
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-navy px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            Lägg till
          </button>
        </form>
      )}
    </div>
  )
}
