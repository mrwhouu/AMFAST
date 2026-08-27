import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { sleep } from '../utils/sleep'
import type { Faktura, FakturaRad, Fastighet, Objekt } from '../types'

const FORSOK = 3
const FORSOK_FORDROJNING_MS = 900

export function useFakturaDetalj(id: string | undefined) {
  const [faktura, setFaktura] = useState<Faktura | null>(null)
  const [rader, setRader] = useState<FakturaRad[]>([])
  const [fastighet, setFastighet] = useState<Fastighet | null>(null)
  const [objektById, setObjektById] = useState<Record<string, Objekt>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    setError(null)

    async function run() {
      let fakturaResult
      for (let forsok = 1; forsok <= FORSOK; forsok++) {
        fakturaResult = await supabase.from('fakturor').select('*').eq('id', id as string).maybeSingle()
        if (!fakturaResult.error) break
        if (forsok < FORSOK) await sleep(FORSOK_FORDROJNING_MS * forsok)
      }
      if (!active || !fakturaResult) return
      if (fakturaResult.error || !fakturaResult.data) {
        setError(fakturaResult.error?.message ?? 'Fakturan hittades inte')
        setLoading(false)
        return
      }

      const [raderResult, fastighetResult] = await Promise.all([
        supabase.from('faktura_rader').select('*').eq('faktura_id', id as string).order('skapad_at'),
        supabase.from('fastigheter').select('*').eq('id', fakturaResult.data.fastighet_id).maybeSingle(),
      ])
      if (!active) return

      const err = raderResult.error || fastighetResult.error
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const objektIds = [...new Set((raderResult.data ?? []).map((r) => r.objekt_id).filter((v): v is string => !!v))]
      let objektResult: { data: Objekt[] | null; error: unknown } = { data: [], error: null }
      if (objektIds.length > 0) {
        objektResult = await supabase.from('objekt').select('*').in('id', objektIds)
      }
      if (!active) return

      setFaktura(fakturaResult.data)
      setRader(raderResult.data ?? [])
      setFastighet(fastighetResult.data)
      setObjektById(Object.fromEntries((objektResult.data ?? []).map((o) => [o.id, o])))
      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [id, tick])

  return { faktura, rader, fastighet, objektById, loading, error, reload }
}
