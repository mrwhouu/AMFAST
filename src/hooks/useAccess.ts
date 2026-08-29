import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

/** Ger en canWrite(fastighetId)-funktion baserat på roll + anvandare_fastighet. */
export function useAccess() {
  const { profile } = useAuth()
  const [writeIds, setWriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!profile) return
    if (profile.role === 'admin') return // admin har alltid write, ingen uppslagning behövs
    supabase
      .from('anvandare_fastighet')
      .select('fastighet_id, behorighet')
      .eq('behorighet', 'write')
      .then(({ data }) => {
        setWriteIds(new Set((data ?? []).map((r) => r.fastighet_id)))
      })
  }, [profile])

  function canWrite(fastighetId: string) {
    if (profile?.role === 'admin') return true
    if (profile?.role !== 'forvaltare' && profile?.role !== 'drifttekniker') return false
    return writeIds.has(fastighetId)
  }

  const hasAnyWrite =
    profile?.role === 'admin' ||
    ((profile?.role === 'forvaltare' || profile?.role === 'drifttekniker') && writeIds.size > 0)

  return { canWrite, isAdmin: profile?.role === 'admin', hasAnyWrite }
}
