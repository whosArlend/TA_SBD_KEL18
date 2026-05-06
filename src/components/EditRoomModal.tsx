import * as React from 'react'
import { Upload, X, Link } from 'lucide-react'
import type { Room } from '../lib/api'
import { uploadRoomImage } from '../lib/api'

type EditRoomModalProps = {
  room: Room
  onClose: () => void
  onSave: (updated: Partial<Room>) => Promise<void>
}

const ROOM_TYPES = ['Computer Lab', 'Laboratory', 'Classroom', 'Meeting Room', 'Ruang Kelas']
const STATUSES: Room['status'][] = ['Available', 'Occupied', 'Maintenance']
const FALLBACK = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'

type ImageMode = 'url' | 'upload'

export default function EditRoomModal({ room, onClose, onSave }: EditRoomModalProps) {
  const [roomName, setRoomName] = React.useState(room.room_name)
  const [roomType, setRoomType] = React.useState(room.room_type ?? '')
  const [capacity, setCapacity] = React.useState<number | ''>(room.capacity)
  const [location, setLocation] = React.useState(room.location ?? '')
  const [status, setStatus] = React.useState<Room['status']>(room.status)

  const [imageMode, setImageMode] = React.useState<ImageMode>('url')
  const [imageUrl, setImageUrl] = React.useState(room.image_url ?? '')
  const [previewSrc, setPreviewSrc] = React.useState(room.image_url || FALLBACK)
  const [dragActive, setDragActive] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Sync preview when URL changes
  React.useEffect(() => {
    if (imageMode === 'url') {
      setPreviewSrc(imageUrl.trim() || FALLBACK)
    }
  }, [imageUrl, imageMode])

  async function handleFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WEBP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.')
      return
    }
    setError(null)
    setUploading(true)
    // Local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreviewSrc(localUrl)
    try {
      const url = await uploadRoomImage(file)
      setUploadedFile(url)
      setPreviewSrc(url)
    } catch (err: any) {
      setError('Upload gagal: ' + (err.message ?? 'Coba lagi.'))
      setPreviewSrc(room.image_url || FALLBACK)
    } finally {
      setUploading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const finalImageUrl = imageMode === 'upload' ? (uploadedFile ?? room.image_url ?? '') : imageUrl.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!roomName.trim()) { setError('Room Name wajib diisi.'); return }
    if (!capacity || Number(capacity) <= 0) { setError('Capacity harus lebih dari 0.'); return }
    if (imageMode === 'url' && imageUrl && !/^https?:\/\/.+/.test(imageUrl.trim())) {
      setError('URL gambar tidak valid.'); return
    }
    setSaving(true)
    try {
      await onSave({
        room_name: roomName.trim(),
        room_type: roomType || null,
        capacity: Number(capacity),
        location: location.trim() || null,
        image_url: finalImageUrl || null,
        status,
      })
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Gagal menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit Room</h2>
              <p className="text-sm text-slate-500 mt-0.5">{room.room_name}</p>
            </div>
            <button type="button" onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT — Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Room Name</label>
                <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required
                  placeholder="e.g. Ruang Rapat Utama"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Room Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                >
                  <option value="">-- Pilih Tipe --</option>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Capacity</label>
                <input type="number" min={1} value={capacity}
                  onChange={(e) => { const v = e.target.value; setCapacity(v === '' ? '' : Number(v)) }}
                  placeholder="30"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Location / Floor</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Lantai 2, Gedung Baru"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Room['status'])}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* RIGHT — Image */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Room Image</label>
                {/* Mode tabs */}
                <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50 mb-3">
                  <button type="button"
                    onClick={() => { setImageMode('upload'); setError(null) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${imageMode === 'upload' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Upload size={13} /> Upload File
                  </button>
                  <button type="button"
                    onClick={() => { setImageMode('url'); setError(null) }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${imageMode === 'url' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Link size={13} /> URL
                  </button>
                </div>

                {/* Upload mode */}
                {imageMode === 'upload' && (
                  <div
                    className={`rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'}`}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2 text-sky-600">
                        <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Mengupload...</span>
                      </div>
                    ) : uploadedFile ? (
                      <div className="text-xs text-emerald-600 font-semibold">
                        ✓ Upload berhasil! Klik untuk ganti.
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Klik atau drag & drop</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · Maks 5MB</p>
                      </>
                    )}
                  </div>
                )}

                {/* URL mode */}
                {imageMode === 'url' && (
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/room.jpg"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                  />
                )}
              </div>

              {/* Preview */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="h-44 w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
                />
                <div className="px-3 py-1.5 text-[11px] text-slate-400 text-center bg-slate-50">
                  Preview gambar
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-8 mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5">
            <button type="button" onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >Cancel</button>
            <button type="submit" disabled={saving || uploading}
              className="h-10 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white hover:bg-sky-900 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
