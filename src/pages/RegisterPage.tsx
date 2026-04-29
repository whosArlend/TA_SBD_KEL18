import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TextField from '../components/TextField'

type FieldKey = 'fullName' | 'nid' | 'email' | 'password' | 'confirmPassword'

type FormState = Record<FieldKey, string>
type TouchedState = Record<FieldKey, boolean>
type FormErrors = Partial<Record<FieldKey, string>>

const initialState: FormState = {
  fullName: '',
  nid: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function hasSpecialChar(value: string) {
  return /[^A-Za-z0-9]/.test(value)
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}

  if (!values.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.'

  if (!values.nid.trim()) errors.nid = 'Nomor Induk wajib diisi.'
  else if (!/^\d{6,}$/.test(values.nid.trim()))
    errors.nid = 'Nomor Induk harus berupa angka (minimal 6 digit).'

  if (!values.email.trim()) errors.email = 'Email wajib diisi.'
  else if (!isEmail(values.email)) errors.email = 'Format email tidak valid.'

  if (!values.password) errors.password = 'Password wajib diisi.'
  else if (values.password.length < 8)
    errors.password = 'Minimal 8 karakter.'
  else if (!hasSpecialChar(values.password))
    errors.password = 'Tambahkan 1 karakter spesial (contoh: !@#).'

  if (!values.confirmPassword) errors.confirmPassword = 'Konfirmasi password wajib diisi.'
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Password tidak sama.'

  return errors
}

function fieldStatus(
  key: FieldKey,
  touched: TouchedState,
  errors: FormErrors,
  values: FormState,
) {
  if (!touched[key]) return 'idle' as const
  if (errors[key]) return 'error' as const
  if (values[key].trim()) return 'success' as const
  return 'idle' as const
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-700 text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M4 12l8-8 8 8-8 8-8-8z" />
        </svg>
      </div>
      <div className="text-sm font-semibold tracking-wide text-slate-900">
        TEKSPACE
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  icon,
}: {
  title: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 shadow-sm ring-1 ring-white/15 backdrop-blur">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15">
        {icon}
      </div>
      <div className="text-sm font-semibold text-white/90">{title}</div>
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate() // 2. Deklarasi navigate

  const [values, setValues] = React.useState<FormState>(initialState)
  const [touched, setTouched] = React.useState<TouchedState>({
    fullName: false,
    nid: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [submitted, setSubmitted] = React.useState(false)

  const errors = React.useMemo(() => validate(values), [values])
  const canSubmit = Object.keys(errors).length === 0

  function onBlur(key: FieldKey) {
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function onChange(key: FieldKey, next: string) {
    setValues((v) => ({ ...v, [key]: next }))
  }

function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setTouched({
      fullName: true,
      nid: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (canSubmit) {
      // 1. Simpan nama ke memori browser sebelum pindah halaman
      localStorage.setItem('userName', values.fullName)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="grid min-h-dvh w-full grid-cols-1 lg:grid-cols-2">
        {/* LEFT: FORM */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[430px]">
            <div className="mb-10">
              <LogoMark />
            </div>

            <div className="mb-10 space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-[44px] sm:leading-[1.05]">
                Register
              </h1>
              <p className="max-w-sm text-[15px] leading-6 text-slate-600">
                Daftar untuk memudahkan reservasi ruang kampus dan koordinasi
                jadwal.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <TextField
                id="fullName"
                label="FULL NAME"
                placeholder="Masukkan nama lengkap"
                value={values.fullName}
                onChange={(v) => onChange('fullName', v)}
                onBlur={() => onBlur('fullName')}
                autoComplete="name"
                required
                status={fieldStatus('fullName', touched, errors, values)}
                message={touched.fullName ? errors.fullName : undefined}
                leftIcon={
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 18.794A10 10 0 0110 12c3.055 0 5.804 1.365 7.542 3.53.19.238.267.55.21.85-.06.3-.25.556-.52.702A12.007 12.007 0 0110 20a12.007 12.007 0 01-7.17-2.218.999.999 0 01-.372-1.0z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />

              <TextField
                id="nim"
                label="USER ID (NIM/NIP)"
                placeholder="Contoh: 23123456"
                value={values.nid}
                onChange={(v) => onChange('nid', v.replace(/[^\d]/g, ''))}
                onBlur={() => onBlur('nid')}
                autoComplete="off"
                inputMode="numeric"
                required
                status={fieldStatus('nid', touched, errors, values)}
                message={touched.nid ? errors.nid : undefined}
                leftIcon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M7 7h10v10H7z" />
                    <path d="M7 3v4M17 3v4M7 17v4M17 17v4" />
                  </svg>
                }
              />

              <TextField
                id="email"
                label="EMAIL ADDRESS"
                type="email"
                placeholder="nama@kampus.ac.id"
                value={values.email}
                onChange={(v) => onChange('email', v)}
                onBlur={() => onBlur('email')}
                autoComplete="email"
                required
                status={fieldStatus('email', touched, errors, values)}
                message={touched.email ? errors.email : undefined}
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
                type="password"
                placeholder="••••••••"
                value={values.password}
                onChange={(v) => onChange('password', v)}
                onBlur={() => onBlur('password')}
                autoComplete="new-password"
                required
                hint="Minimal 8 karakter dan 1 karakter spesial."
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
              />

              <TextField
                id="confirmPassword"
                label="CONFIRM PASSWORD"
                type="password"
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={(v) => onChange('confirmPassword', v)}
                onBlur={() => onBlur('confirmPassword')}
                autoComplete="new-password"
                required
                status={fieldStatus('confirmPassword', touched, errors, values)}
                message={
                  touched.confirmPassword ? errors.confirmPassword : undefined
                }
                leftIcon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <path d="M7 11V8a5 5 0 0110 0v3" />
                    <path d="M6 11h12v10H6z" />
                  </svg>
                }
              />

              {submitted && canSubmit ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Registrasi valid (UI). Silakan hubungkan ke API saat siap.
                </div>
              ) : null}

              {submitted && !canSubmit ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  Periksa kembali input yang masih bermasalah.
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-2 h-11 w-full rounded-md bg-sky-800 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-600/20 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Register
              </button>

              <p className="pt-5 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-sky-700 underline-offset-4 hover:underline focus:outline-none focus:ring-4 focus:ring-sky-600/15"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT: HERO */}
        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-950 via-sky-900 to-blue-800" />
          <div className="absolute inset-0 opacity-15">
            <div className="h-full w-full bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.25),transparent_55%),radial-gradient(circle_at_75%_70%,rgba(255,255,255,0.18),transparent_50%)]" />
          </div>

          <div className="relative flex h-full flex-col px-14 py-12">
            <div className="mb-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-sm ring-1 ring-white/15 backdrop-blur">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                >
                  <path d="M12 2v6m0 8v6M2 12h6m8 0h6" />
                  <path d="M7 12a5 5 0 0110 0 5 5 0 01-10 0z" />
                </svg>
              </div>
            </div>

            <div className="mt-6 max-w-lg">
              <h2 className="text-[40px] font-semibold leading-[1.1] tracking-tight text-white">
                Reservasi ruang kampus dengan TEKSPACE.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-6 text-white/75">
                Visualisasikan jadwal, ajukan peminjaman, dan pantau penggunaan
                ruang secara terpusat untuk mendukung kegiatan akademik.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4 pb-2">
              <FeatureCard
                title="Jadwal Terpadu"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  >
                    <path d="M8 2v3M16 2v3" />
                    <path d="M3 7h18" />
                    <path d="M5 5h14a2 2 0 012 2v13a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                    <path d="M7 11h4M7 15h6" />
                  </svg>
                }
              />
              <FeatureCard
                title="Analitik Penggunaan"
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 text-white"
                    aria-hidden="true"
                  >
                    <path d="M4 19V5" />
                    <path d="M8 19v-8" />
                    <path d="M12 19v-4" />
                    <path d="M16 19v-11" />
                    <path d="M20 19v-6" />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}