import * as React from 'react'

type FieldStatus = 'idle' | 'error' | 'success'
type FieldVariant = 'outline' | 'filled'

export type TextFieldProps = {
  id: string
  label: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  status?: FieldStatus
  message?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  variant?: FieldVariant
  required?: boolean
  disabled?: boolean
}

const baseInput =
  'h-11 w-full rounded-md border px-11 pr-3 text-[15px] leading-none text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-4'

function variantClasses(variant: FieldVariant) {
  switch (variant) {
    case 'filled':
      return 'bg-slate-50'
    default:
      return 'bg-white'
  }
}

function statusClasses(status: FieldStatus, variant: FieldVariant) {
  switch (status) {
    case 'error':
      return 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
    case 'success':
      return 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15'
    default:
      return variant === 'filled'
        ? 'border-slate-300 focus:border-sky-600 focus:ring-sky-600/15'
        : 'border-slate-200 focus:border-sky-600 focus:ring-sky-600/15'
  }
}

export default function TextField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  autoComplete,
  inputMode,
  status = 'idle',
  message,
  hint,
  leftIcon,
  rightElement,
  variant = 'outline',
  required,
  disabled,
}: TextFieldProps) {
  const describedByIds = [
    hint ? `${id}-hint` : null,
    message ? `${id}-msg` : null,
  ].filter(Boolean) as string[]

  const showMessage = Boolean(message)

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold tracking-[0.12em] text-slate-600"
      >
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
          {leftIcon}
        </div>

        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          aria-invalid={status === 'error'}
          aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
          className={[
            baseInput,
            variantClasses(variant),
            statusClasses(status, variant),
            disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : '',
            rightElement ? 'pr-11' : '',
          ].join(' ')}
        />

        {rightElement ? (
          <div className="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
            {rightElement}
          </div>
        ) : null}

        {status === 'success' && !rightElement ? (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-emerald-600">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415.004l-3.75-3.7a1 1 0 011.404-1.425l3.045 3.006 6.544-6.555a1 1 0 011.422 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </div>

      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}

      {showMessage ? (
        <p
          id={`${id}-msg`}
          className={[
            'text-xs',
            status === 'error' ? 'text-rose-600' : 'text-emerald-700',
          ].join(' ')}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}

