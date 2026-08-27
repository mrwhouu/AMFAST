import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { sleep } from '../utils/sleep'
import type { Profile } from '../types'

const FORSOK = 3
const FORSOK_FORDROJNING_MS = 900

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Övergående fel (t.ex. "JWT issued at future" som kan hända ett kort
  // ögonblick direkt efter inloggning) försöks tyst igen innan vi ger upp.
  async function loadProfile(userId: string) {
    let result
    for (let forsok = 1; forsok <= FORSOK; forsok++) {
      result = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!result.error) break
      if (forsok < FORSOK) await sleep(FORSOK_FORDROJNING_MS * forsok)
    }
    if (result?.error) {
      console.error('Kunde inte hämta profil', result.error)
      setProfile(null)
      return
    }
    setProfile(result?.data ?? null)
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth måste användas inom en AuthProvider')
  return ctx
}
