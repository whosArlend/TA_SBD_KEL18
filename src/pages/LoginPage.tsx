import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TextField from '../components/TextField'
import { supabase } from '../lib/supabase'

type LoginKey = 'identifier' | 'password'
type LoginState = Record<LoginKey, string>
type TouchedState = Record<LoginKey, boolean>
type LoginErrors = Partial<Record<LoginKey, string>>

const initialState: LoginState = {
  identifier: '',
  password: '',
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function validate(values: LoginState): LoginErrors {
  const errors: LoginErrors = {}

  if (!values.identifier.trim()) {
    errors.identifier = 'Email / User ID wajib diisi.'
  } else {
    const id = values.identifier.trim()
    const looksLikeNim = /^\d{6,}$/.test(id)
    const looksLikeEmail = isEmail(id)
    if (!looksLikeNim && !looksLikeEmail) {
      errors.identifier = 'Masukkan email yang valid atau NIM/NIP (angka).'
    }
  }

  if (!values.password) errors.password = 'Password wajib diisi.'
  else if (values.password.length < 6) errors.password = 'Password terlalu pendek.'

  return errors
}

function fieldStatus(
  key: LoginKey,
  touched: TouchedState,
  errors: LoginErrors,
  values: LoginState,
) {
  if (!touched[key]) return 'idle' as const
  if (errors[key]) return 'error' as const
  if (values[key].trim()) return 'success' as const
  return 'idle' as const
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-800 text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h16" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      </div>
      <div className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
        TEKSPACE
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [values, setValues] = React.useState<LoginState>(initialState)
  const [touched, setTouched] = React.useState<TouchedState>({
    identifier: false,
    password: false,
  })
  const [submitted, setSubmitted] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [apiError, setApiError] = React.useState<string | null>(null)

  const navigate = useNavigate()

  const errors = React.useMemo(() => validate(values), [values])
  const canSubmit = Object.keys(errors).length === 0
  const disabled = !values.identifier.trim() || !values.password

  function onBlur(key: LoginKey) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function onChange(key: LoginKey, next: string) {
    setValues((v) => ({ ...v, [key]: next }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setApiError(null)
    setTouched({ identifier: true, password: true })

    if (!canSubmit) return

    setLoading(true)
    try {
      const identifier = values.identifier.trim()
      const isEmailInput = isEmail(identifier)

      // For now, only email login is supported
      if (!isEmailInput) {
        setApiError('Silakan gunakan email untuk login.')
        return
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: values.password,
      })

      if (authError) {
        const msg =
          authError.message === 'Invalid login credentials'
            ? 'Email atau password salah.'
            : authError.message === 'Email not confirmed'
              ? 'Email belum diverifikasi. Cek inbox email kamu.'
              : authError.message
        setApiError(msg)
        return
      }

      if (!authData.user) {
        setApiError('Login gagal. Silakan coba lagi.')
        return
      }

      // Fetch role from accounts table
      const { data: profile } = await supabase
        .from('accounts')
        .select('role, full_name')
        .eq('user_id', authData.user.id)
        .single()

      const role = profile?.role ?? 'mahasiswa'
      const isAdmin = role === 'admin'

      navigate(isAdmin ? '/admin-dashboard' : '/user-dashboard')
    } catch (err) {
      setApiError('Terjadi kesalahan jaringan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen w-full">

        {/* LEFT: FORM */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 lg:p-16">
          <LogoMark />

          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-[400px]">

              <div className="mb-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Login
                </h1>
                <p className="text-slate-500 text-sm">
                  Building Room Reservations
                </p>
                <p className="text-slate-500 text-sm">
                  Access your workspace environment
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">

                {/* IDENTIFIER */}
                <TextField
                  id="identifier"
                  label="EMAIL / USER ID (NIM/NIP)"
                  placeholder="name@company.com"
                  value={values.identifier}
                  onChange={(v) => onChange('identifier', v)}
                  onBlur={() => onBlur('identifier')}
                  autoComplete="username"
                  required
                  variant="filled"
                  status={fieldStatus('identifier', touched, errors, values)}
                  message={touched.identifier ? errors.identifier : undefined}
                  leftIcon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-400">
                      <path d="M20 21a8 8 0 10-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />

                {/* PASSWORD */}
                <TextField
                  id="password"
                  label="PASSWORD"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(v) => onChange('password', v)}
                  onBlur={() => onBlur('password')}
                  autoComplete="current-password"
                  required
                  variant="filled"
                  status={fieldStatus('password', touched, errors, values)}
                  message={touched.password ? errors.password : undefined}
                  leftIcon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-400">
                      <path d="M7 11V8a5 5 0 0110 0v3" />
                      <path d="M6 11h12v10H6z" />
                    </svg>
                  }
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="p-2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  }
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-sky-800"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-sky-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {apiError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {apiError}
                  </div>
                )}

                {submitted && !canSubmit && !apiError && (
                  <div className="text-sm text-red-500">
                    Email/NIM atau password tidak valid.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={disabled || loading}
                  className="w-full h-12 bg-sky-800 text-white rounded-lg font-bold shadow-md hover:bg-sky-900 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Masuk...' : <>Login <span className="text-lg">→</span></>}
                </button>

                <p className="text-center text-slate-600 text-sm pt-4">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-sky-800 hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT: HERO */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sky-950 via-sky-900 to-blue-900 relative items-center px-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />

          <div className="relative z-10">
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Smart room reservation for your campus.
            </h2>
            <p className="text-white/75 text-lg leading-relaxed max-w-md">
              TEKSPACE menyediakan sistem reservasi ruangan berbasis web dengan
              informasi ketersediaan real-time untuk mendukung aktivitas
              akademik yang lebih efisien dan terstruktur.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}