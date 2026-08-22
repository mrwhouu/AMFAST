import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Fastighet, Faktura, Objekt, ObjektDrifttillagg } from '../types'

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

    Promise.all([
      supabase.from('fastigheter').select('*').eq('id', id).maybeSingle(),
      supabase.from('objekt').select('*').eq('fastighet_id', id).order('objektnummer'),
      supabase.from('fakturor').select('*').eq('fastighet_id', id).order('forfallodatum'),
      supabase.from('objekt_drifttillagg').select('*'),
    ]).then(([f, o, i, d]) => {
      if (!active) return
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
    })

    return () => {
      active = false
    }
  }, [id, tick])

  return { fastighet, objekt, fakturor, drifttillagg, loading, error, reload }
}
