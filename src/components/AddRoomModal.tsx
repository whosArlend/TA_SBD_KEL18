import * as React from 'react'
import { Upload, Link } from 'lucide-react'
import { uploadRoomImage } from '../lib/api'

export type RoomType = 'Computer Lab' | 'Laboratory' | 'Classroom' | 'Meeting Room' | 'Ruang Kelas'

export type AddRoomValues = {
  roomName: string
  roomType: RoomType
  capacity: number | ''
  location: string
  roomRules: string[]
  amenities: string[]
  imageUrl: string
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
  'Meeting Room',
  'Ruang Kelas',
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
  imageUrl: string
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
  if (values.imageUrl && !/^https?:\/\/.+/.test(values.imageUrl.trim())) {
    errors.imageUrl = 'URL gambar tidak valid (harus dimulai dengan http/https).'
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
  const [imageUrl, setImageUrl] = React.useState('')
  const [imageMode, setImageMode] = React.useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = React.useState(false)
  const [uploadDone, setUploadDone] = React.useState(false)
  const [previewSrc, setPreviewSrc] = React.useState('')
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [touched, setTouched] = React.useState({ roomName: false, capacity: false })

  const values = React.useMemo<AddRoomValues>(
    () => ({ roomName, roomType, capacity, location, roomRules, amenities, imageUrl }),
    [roomName, roomType, capacity, location, roomRules, amenities, imageUrl],
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
    return () => { document.body.style.overflow = '' }
  }, [open])

  async function handleFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setUploadError('Format harus JPG, PNG, atau WEBP.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Ukuran maksimal 5MB.'); return }
    setUploadError(null)
    setUploading(true)
    setPreviewSrc(URL.createObjectURL(file))
    try {
      const url = await uploadRoomImage(file)
      setImageUrl(url)
      setPreviewSrc(url)
      setUploadDone(true)
    } catch (err: any) {
      setUploadError('Upload gagal: ' + (err.message ?? 'Coba lagi.'))
      setPreviewSrc('')
    } finally {
      setUploading(false)
    }
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
    <div className={cx('fixed inset-0 z-50', 'flex items-center justify-center', 'px-4 py-6 sm:px-6')} aria-hidden={!open}>
      <button type="button" onClick={onClose}
        className={cx('absolute inset-0', 'bg-black/40 backdrop-blur-sm', 'transition-opacity duration-150', visible ? 'opacity-100' : 'opacity-0')}
        aria-label="Close modal"
      />

      <div role="dialog" aria-modal="true" aria-labelledby="add-room-title"
        className={cx('relative w-full max-w-[980px]', 'rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60', 'transition duration-150 ease-out', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]')}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          {/* Header */}
          <div className="flex items-start justify-between gap-6 px-8 pt-8">
            <div className="space-y-1">
              <h2 id="add-room-title" className="text-2xl font-semibold tracking-tight text-slate-900">Add New Room</h2>
              <p className="text-sm text-slate-500">Enter the details to add a new meeting space to the inventory.</p>
            </div>
            <button type="button" onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-800/15"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 pb-2 pt-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* LEFT */}
              <div className="space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="roomName">Room Name</label>
                  <input id="roomName" value={roomName} onChange={(e) => setRoomName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, roomName: true }))}
                    placeholder="e.g. Ruang Rapat Utama"
                    className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                      touched.roomName && errors.roomName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                  />
                  {touched.roomName && errors.roomName && <p className="text-xs text-rose-600">{errors.roomName}</p>}
                </div>

                {/* Room Type + Capacity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="roomType">Room Type</label>
                    <div className="relative">
                      <select id="roomType" value={roomType} onChange={(e) => setRoomType(e.target.value as RoomType)}
                        className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 shadow-sm focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15"
                      >
                        {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="capacity">Capacity</label>
                    <input id="capacity" value={capacity}
                      onChange={(e) => { const raw = e.target.value; if (raw === '') return setCapacity(''); const n = Number(raw); if (!Number.isNaN(n)) setCapacity(n) }}
                      onBlur={() => setTouched((t) => ({ ...t, capacity: true }))}
                      type="number" min={1} placeholder="30"
                      className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                        touched.capacity && errors.capacity ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                    />
                    {touched.capacity && errors.capacity && <p className="text-xs text-rose-600">{errors.capacity}</p>}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700" htmlFor="location">Location / Floor</label>
                  <input id="location" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lantai 2, Gedung Baru"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15"
                  />
                </div>

                {/* Room Rules */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Room Rules</div>
                  <div className="space-y-3">
                    {roomRules.map((rule) => (
                      <label key={rule} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <input type="checkbox" checked={roomRules.includes(rule)}
                          onChange={() => setRoomRules((r) => toggleInArray(r, rule))}
                          className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-4 focus:ring-sky-800/20"
                        />
                        {rule}
                      </label>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => { const next = window.prompt('Tambah rule baru'); if (!next?.trim()) return; setRoomRules((r) => r.includes(next.trim()) ? r : [...r, next.trim()]) }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 hover:text-sky-900"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full border border-sky-200 bg-sky-50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                    Add Room Rules
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
                      <label key={a} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <input type="checkbox" checked={amenities.includes(a)}
                          onChange={() => setAmenities((list) => toggleInArray(list, a))}
                          className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-4 focus:ring-sky-800/20"
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => { const next = window.prompt('Tambah amenity baru'); if (!next?.trim()) return; const v = next.trim(); if (!amenities.includes(v)) setAmenities((a) => [...a, v]) }}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-slate-500"><path d="M12 5v14M5 12h14" /></svg>
                    Add Amenities
                  </button>
                </div>

                {/* Room Image */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-700">Room Image</div>

                  {/* Mode tabs */}
                  <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                    <button type="button"
                      onClick={() => { setImageMode('upload'); setUploadError(null) }}
                      className={cx('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition',
                        imageMode === 'upload' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    >
                      <Upload size={12} /> Upload File
                    </button>
                    <button type="button"
                      onClick={() => { setImageMode('url'); setUploadError(null) }}
                      className={cx('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition',
                        imageMode === 'url' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    >
                      <Link size={12} /> URL
                    </button>
                  </div>

                  {/* Upload mode */}
                  {imageMode === 'upload' && (
                    <div
                      className={cx('rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition',
                        'hover:border-sky-300 hover:bg-sky-50/30 border-slate-200')}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
                    >
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                      />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-sky-600">
                          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium">Mengupload...</span>
                        </div>
                      ) : uploadDone ? (
                        <p className="text-xs font-semibold text-emerald-600">✓ Upload berhasil! Klik untuk ganti.</p>
                      ) : (
                        <>
                          <Upload size={22} className="mx-auto text-slate-400 mb-1.5" />
                          <p className="text-sm font-semibold text-slate-700">Klik atau drag & drop</p>
                          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Maks 5MB</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* URL mode */}
                  {imageMode === 'url' && (
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/room-image.jpg"
                      className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                        errors.imageUrl ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                    />
                  )}

                  {(uploadError || errors.imageUrl) && (
                    <p className="text-xs text-rose-600">{uploadError ?? errors.imageUrl}</p>
                  )}

                  {/* Preview */}
                  {(previewSrc || imageUrl) && (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <img src={previewSrc || imageUrl} alt="Preview" className="h-32 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5">
            <button type="button" onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-sky-800/15"
            >Cancel</button>
            <button type="submit" disabled={!canSave}
              className="h-10 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-900 focus:outline-none focus:ring-4 focus:ring-sky-800/20 disabled:cursor-not-allowed disabled:bg-slate-300"
            >Save Room</button>
          </div>
        </form>
      </div>
    </div>
  )
}
