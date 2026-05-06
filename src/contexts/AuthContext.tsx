import * as React from 'react'
import { supabase } from '../lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'user'

export type AuthState = {
  session: Session | null
  user: User | null
  role: AppRole | null
  fullName: string | null
  dbUserId: number | null
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

const INITIAL_STATE: AuthState = {
  session: null,
  user: null,
  role: null,
  fullName: null,
  dbUserId: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>(INITIAL_STATE)

  function normalizeRole(raw: unknown): AppRole | null {
    if (typeof raw !== 'string') return null
    const normalized = raw.toLowerCase()
    if (normalized === 'admin' || normalized === 'system admin') return 'admin'
    if (normalized === 'user' || normalized === 'mahasiswa' || normalized === 'student') return 'user'
    return null
  }

  async function fetchProfile(userId: string, email: string) {
    const [accountResult, userResult] = await Promise.all([
      supabase.from('accounts').select('role, full_name').eq('user_id', userId).single(),
      supabase.from('users').select('user_id').eq('email', email).maybeSingle(),
    ])

    const { data: accountData, error: accountError } = accountResult
    const { data: userData } = userResult

    if (accountError || !accountData) {
      console.warn('Profile not found / RLS blocked:', accountError?.message)
      return { role: null, fullName: null, dbUserId: null }
    }

    return {
      role: normalizeRole(accountData.role),
      fullName: typeof accountData.full_name === 'string' ? accountData.full_name : null,
      dbUserId: (userData?.user_id as number) ?? null,
    }
  }

  const requestIdRef = React.useRef(0)

  async function handleSession(session: Session | null) {
    const requestId = ++requestIdRef.current
    if (session?.user) {
      const profile = await fetchProfile(session.user.id, session.user.email ?? '')

      if (requestId !== requestIdRef.current) return

      if (!profile.role) {
        setState({
          session,
          user: session.user,
          role: null,
          fullName: profile.fullName,
          dbUserId: null,
          isAuthenticated: false,
          isLoading: false,
          authError: 'Akun belum memiliki profil atau akses diblokir (RLS). Hubungi admin.',
        })
        return
      }

      setState({
        session,
        user: session.user,
        role: profile.role,
        fullName: profile.fullName,
        dbUserId: profile.dbUserId,
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
        dbUserId: null,
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })

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
      dbUserId: null,
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
