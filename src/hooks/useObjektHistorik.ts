import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { ObjektHistorik } from '../types'

export function useObjektHistorik(objektId: string | null) {
  const [historik, setHistorik] = useState<ObjektHistorik[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!objektId) return
    let active = true
    setLoading(true)
    setError(null)

    supabase
      .from('objekt_historik')
      .select('*')
      .eq('objekt_id', objektId)
      .order('skapad_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else setHistorik(data ?? [])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [objektId])

  return { historik, loading, error }
}
