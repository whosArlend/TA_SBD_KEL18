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
  signIn: (email: string, password: string) => Promise<{ error?: string }>
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

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('role, full_name')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.warn('Profile not found / RLS blocked:', error?.message)
      return { role: null, fullName: null }
    }

    return {
      role: data.role as AppRole,
      fullName: data.full_name as string,
    }
  }

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

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!ignore) handleSession(session)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!ignore) handleSession(session)
      })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

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
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}