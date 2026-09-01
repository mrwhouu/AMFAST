import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'

export interface FakturaBulkEntry {
  faktura: Faktura
  rader: FakturaRad[]
  fastighet: Fastighet
}

/** Laddar flera fakturor (för samlingsutskrift) i den ordning id:na anges. `idsKey` är en kommaseparerad sträng av faktura-id:n. */
export function useFakturorBulk(idsKey: string) {
  const [entries, setEntries] = useState<FakturaBulkEntry[]>([])
  const [objektById, setObjektById] = useState<Record<string, Objekt>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ids = idsKey.split(',').filter(Boolean)
    if (ids.length === 0) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError(null)

    async function run() {
      const [fakturorResult, raderResult] = await Promise.all([
        supabase.from('fakturor').select('*').in('id', ids),
        supabase.from('faktura_rader').select('*').in('faktura_id', ids).order('skapad_at'),
      ])
      if (!active) return
      if (fakturorResult.error || raderResult.error) {
        setError((fakturorResult.error ?? raderResult.error)?.message ?? 'Okänt fel')
        setLoading(false)
        return
      }

      const fastighetIds = [...new Set((fakturorResult.data ?? []).map((f) => f.fastighet_id))]
      const objektIds = [
        ...new Set((raderResult.data ?? []).map((r) => r.objekt_id).filter((v): v is string => !!v)),
      ]
      const [fastighetResult, objektResult] = await Promise.all([
        supabase.from('fastigheter').select('*').in('id', fastighetIds),
        objektIds.length > 0
          ? supabase.from('objekt').select('*').in('id', objektIds)
          : Promise.resolve({ data: [] as Objekt[], error: null }),
      ])
      if (!active) return
      if (fastighetResult.error || objektResult.error) {
        setError((fastighetResult.error ?? objektResult.error)?.message ?? 'Okänt fel')
        setLoading(false)
        return
      }

      const fastighetById = Object.fromEntries((fastighetResult.data ?? []).map((f) => [f.id, f]))
      const raderByFaktura = new Map<string, FakturaRad[]>()
      for (const r of raderResult.data ?? []) {
        if (!raderByFaktura.has(r.faktura_id)) raderByFaktura.set(r.faktura_id, [])
        raderByFaktura.get(r.faktura_id)!.push(r)
      }

      const byId = new Map((fakturorResult.data ?? []).map((f) => [f.id, f]))
      const ordered = ids
        .map((id) => byId.get(id))
        .filter((f): f is Faktura => !!f)
        .map((faktura) => ({
          faktura,
          rader: raderByFaktura.get(faktura.id) ?? [],
          fastighet: fastighetById[faktura.fastighet_id],
        }))
        .filter((e): e is FakturaBulkEntry => !!e.fastighet)

      setEntries(ordered)
      setObjektById(Object.fromEntries((objektResult.data ?? []).map((o) => [o.id, o])))
      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [idsKey])

  return { entries, objektById, loading, error }
}
