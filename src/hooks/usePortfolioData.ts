import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { sleep } from '../utils/sleep'
import type { Fastighet, Faktura, Objekt, ObjektDrifttillagg } from '../types'

export interface PortfolioData {
  fastigheter: Fastighet[]
  objekt: Objekt[]
  fakturor: Faktura[]
  drifttillagg: ObjektDrifttillagg[]
  loading: boolean
  error: string | null
  reload: () => void
}

const FORSOK = 3
const FORSOK_FORDROJNING_MS = 900

/**
 * Hämtar fastigheter/objekt/fakturor/drifttillägg. RLS-policyerna i Supabase
 * begränsar redan svaret till de fastigheter den inloggade användaren har
 * åtkomst till, så ingen ytterligare filtrering behövs här.
 *
 * Övergående fel (t.ex. "JWT issued at future" som kan hända ett kort
 * ögonblick efter inloggning) försöks tyst igen ett par gånger innan ett
 * fel visas för användaren.
 */
export function usePortfolioData(): PortfolioData {
  const [fastigheter, setFastigheter] = useState<Fastighet[]>([])
  const [objekt, setObjekt] = useState<Objekt[]>([])
  const [fakturor, setFakturor] = useState<Faktura[]>([])
  const [drifttillagg, setDrifttillagg] = useState<ObjektDrifttillagg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    async function run() {
      let result
      for (let forsok = 1; forsok <= FORSOK; forsok++) {
        result = await Promise.all([
          supabase.from('fastigheter').select('*').order('namn'),
          supabase.from('objekt').select('*').order('objektnummer'),
          supabase.from('fakturor').select('*').order('forfallodatum'),
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
        setFastigheter(f.data ?? [])
        setObjekt(o.data ?? [])
        setFakturor(i.data ?? [])
        setDrifttillagg(d.data ?? [])
      }
      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [tick])

  return { fastigheter, objekt, fakturor, drifttillagg, loading, error, reload }
}
