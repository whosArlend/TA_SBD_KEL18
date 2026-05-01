import * as React from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'user'

export type AuthState = {
  session: Session | null
  user: User | null
  role: AppRole | null
  fullName: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthContextType = AuthState & {
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    session: null,
    user: null,
    role: null,
    fullName: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Fetch the user's role & name from `accounts` table
  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('role, full_name')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        console.warn('fetchProfile: no profile found or RLS blocked -', error?.message)
        return { role: null as AppRole | null, fullName: null as string | null }
      }

      return {
        role: data.role as AppRole,
        fullName: data.full_name as string,
      }
    } catch (err) {
      console.error('fetchProfile: unexpected error', err)
      return { role: null as AppRole | null, fullName: null as string | null }
    }
  }

  // Helper to set authenticated state from a session
  async function handleSession(session: Session | null) {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      setState({
        session,
        user: session.user,
        role: profile.role,
        fullName: profile.fullName,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      setState({
        session: null,
        user: null,
        role: null,
        fullName: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  React.useEffect(() => {
    let ignore = false

    // 1. Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ignore) handleSession(session)
    }).catch(() => {
      if (!ignore) setState((s) => ({ ...s, isLoading: false }))
    })

    // 2. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ignore) handleSession(session)
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    setState({
      session: null,
      user: null,
      role: null,
      fullName: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
