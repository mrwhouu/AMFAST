import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { IndexSerie } from '../types'

export function useIndexSerier() {
  const [serier, setSerier] = useState<IndexSerie[]>([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    setLoading(true)
    supabase
      .from('index_serier')
      .select('*')
      .order('ar', { ascending: false })
      .then(({ data }) => {
        setSerier(data ?? [])
        setLoading(false)
      })
  }, [tick])

  return { serier, loading, reload }
}
