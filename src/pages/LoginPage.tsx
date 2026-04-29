import * as React from 'react'
import { Link } from 'react-router-dom'
import TextField from '../components/TextField'

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
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h16" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      </div>
      <div className="text-sm font-semibold tracking-wide text-slate-900">
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

  const errors = React.useMemo(() => validate(values), [values])
  const canSubmit = Object.keys(errors).length === 0
  const disabled = !values.identifier.trim() || !values.password

  function onBlur(key: LoginKey) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function onChange(key: LoginKey, next: string) {
    setValues((v) => ({ ...v, [key]: next }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTouched({ identifier: true, password: true })
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
        {/* LEFT */}
        <div className="relative bg-white">
          <div className="px-8 pt-8">
            <LogoMark />
          </div>

          <div className="flex min-h-dvh items-center justify-center px-6 py-16">
            <div className="w-full max-w-[360px]">
              <div className="mb-8 space-y-2 text-slate-600">
                <p className="text-sm">Building Room Reservations</p>
                <p className="text-sm">Access your workspace environment</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M4 6h16v12H4z" />
                      <path d="M4 7l8 6 8-6" />
                    </svg>
                  }
                />

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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path d="M7 11V8a5 5 0 0110 0v3" />
                      <path d="M6 11h12v10H6z" />
                    </svg>
                  }
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="grid h-9 w-9 place-items-center rounded-md text-slate-500 transition hover:bg-slate-200/70 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-600/15"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 102.8 2.8" />
                          <path d="M9.9 5.1A10.9 10.9 0 0112 5c7 0 10 7 10 7a18.7 18.7 0 01-4 5.2" />
                          <path d="M6.2 6.2A18.7 18.7 0 002 12s3 7 10 7a10.9 10.9 0 005.2-1.3" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                          <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                      )}
                    </button>
                  }
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-4 focus:ring-sky-600/20"
                    />
                    Remember me
                  </label>

                  <a
                    href="#"
                    className="text-sm font-medium text-sky-800 underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-sky-600/15"
                  >
                    Forgot Password?
                  </a>
                </div>

                {submitted && !canSubmit ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    Email/NIM atau password tidak valid.
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={disabled}
                  className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-800 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-600/20 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Login
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4.5 w-4.5"
                    aria-hidden="true"
                  >
                    <path d="M5 12h12" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </button>

                <p className="pt-6 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-sky-800 underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-sky-600/15"
                  >
                    Register
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-950 via-sky-900 to-blue-900" />
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%),radial-gradient(circle_at_75%_65%,rgba(255,255,255,0.18),transparent_55%)]" />
          </div>

          <div className="relative flex h-full items-center px-16">
            <div className="max-w-xl">
              <h2 className="text-[52px] font-medium leading-[1.05] tracking-tight text-white">
                Smart room reservation for your campus.
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-6 text-white/75">
                TEKSPACE menyediakan sistem reservasi ruangan berbasis web dengan
                informasi ketersediaan real-time untuk mendukung aktivitas akademik
                yang lebih efisien dan terstruktur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

