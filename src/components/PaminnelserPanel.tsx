import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Fastighet, Paminnelse } from '../types'

export function PaminnelserPanel({
  paminnelser,
  fastigheter,
  fastighetNamnById,
  canWrite,
  onChanged,
}: {
  paminnelser: Paminnelse[]
  fastigheter: Fastighet[]
  fastighetNamnById: Record<string, string>
  canWrite: (fastighetId: string) => boolean
  onChanged: () => void
}) {
  const skrivbaraFastigheter = fastigheter.filter((f) => canWrite(f.id))
  const [text, setText] = useState('')
  const [datum, setDatum] = useState('')
  const [fastighetId, setFastighetId] = useState(skrivbaraFastigheter[0]?.id ?? '')
  const [saving, setSaving] = useState(false)

  const aktiva = paminnelser.filter((p) => !p.klar)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim() || !fastighetId) return
    setSaving(true)
    const { error } = await supabase.from('paminnelser').insert({
      fastighet_id: fastighetId,
      text: text.trim(),
      paminn_datum: datum || null,
    })
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    setText('')
    setDatum('')
    onChanged()
  }

  async function markeraKlar(id: string) {
    const { error } = await supabase.from('paminnelser').update({ klar: true }).eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  async function taBort(id: string) {
    const { error } = await supabase.from('paminnelser').delete().eq('id', id)
    if (error) {
      alert(error.message)
      return
    }
    onChanged()
  }

  return (
    <div className="mb-3.5 overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-line-soft px-[18px] py-3.5">
        <h4 className="m-0 text-[13.5px] font-bold">Påminnelser</h4>
        <span className="rounded-full bg-[#E7ECF3] px-2 py-0.5 font-mono text-[11px] font-semibold text-navy">
          {aktiva.length} st
        </span>
      </div>

      {aktiva.length === 0 ? (
        <div className="px-[18px] py-4 text-[12.5px] italic text-muted">Inga aktiva påminnelser.</div>
      ) : (
        aktiva.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2.5 border-b border-line-soft px-[18px] py-2.5 text-[13px] last:border-none"
          >
            <div>
              {p.text}
              <div className="mt-0.5 text-[11.5px] text-muted">
                {fastighetNamnById[p.fastighet_id] ?? '—'}
                {p.paminn_datum && <> · {p.paminn_datum}</>}
              </div>
            </div>
            {canWrite(p.fastighet_id) && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => markeraKlar(p.id)}
                  className="whitespace-nowrap rounded-full border border-line px-3 py-1 text-[11.5px] font-semibold text-ink-soft hover:border-navy"
                >
                  Markera klar
                </button>
                <button
                  onClick={() => taBort(p.id)}
                  className="whitespace-nowrap rounded-full border border-line px-3 py-1 text-[11.5px] font-semibold text-ink-soft hover:border-wine hover:text-wine"
                >
                  Ta bort
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {skrivbaraFastigheter.length > 0 && (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2.5 border-t border-line-soft px-[18px] py-3">
          <select value={fastighetId} onChange={(e) => setFastighetId(e.target.value)} className="input !w-40">
            {skrivbaraFastigheter.map((f) => (
              <option key={f.id} value={f.id}>
                {f.namn}
              </option>
            ))}
          </select>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ny påminnelse…"
            className="input flex-1"
          />
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="input !w-40" />
          <button
            type="submit"
            disabled={saving || !text.trim()}
            className="whitespace-nowrap rounded-lg bg-navy px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
          >
            Lägg till
          </button>
        </form>
      )}
    </div>
  )
}
