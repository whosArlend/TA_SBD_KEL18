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
  authError: string | null
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
    authError: null,
  })

  function normalizeRole(raw: unknown): AppRole | null {
    if (raw === 'admin') return 'admin'
    if (raw === 'user') return 'user'
    if (raw === 'mahasiswa' || raw === 'student') return 'user'
    return null
  }

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
      role: normalizeRole(data.role),
      fullName: typeof data.full_name === 'string' ? data.full_name : null,
    }
  }

  const requestIdRef = React.useRef(0)

  async function handleSession(session: Session | null) {
    const requestId = ++requestIdRef.current
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)

      if (requestId !== requestIdRef.current) return

      // If profile can't be loaded, fail closed (safer than guessing a role).
      if (!profile.role) {
        setState({
          session,
          user: session.user,
          role: null,
          fullName: profile.fullName,
          isAuthenticated: false,
          isLoading: false,
          authError:
            'Akun belum memiliki profil atau akses diblokir (RLS). Hubungi admin.',
        })
        return
      }

      setState({
        session,
        user: session.user,
        role: profile.role,
        fullName: profile.fullName,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      })
    } else {
      if (requestId !== requestIdRef.current) return
      setState({
        session: null,
        user: null,
        role: null,
        fullName: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
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
    setState((s) => ({ ...s, isLoading: true, authError: null }))
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState((s) => ({ ...s, isLoading: false, authError: error.message }))
      return { error: error.message }
    }

    const { data } = await supabase.auth.getSession()
    await handleSession(data.session)
    return {}
  }

  async function signOut() {
    await supabase.auth.signOut()
    requestIdRef.current++
    setState({
      session: null,
      user: null,
      role: null,
      fullName: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    })
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}