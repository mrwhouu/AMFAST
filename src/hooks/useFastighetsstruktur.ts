import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Byggnad, Ritning, TekniskObjekt, Vaningsplan } from '../types'

/**
 * Byggnad/våningsplan-hierarkin och ritningar för en fastighet. Lokaler
 * (`objekt`) laddas separat i useFastighetData — den här hooken lägger bara
 * till nivåerna ovanför/under den.
 */
export function useFastighetsstruktur(fastighetId: string | undefined) {
  const [byggnader, setByggnader] = useState<Byggnad[]>([])
  const [vaningsplan, setVaningsplan] = useState<Vaningsplan[]>([])
  const [ritningar, setRitningar] = useState<Ritning[]>([])
  const [tekniskaObjekt, setTekniskaObjekt] = useState<TekniskObjekt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!fastighetId) return
    let active = true
    setLoading(true)
    setError(null)

    async function run() {
      const [b, r, t] = await Promise.all([
        supabase.from('byggnader').select('*').eq('fastighet_id', fastighetId as string).order('ordning'),
        supabase.from('ritningar').select('*').eq('fastighet_id', fastighetId as string).order('created_at', { ascending: false }),
        supabase.from('tekniska_objekt').select('*').eq('fastighet_id', fastighetId as string).order('namn'),
      ])
      if (!active) return

      const err = b.error || r.error || t.error
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      setByggnader(b.data ?? [])
      setRitningar(r.data ?? [])
      setTekniskaObjekt(t.data ?? [])

      const byggnadIds = (b.data ?? []).map((row) => row.id)
      if (byggnadIds.length === 0) {
        setVaningsplan([])
        setLoading(false)
        return
      }

      const v = await supabase.from('vaningsplan').select('*').in('byggnad_id', byggnadIds).order('plannummer')
      if (!active) return
      if (v.error) setError(v.error.message)
      else setVaningsplan(v.data ?? [])
      setLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [fastighetId, tick])

  return { byggnader, vaningsplan, ritningar, tekniskaObjekt, loading, error, reload }
}
