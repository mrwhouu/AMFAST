import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { AnvandareFastighet, Fastighet, Profile } from '../types'

export function useAdminData() {
  const [fastigheter, setFastigheter] = useState<Fastighet[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [access, setAccess] = useState<AnvandareFastighet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([
      supabase.from('fastigheter').select('*').order('namn'),
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('anvandare_fastighet').select('*'),
    ]).then(([f, p, a]) => {
      if (!active) return
      const err = f.error || p.error || a.error
      if (err) {
        setError(err.message)
      } else {
        setFastigheter(f.data ?? [])
        setProfiles(p.data ?? [])
        setAccess(a.data ?? [])
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [tick])

  return { fastigheter, profiles, access, loading, error, reload }
}
