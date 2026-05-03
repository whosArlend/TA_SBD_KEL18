import * as React from 'react'

export type RoomType = 'Computer Lab' | 'Laboratory' | 'Classroom'

export type AddRoomValues = {
  roomName: string
  roomType: RoomType
  capacity: number | ''
  location: string
  roomRules: string[]
  amenities: string[]
  mediaFile: File | null
}

export type AddRoomModalProps = {
  open: boolean
  onClose: () => void
  onSave?: (values: AddRoomValues) => void
}

const ROOM_TYPES: RoomType[] = [
  'Computer Lab',
  'Laboratory',
  'Classroom',
]

const DEFAULT_RULES = ['No smoking', 'No food', 'Turn off lights after use']

const DEFAULT_AMENITIES = [
  'Smart TV',
  'Air Conditioning (AC)',
  'Sound System',
  'Power Outlet',
  'Projector',
  'Whiteboard',
  
]

type Errors = Partial<{
  roomName: string
  capacity: string
  mediaFile: string
}>

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function validate(values: AddRoomValues): Errors {
  const errors: Errors = {}

  if (!values.roomName.trim()) errors.roomName = 'Room Name wajib diisi.'

  if (values.capacity === '' || Number.isNaN(Number(values.capacity))) {
    errors.capacity = 'Capacity wajib diisi.'
  } else if (Number(values.capacity) <= 0) {
    errors.capacity = 'Capacity harus lebih dari 0.'
  }

  if (values.mediaFile) {
    const isAllowed = ['image/png', 'image/jpeg', 'image/webp'].includes(
      values.mediaFile.type,
    )
    const maxBytes = 5 * 1024 * 1024
    if (!isAllowed) errors.mediaFile = 'Format file harus PNG/JPG/WEBP.'
    else if (values.mediaFile.size > maxBytes)
      errors.mediaFile = 'Ukuran maksimal 5MB.'
  }

  return errors
}

function toggleInArray(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export default function AddRoomModal({ open, onClose, onSave }: AddRoomModalProps) {
  const [mounted, setMounted] = React.useState(open)
  const [visible, setVisible] = React.useState(open)

  const [roomName, setRoomName] = React.useState('')
  const [roomType, setRoomType] = React.useState<RoomType>('Computer Lab')
  const [capacity, setCapacity] = React.useState<number | ''>('')
  const [location, setLocation] = React.useState('')
  const [roomRules, setRoomRules] = React.useState<string[]>([...DEFAULT_RULES])
  const [amenities, setAmenities] = React.useState<string[]>([])
  const [mediaFile, setMediaFile] = React.useState<File | null>(null)

  const [touched, setTouched] = React.useState<{ roomName: boolean; capacity: boolean }>(
    { roomName: false, capacity: false },
  )
  const [dragActive, setDragActive] = React.useState(false)

  const values = React.useMemo<AddRoomValues>(
    () => ({
      roomName,
      roomType,
      capacity,
      location,
      roomRules,
      amenities,
      mediaFile,
    }),
    [roomName, roomType, capacity, location, roomRules, amenities, mediaFile],
  )

  const errors = React.useMemo(() => validate(values), [values])
  const canSave = Object.keys(errors).length === 0 && roomName.trim() !== '' && capacity !== ''

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
      return
    }

    setVisible(false)
    const t = window.setTimeout(() => setMounted(false), 160)
    return () => window.clearTimeout(t)
  }, [open])

  React.useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  React.useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleFile(file: File | null) {
    setMediaFile(file)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ roomName: true, capacity: true })
    if (!canSave) return

    onSave?.(values)
    onClose()
  }

  if (!mounted) return null

  return (
    <div
      className={cx(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'px-4 py-6 sm:px-6',
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <button
        type="button"
        onClick={onClose}
        className={cx(
          'absolute inset-0',
          'bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-150',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close modal"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-room-title"
        aria-describedby="add-room-subtitle"
        className={cx(
          'relative w-full max-w-[980px]',
          'rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60',
          'transition duration-150 ease-out',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          {/* Header */}
          <div className="flex items-start justify-between gap-6 px-8 pt-8">
            <div className="space-y-1">
              <h2
                id="add-room-title"
                className="text-2xl font-semibold tracking-tight text-slate-900"
              >
                Add New Room
              </h2>
              <p id="add-room-subtitle" className="text-sm text-slate-500">
                Enter the details to add a new meeting space to the inventory.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-800/15"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 pb-2 pt-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* LEFT */}
              <div className="space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="roomName">
                    Room Name
                  </label>
                  <input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, roomName: true }))}
                    placeholder="e.g. Executive Suite"
                    className={cx(
                      'h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm',
                      'placeholder:text-slate-400',
                      'focus:outline-none focus:ring-4',
                      touched.roomName && errors.roomName
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15',
                    )}
                    aria-invalid={Boolean(touched.roomName && errors.roomName)}
                  />
                  {touched.roomName && errors.roomName ? (
                    <p className="text-xs text-rose-600">{errors.roomName}</p>
                  ) : null}
                </div>

                {/* Room Type + Capacity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="roomType">
                      Room Type
                    </label>
                    <div className="relative">
                      <select
                        id="roomType"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value as RoomType)}
                        className={cx(
                          'h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 shadow-sm',
                          'focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15',
                        )}
                      >
                        {ROOM_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="capacity">
                      Capacity
                    </label>
                    <div className="relative">
                      <input
                        id="capacity"
                        value={capacity}
                        onChange={(e) => {
                          const raw = e.target.value
                          if (raw === '') return setCapacity('')
                          const n = Number(raw)
                          if (Number.isNaN(n)) return
                          setCapacity(n)
                        }}
                        onBlur={() => setTouched((t) => ({ ...t, capacity: true }))}
                        type="number"
                        min={1}
                        placeholder="18"
                        className={cx(
                          'h-11 w-full rounded-lg border bg-white px-4 pr-10 text-sm text-slate-900 shadow-sm',
                          'placeholder:text-slate-400',
                          'focus:outline-none focus:ring-4',
                          touched.capacity && errors.capacity
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15'
                            : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15',
                        )}
                        aria-invalid={Boolean(touched.capacity && errors.capacity)}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
                          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                          <path d="M9 11a4 4 0 100-8 4 4 0 000 8z" />
                          <path d="M22 21v-2a4 4 0 00-3-3.87" />
                          <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                      </div>
                    </div>
                    {touched.capacity && errors.capacity ? (
                      <p className="text-xs text-rose-600">{errors.capacity}</p>
                    ) : null}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="location">
                    Location / Floor
                  </label>
                  <input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Floor 4, Wing A"
                    className={cx(
                      'h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm',
                      'placeholder:text-slate-400',
                      'focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15',
                    )}
                  />
                </div>

                {/* Room Rules */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Room Rules</div>
                  <div className="space-y-3">
                    {roomRules.map((rule) => (
                      <label
                        key={rule}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={roomRules.includes(rule)}
                          onChange={() => setRoomRules((r) => toggleInArray(r, rule))}
                          className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-4 focus:ring-sky-800/20"
                        />
                        {rule}
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = window.prompt('Tambah rule baru')
                      if (!next?.trim()) return
                      setRoomRules((r) => (r.includes(next.trim()) ? r : [...r, next.trim()]))
                    }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-900"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full border border-sky-200 bg-sky-50">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                    + Add Room Rules
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-6">
                {/* Amenities */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Amenities</div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {DEFAULT_AMENITIES.map((a) => (
                      <label
                        key={a}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={amenities.includes(a)}
                          onChange={() => setAmenities((list) => toggleInArray(list, a))}
                          className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-4 focus:ring-sky-800/20"
                        />
                        {a}
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = window.prompt('Tambah amenity baru')
                      if (!next?.trim()) return
                      const v = next.trim()
                      if (!amenities.includes(v)) setAmenities((a) => [...a, v])
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Amenities
                  </button>
                </div>

                {/* Room Media */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Room Media</div>

                  <div
                    className={cx(
                      'rounded-xl border border-dashed bg-white p-6 text-center shadow-sm',
                      dragActive ? 'border-sky-800 bg-sky-50/40' : 'border-slate-300',
                    )}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(true)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(false)
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(false)
                      const file = e.dataTransfer.files?.[0] ?? null
                      handleFile(file)
                    }}
                  >
                    <input
                      id="roomMedia"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />

                    <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M20 16.5a4.5 4.5 0 00-1.5-8.7 5 5 0 00-9.7 1.3A4 4 0 006 17h3" />
                        <path d="M12 12v8" />
                        <path d="M8.5 15.5L12 12l3.5 3.5" />
                      </svg>
                    </div>

                    <label
                      htmlFor="roomMedia"
                      className="cursor-pointer text-sm font-semibold text-slate-800 hover:text-sky-800"
                    >
                      Click to upload
                    </label>
                    <span className="text-sm text-slate-500"> or drag and drop</span>

                    <p className="mt-2 text-xs text-slate-500">
                      PNG, JPG or WEBP (Max 5MB)
                    </p>

                    {mediaFile ? (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-700">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{mediaFile.name}</div>
                            <div className="text-slate-500">
                              {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMediaFile(null)}
                            className="rounded-md px-2 py-1 text-slate-500 hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-800/15"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {errors.mediaFile ? (
                      <p className="mt-2 text-xs text-rose-600">{errors.mediaFile}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-800/15"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSave}
              className="h-10 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-800/20 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Save Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

