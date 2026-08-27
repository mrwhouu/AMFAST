import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { sleep } from '../utils/sleep'
import type { Fastighet, Faktura, Objekt, ObjektDrifttillagg } from '../types'

const FORSOK = 3
const FORSOK_FORDROJNING_MS = 900

/**
 * Övergående fel (t.ex. "JWT issued at future" som kan hända ett kort
 * ögonblick efter inloggning) försöks tyst igen ett par gånger innan ett
 * fel visas för användaren.
 */
export function useFastighetData(id: string | undefined) {
  const [fastighet, setFastighet] = useState<Fastighet | null>(null)
  const [objekt, setObjekt] = useState<Objekt[]>([])
  const [fakturor, setFakturor] = useState<Faktura[]>([])
  const [drifttillagg, setDrifttillagg] = useState<ObjektDrifttillagg[]>([])
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
      let result
      for (let forsok = 1; forsok <= FORSOK; forsok++) {
        result = await Promise.all([
          supabase.from('fastigheter').select('*').eq('id', id as string).maybeSingle(),
          supabase.from('objekt').select('*').eq('fastighet_id', id as string).order('objektnummer'),
          supabase.from('fakturor').select('*').eq('fastighet_id', id as string).order('forfallodatum'),
          supabase.from('objekt_drifttillagg').select('*'),
        ])
        const err = result[0].error || result[1].error || result[2].error || result[3].error
        if (!err) break
        if (forsok < FORSOK) await sleep(FORSOK_FORDROJNING_MS * forsok)
      }
      if (!active || !result) return

      const [f, o, i, d] = result
      const err = f.error || o.error || i.error || d.error
      if (err) {
        setError(err.message)
      } else {
        setFastighet(f.data)
        setObjekt(o.data ?? [])
        setFakturor(i.data ?? [])
        const objektIds = new Set((o.data ?? []).map((row) => row.id))
        setDrifttillagg((d.data ?? []).filter((row) => objektIds.has(row.objekt_id)))
      }
      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [id, tick])

  return { fastighet, objekt, fakturor, drifttillagg, loading, error, reload }
}
