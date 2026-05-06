import * as React from 'react'
import { Upload, Link, X, Loader2 } from 'lucide-react'
import { getAmenities, createAmenity, deleteAmenity, getRules, createRule, deleteRule, uploadRoomImage } from '../lib/api'
import type { Amenity, Rule } from '../lib/api'

export type RoomType = 'Computer Lab' | 'Laboratory' | 'Classroom' | 'Meeting Room' | 'Ruang Kelas'

export type AddRoomValues = {
  roomName: string
  roomType: RoomType
  capacity: number | ''
  location: string
  imageUrl: string
  selectedAmenities: { amenity_id: number; quantity: number }[]
  selectedRuleIds: number[]
}

export type AddRoomModalProps = {
  open: boolean
  onClose: () => void
  onSave?: (values: AddRoomValues) => void
}

const ROOM_TYPES: RoomType[] = ['Computer Lab', 'Laboratory', 'Classroom', 'Meeting Room', 'Ruang Kelas']

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function AddRoomModal({ open, onClose, onSave }: AddRoomModalProps) {
  const [mounted, setMounted] = React.useState(open)
  const [visible, setVisible] = React.useState(open)

  // Basic fields
  const [roomName, setRoomName] = React.useState('')
  const [roomType, setRoomType] = React.useState<RoomType>('Computer Lab')
  const [capacity, setCapacity] = React.useState<number | ''>('')
  const [location, setLocation] = React.useState('')
  const [touched, setTouched] = React.useState({ roomName: false, capacity: false })

  // Image
  const [imageMode, setImageMode] = React.useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = React.useState('')
  const [previewSrc, setPreviewSrc] = React.useState('')
  const [uploading, setUploading] = React.useState(false)
  const [uploadDone, setUploadDone] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Amenities & Rules from API
  const [allAmenities, setAllAmenities] = React.useState<Amenity[]>([])
  const [allRules, setAllRules] = React.useState<Rule[]>([])
  const [loadingMeta, setLoadingMeta] = React.useState(true)
  const [selectedAmenities, setSelectedAmenities] = React.useState<Map<number, number>>(new Map())
  const [selectedRuleIds, setSelectedRuleIds] = React.useState<Set<number>>(new Set())

  // Custom add inputs
  const [newAmenityName, setNewAmenityName] = React.useState('')
  const [addingAmenity, setAddingAmenity] = React.useState(false)
  const [newRuleName, setNewRuleName] = React.useState('')
  const [addingRule, setAddingRule] = React.useState(false)

  // Validation
  const errors = React.useMemo(() => {
    const e: Record<string, string> = {}
    if (!roomName.trim()) e.roomName = 'Room Name wajib diisi.'
    if (capacity === '' || Number(capacity) <= 0) e.capacity = 'Capacity harus lebih dari 0.'
    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl.trim())) e.imageUrl = 'URL gambar tidak valid.'
    return e
  }, [roomName, capacity, imageUrl])
  const canSave = Object.keys(errors).length === 0 && roomName.trim() !== '' && capacity !== ''

  // Fetch amenities + rules on open
  React.useEffect(() => {
    if (!open) return
    setLoadingMeta(true)
    Promise.all([getAmenities(), getRules()])
      .then(([a, r]) => { setAllAmenities(a); setAllRules(r) })
      .catch(console.error)
      .finally(() => setLoadingMeta(false))
  }, [open])

  // Reset form when closed
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const t = window.setTimeout(() => {
        setMounted(false)
        // Reset
        setRoomName(''); setRoomType('Computer Lab'); setCapacity(''); setLocation('')
        setImageUrl(''); setPreviewSrc(''); setUploadDone(false); setUploadError(null)
        setSelectedAmenities(new Map()); setSelectedRuleIds(new Set())
        setNewAmenityName(''); setNewRuleName('')
        setTouched({ roomName: false, capacity: false })
      }, 160)
      return () => window.clearTimeout(t)
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  // Image preview sync
  React.useEffect(() => {
    if (imageMode === 'url') setPreviewSrc(imageUrl.trim())
  }, [imageUrl, imageMode])

  async function handleFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setUploadError('Format harus JPG, PNG, atau WEBP.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Ukuran maksimal 5MB.'); return }
    setUploadError(null); setUploading(true)
    setPreviewSrc(URL.createObjectURL(file))
    try {
      const url = await uploadRoomImage(file)
      setImageUrl(url); setPreviewSrc(url); setUploadDone(true)
    } catch (err: any) {
      setUploadError('Upload gagal: ' + (err.message ?? 'Coba lagi.')); setPreviewSrc('')
    } finally { setUploading(false) }
  }

  function toggleAmenity(id: number) {
    setSelectedAmenities((prev) => { const n = new Map(prev); n.has(id) ? n.delete(id) : n.set(id, 1); return n })
  }
  function setQty(id: number, qty: number) {
    setSelectedAmenities((prev) => new Map(prev).set(id, Math.max(1, qty)))
  }
  function toggleRule(id: number) {
    setSelectedRuleIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleAddAmenity() {
    const name = newAmenityName.trim(); if (!name) return
    setAddingAmenity(true)
    try {
      const created = await createAmenity(name)
      setAllAmenities((prev) => [...prev, created].sort((a, b) => a.amenity_name.localeCompare(b.amenity_name)))
      setSelectedAmenities((prev) => new Map(prev).set(created.amenity_id, 1))
      setNewAmenityName('')
    } catch (err: any) { alert('Gagal: ' + err.message) }
    finally { setAddingAmenity(false) }
  }

  async function handleDeleteAmenity(id: number) {
    if (!window.confirm('Hapus fasilitas ini dari database?')) return
    try {
      await deleteAmenity(id)
      setAllAmenities((prev) => prev.filter((a) => a.amenity_id !== id))
      setSelectedAmenities((prev) => { const n = new Map(prev); n.delete(id); return n })
    } catch (err: any) { alert('Gagal: ' + err.message) }
  }

  async function handleAddRule() {
    const name = newRuleName.trim(); if (!name) return
    setAddingRule(true)
    try {
      const created = await createRule(name)
      setAllRules((prev) => [...prev, created].sort((a, b) => a.rule_name.localeCompare(b.rule_name)))
      setSelectedRuleIds((prev) => new Set(prev).add(created.rule_id))
      setNewRuleName('')
    } catch (err: any) { alert('Gagal: ' + err.message) }
    finally { setAddingRule(false) }
  }

  async function handleDeleteRule(id: number) {
    if (!window.confirm('Hapus peraturan ini dari database?')) return
    try {
      await deleteRule(id)
      setAllRules((prev) => prev.filter((r) => r.rule_id !== id))
      setSelectedRuleIds((prev) => { const n = new Set(prev); n.delete(id); return n })
    } catch (err: any) { alert('Gagal: ' + err.message) }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ roomName: true, capacity: true })
    if (!canSave) return
    onSave?.({
      roomName, roomType, capacity, location, imageUrl,
      selectedAmenities: Array.from(selectedAmenities.entries()).map(([amenity_id, quantity]) => ({ amenity_id, quantity })),
      selectedRuleIds: Array.from(selectedRuleIds),
    })
    onClose()
  }

  if (!mounted) return null

  return (
    <div className={cx('fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:px-6')} aria-hidden={!open}>
      <button type="button" onClick={onClose}
        className={cx('absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-150', visible ? 'opacity-100' : 'opacity-0')}
        aria-label="Close modal"
      />
      <div
        role="dialog" aria-modal="true"
        className={cx('relative w-full max-w-[1000px] rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 transition duration-150 ease-out max-h-[90vh] overflow-y-auto', visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]')}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit}>
          {/* Header */}
          <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Add New Room</h2>
              <p className="text-sm text-slate-500 mt-1">Enter the details to add a new meeting space to the inventory.</p>
            </div>
            <button type="button" onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

              {/* LEFT — Basic info + Rules */}
              <div className="space-y-5">
                {/* Room Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Room Name</label>
                  <input value={roomName} onChange={(e) => setRoomName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, roomName: true }))}
                    placeholder="e.g. Ruang Rapat Utama"
                    className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                      touched.roomName && errors.roomName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                  />
                  {touched.roomName && errors.roomName && <p className="text-xs text-rose-600">{errors.roomName}</p>}
                </div>

                {/* Type + Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Room Type</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value as RoomType)}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15"
                    >
                      {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Capacity</label>
                    <input type="number" min={1} value={capacity}
                      onChange={(e) => { const v = e.target.value; setCapacity(v === '' ? '' : Number(v)) }}
                      onBlur={() => setTouched((t) => ({ ...t, capacity: true }))}
                      placeholder="30"
                      className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                        touched.capacity && errors.capacity ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                    />
                    {touched.capacity && errors.capacity && <p className="text-xs text-rose-600">{errors.capacity}</p>}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Location / Floor</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lantai 2, Gedung Baru"
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-800 focus:ring-4 focus:ring-sky-800/15"
                  />
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Peraturan (Rules)</label>
                  {loadingMeta ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2"><Loader2 size={14} className="animate-spin" /> Memuat...</div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {allRules.length === 0
                          ? <p className="text-xs text-slate-400 italic">Belum ada peraturan. Tambahkan di bawah.</p>
                          : allRules.map((r) => (
                            <div key={r.rule_id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                              <input type="checkbox" checked={selectedRuleIds.has(r.rule_id)} onChange={() => toggleRule(r.rule_id)}
                                className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-sky-800/20 shrink-0"
                              />
                              <span className="flex-1 text-sm text-slate-700">{r.rule_name}</span>
                              <button type="button" onClick={() => handleDeleteRule(r.rule_id)}
                                className="shrink-0 text-slate-300 hover:text-rose-500 transition" title="Hapus">
                                <X size={13} />
                              </button>
                            </div>
                          ))
                        }
                      </div>
                      <div className="flex gap-2">
                        <input value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule() } }}
                          placeholder="Tambah peraturan baru..."
                          className="flex-1 h-9 rounded-lg border border-dashed border-slate-300 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 placeholder:text-slate-400"
                        />
                        <button type="button" onClick={handleAddRule} disabled={!newRuleName.trim() || addingRule}
                          className="h-9 px-3 rounded-lg bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition disabled:bg-slate-200 disabled:text-slate-400"
                        >{addingRule ? '...' : '+ Tambah'}</button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT — Amenities + Image */}
              <div className="space-y-5">
                {/* Amenities */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Fasilitas (Amenities)</label>
                  {loadingMeta ? (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-2"><Loader2 size={14} className="animate-spin" /> Memuat...</div>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                        {allAmenities.length === 0
                          ? <p className="text-xs text-slate-400 italic">Belum ada fasilitas. Tambahkan di bawah.</p>
                          : allAmenities.map((a) => {
                            const checked = selectedAmenities.has(a.amenity_id)
                            const qty = selectedAmenities.get(a.amenity_id) ?? 1
                            return (
                              <div key={a.amenity_id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                <input type="checkbox" checked={checked} onChange={() => toggleAmenity(a.amenity_id)}
                                  className="h-4 w-4 rounded border-slate-300 text-sky-800 focus:ring-sky-800/20 shrink-0"
                                />
                                <span className="flex-1 text-sm text-slate-700 truncate">{a.amenity_name}</span>
                                {checked && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-xs text-slate-400">Qty:</span>
                                    <input type="number" min={1} value={qty}
                                      onChange={(e) => setQty(a.amenity_id, Number(e.target.value))}
                                      className="w-12 h-7 rounded border border-slate-200 px-1 text-xs text-center focus:outline-none focus:border-sky-600"
                                    />
                                  </div>
                                )}
                                <button type="button" onClick={() => handleDeleteAmenity(a.amenity_id)}
                                  className="shrink-0 text-slate-300 hover:text-rose-500 transition" title="Hapus">
                                  <X size={13} />
                                </button>
                              </div>
                            )
                          })
                        }
                      </div>
                      <div className="flex gap-2">
                        <input value={newAmenityName} onChange={(e) => setNewAmenityName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity() } }}
                          placeholder="Tambah fasilitas baru..."
                          className="flex-1 h-9 rounded-lg border border-dashed border-slate-300 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-700/15 placeholder:text-slate-400"
                        />
                        <button type="button" onClick={handleAddAmenity} disabled={!newAmenityName.trim() || addingAmenity}
                          className="h-9 px-3 rounded-lg bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition disabled:bg-slate-200 disabled:text-slate-400"
                        >{addingAmenity ? '...' : '+ Tambah'}</button>
                      </div>
                    </>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Room Image</label>
                  <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                    <button type="button" onClick={() => setImageMode('upload')}
                      className={cx('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition',
                        imageMode === 'upload' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    ><Upload size={12} /> Upload File</button>
                    <button type="button" onClick={() => setImageMode('url')}
                      className={cx('flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition',
                        imageMode === 'url' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                    ><Link size={12} /> URL</button>
                  </div>

                  {imageMode === 'upload' && (
                    <div
                      className="rounded-xl border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 p-5 text-center cursor-pointer transition"
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

                  {imageMode === 'url' && (
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/room-image.jpg"
                      className={cx('h-11 w-full rounded-lg border bg-white px-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4',
                        errors.imageUrl ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15' : 'border-slate-200 focus:border-sky-800 focus:ring-sky-800/15')}
                    />
                  )}

                  {uploadError && <p className="text-xs text-rose-600">{uploadError}</p>}
                  {errors.imageUrl && <p className="text-xs text-rose-600">{errors.imageUrl}</p>}

                  {previewSrc && (
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <img src={previewSrc} alt="Preview" className="h-32 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-8 py-5 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none"
            >Cancel</button>
            <button type="submit" disabled={!canSave || uploading}
              className="h-10 rounded-lg bg-sky-800 px-5 text-sm font-semibold text-white shadow-sm hover:bg-sky-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
            >Save Room</button>
          </div>
        </form>
      </div>
    </div>
  )
}
