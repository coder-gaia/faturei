import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User, AuthResponse } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user:            User | null
  profile:         Profile | null
  loading:         boolean
  isAuthenticated: boolean
  hasProfile:      boolean
  signIn:  (email: string, password: string) => Promise<void>
  signUp:  (email: string, password: string) => Promise<AuthResponse['data']>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  console.log('PROFILE:', data)
  console.log('PROFILE ERROR:', error)

  if (error) {
    console.error(error)
    setProfile(null)
    return
  }

  setProfile(data ?? null)
}

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AUTH EVENT:', event)
        console.log('SESSION:', session)

        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
  }
)

  return () => {
    subscription.unsubscribe()
  }
}, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:5173',
      },
    })

    console.log(data)
    console.log(error)

    if (error) throw error

    return data
}

  async function signOut() {
    console.log('logout start')

    const { error } = await supabase.auth.signOut()

    console.log('logout error:', error)

    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      hasProfile: !!profile?.activity_type, // onboarding completo
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}