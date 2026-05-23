/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { User } from '@supabase/supabase-js'

import { supabase } from '../services/supabase'
import type { Profile } from '../types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  hasProfile: boolean

  signIn: (
    email: string,
    password: string
  ) => Promise<void>

  signUp: (
    email: string,
    password: string
  ) => Promise<void>

  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('PROFILE ERROR:', error)
        setProfile(null)
        return
      }

      setProfile(data ?? null)
    } catch (err) {
      console.error('FETCH PROFILE ERROR:', err)
      setProfile(null)
    }
  }

  async function refreshProfile() {
    if (!user) return
    await fetchProfile(user.id)
  }

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        const currentUser = session?.user ?? null

        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('INIT ERROR:', err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return

        const currentUser = session?.user ?? null

        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(
    email: string,
    password: string
  ) {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) throw error
  }

  async function signUp(
    email: string,
    password: string
  ) {
    const { error } =
      await supabase.auth.signUp({
        email,
        password,
      })

    if (error) throw error
  }

  async function signOut() {
    const { error } =
      await supabase.auth.signOut()

    if (error) throw error

    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,

        isAuthenticated: !!user,

        hasProfile:
          !!profile &&
          !!profile.full_name &&
          !!profile.activity_type,

        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth deve ser usado dentro de AuthProvider'
    )
  }

  return ctx
}