import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Besiktning, Dokument, Garanti, UnderhallAtgard } from '../types'

/** Allt kopplat till ett enskilt tekniskt objekt: dokument, underhåll, besiktningar, garantier. */
export function useTekniskObjektDetalj(tekniskObjektId: string | null) {
  const [dokument, setDokument] = useState<Dokument[]>([])
  const [underhall, setUnderhall] = useState<UnderhallAtgard[]>([])
  const [besiktningar, setBesiktningar] = useState<Besiktning[]>([])
  const [garantier, setGarantier] = useState<Garanti[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!tekniskObjektId) return
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      supabase.from('dokument').select('*').eq('tekniskt_objekt_id', tekniskObjektId).order('datum', { ascending: false }),
      supabase
        .from('underhall_atgarder')
        .select('*')
        .eq('tekniskt_objekt_id', tekniskObjektId)
        .order('planerat_datum', { ascending: false, nullsFirst: false }),
      supabase
        .from('besiktningar')
        .select('*')
        .eq('tekniskt_objekt_id', tekniskObjektId)
        .order('forfallodatum', { ascending: false, nullsFirst: false }),
      supabase.from('garantier').select('*').eq('tekniskt_objekt_id', tekniskObjektId).order('created_at', { ascending: false }),
    ]).then(([d, u, b, g]) => {
      if (!active) return
      const err = d.error || u.error || b.error || g.error
      if (err) {
        setError(err.message)
      } else {
        setDokument(d.data ?? [])
        setUnderhall(u.data ?? [])
        setBesiktningar(b.data ?? [])
        setGarantier(g.data ?? [])
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [tekniskObjektId, tick])

  return { dokument, underhall, besiktningar, garantier, loading, error, reload }
}
