import * as React from 'react'
import { Upload, X, Link, Loader2 } from 'lucide-react'
import type { Room, Amenity, Rule } from '../lib/api'
import {
  uploadRoomImage, getAmenities, createAmenity, deleteAmenity,
  getRules, createRule, deleteRule,
  getRoomById, updateRoomAmenities, updateRoomRules,
} from '../lib/api'

type EditRoomModalProps = {
  room: Room
  onClose: () => void
  onSave: (updated: Partial<Room>) => Promise<void>
}

const ROOM_TYPES = ['Computer Lab', 'Laboratory', 'Classroom', 'Meeting Room', 'Ruang Kelas']
const STATUSES: Room['status'][] = ['Available', 'Occupied', 'Maintenance']
const FALLBACK = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80'
type ImageMode = 'upload' | 'url'

export default function EditRoomModal({ room, onClose, onSave }: EditRoomModalProps) {
  // Basic fields
  const [roomName, setRoomName] = React.useState(room.room_name)
  const [roomType, setRoomType] = React.useState(room.room_type ?? '')
  const [capacity, setCapacity] = React.useState<number | ''>(room.capacity)
  const [location, setLocation] = React.useState(room.location ?? '')
  const [status, setStatus] = React.useState<Room['status']>(room.status)

  // Image
  const [imageMode, setImageMode] = React.useState<ImageMode>('url')
  const [imageUrl, setImageUrl] = React.useState(room.image_url ?? '')
  const [previewSrc, setPreviewSrc] = React.useState(room.image_url || FALLBACK)
  const [dragActive, setDragActive] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [uploadDone, setUploadDone] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Amenities & Rules
  const [allAmenities, setAllAmenities] = React.useState<Amenity[]>([])
  const [allRules, setAllRules] = React.useState<Rule[]>([])
  const [selectedAmenities, setSelectedAmenities] = React.useState<Map<number, number>>(new Map())
  const [selectedRules, setSelectedRules] = React.useState<Set<number>>(new Set())
  const [loadingMeta, setLoadingMeta] = React.useState(true)

  // Custom add inputs
  const [newAmenityName, setNewAmenityName] = React.useState('')
  const [addingAmenity, setAddingAmenity] = React.useState(false)
  const [newRuleName, setNewRuleName] = React.useState('')
  const [addingRule, setAddingRule] = React.useState(false)

  // Submit
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPreviewSrc(imageMode === 'url' ? (imageUrl.trim() || FALLBACK) : previewSrc)
  }, [imageUrl, imageMode])

  // Fetch full room detail (with amenities/rules) + all available amenities/rules
  React.useEffect(() => {
    Promise.all([getAmenities(), getRules(), getRoomById(room.room_id)])
      .then(([amenities, rules, fullRoom]) => {
        setAllAmenities(amenities)
        setAllRules(rules)
        // Pre-select from full room data (includes joins)
        const aMap = new Map<number, number>()
        fullRoom.room_amenities_map?.forEach((a) => {
          aMap.set(a.amenities.amenity_id, a.quantity)
        })
        setSelectedAmenities(aMap)
        const rSet = new Set<number>()
        fullRoom.room_rules_map?.forEach((r) => {
          rSet.add(r.rules.rule_id)
        })
        setSelectedRules(rSet)
      })
      .catch(console.error)
      .finally(() => setLoadingMeta(false))
  }, [])

  async function handleFile(file: File) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setError('Format file harus JPG, PNG, atau WEBP.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB.'); return }
    setError(null)
    setUploading(true)
    setPreviewSrc(URL.createObjectURL(file))
    try {
      const url = await uploadRoomImage(file)
      setImageUrl(url)
      setPreviewSrc(url)
      setUploadDone(true)
    } catch (err: any) {
      setError('Upload gagal: ' + (err.message ?? 'Coba lagi.'))
      setPreviewSrc(room.image_url || FALLBACK)
    } finally {
      setUploading(false)
    }
  }

  function toggleAmenity(id: number) {
    setSelectedAmenities((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, 1)
      return next
    })
  }

  function setQuantity(id: number, qty: number) {
    setSelectedAmenities((prev) => new Map(prev).set(id, Math.max(1, qty)))
  }

  function toggleRule(id: number) {
    setSelectedRules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleAddAmenity() {
    const name = newAmenityName.trim()
    if (!name) return
    setAddingAmenity(true)
    try {
      const created = await createAmenity(name)
      setAllAmenities((prev) => [...prev, created].sort((a, b) => a.amenity_name.localeCompare(b.amenity_name)))
      setSelectedAmenities((prev) => new Map(prev).set(created.amenity_id, 1))
      setNewAmenityName('')
    } catch (err: any) {
      setError('Gagal tambah fasilitas: ' + err.message)
    } finally {
      setAddingAmenity(false)
    }
  }

  async function handleDeleteAmenity(id: number) {
    if (!window.confirm('Hapus fasilitas ini? Akan dihapus dari semua ruangan.')) return
    try {
      await deleteAmenity(id)
      setAllAmenities((prev) => prev.filter((a) => a.amenity_id !== id))
      setSelectedAmenities((prev) => { const n = new Map(prev); n.delete(id); return n })
    } catch (err: any) {
      setError('Gagal hapus fasilitas: ' + err.message)
    }
  }

  async function handleAddRule() {
    const name = newRuleName.trim()
    if (!name) return
    setAddingRule(true)
    try {
      const created = await createRule(name)
      setAllRules((prev) => [...prev, created].sort((a, b) => a.rule_name.localeCompare(b.rule_name)))
      setSelectedRules((prev) => new Set(prev).add(created.rule_id))
      setNewRuleName('')
    } catch (err: any) {
      setError('Gagal tambah peraturan: ' + err.message)
    } finally {
      setAddingRule(false)
    }
  }

  async function handleDeleteRule(id: number) {
    if (!window.confirm('Hapus peraturan ini? Akan dihapus dari semua ruangan.')) return
    try {
      await deleteRule(id)
      setAllRules((prev) => prev.filter((r) => r.rule_id !== id))
      setSelectedRules((prev) => { const n = new Set(prev); n.delete(id); return n })
    } catch (err: any) {
      setError('Gagal hapus peraturan: ' + err.message)
    }
  }

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
      const finalUrl = imageMode === 'upload' ? imageUrl : imageUrl.trim()
      await onSave({
        room_name: roomName.trim(),
        room_type: roomType || null,
        capacity: Number(capacity),
        location: location.trim() || null,
        image_url: finalUrl || null,
        status,
      })
      // Save amenities & rules
      const amenityIds = Array.from(selectedAmenities.entries()).map(([amenity_id, quantity]) => ({ amenity_id, quantity }))
      const ruleIds = Array.from(selectedRules)
      await Promise.all([
        updateRoomAmenities(room.room_id, amenityIds),
        updateRoomRules(room.room_id, ruleIds),
      ])
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
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 z-10 max-h-[90vh] overflow-y-auto"
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
          <div className="px-8 py-6 space-y-6">
            {/* Row 1: Basic + Image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT — Basic fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Room Name</label>
                  <input value={roomName} onChange={(e) => setRoomName(e.target.value)} required
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
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Location / Floor</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)}
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
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">Room Image</label>
                <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                  <button type="button" onClick={() => { setImageMode('upload') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${imageMode === 'upload' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  ><Upload size={12} /> Upload File</button>
                  <button type="button" onClick={() => { setImageMode('url') }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition ${imageMode === 'url' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  ><Link size={12} /> URL</button>
                </div>

                {imageMode === 'upload' && (
                  <div
                    className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'}`}
                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-sky-600">
                        <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Mengupload...</span>
                      </div>
                    ) : uploadDone ? (
                      <p className="text-xs font-semibold text-emerald-600">✓ Upload berhasil! Klik untuk ganti.</p>
                    ) : (
                      <>
                        <Upload size={20} className="mx-auto text-slate-400 mb-1" />
                        <p className="text-xs font-semibold text-slate-700">Klik atau drag & drop</p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WEBP · Maks 5MB</p>
                      </>
                    )}
                  </div>
                )}

                {imageMode === 'url' && (
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/room.jpg"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-700/15"
                  />
                )}

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <img src={previewSrc} alt="Preview" className="h-36 w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
                  />
                </div>
              </div>
            </div>

            {/* Amenities & Rules */}
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 size={16} className="animate-spin" /> Memuat fasilitas dan peraturan...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                {/* Amenities */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Fasilitas (Amenities)</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                    {allAmenities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada fasilitas. Tambahkan di bawah.</p>
                    ) : allAmenities.map((a) => {
                      const checked = selectedAmenities.has(a.amenity_id)
                      const qty = selectedAmenities.get(a.amenity_id) ?? 1
                      return (
                        <div key={a.amenity_id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                          <input type="checkbox" checked={checked}
                            onChange={() => toggleAmenity(a.amenity_id)}
                            className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-700/20 shrink-0"
                          />
                          <span className="flex-1 text-sm text-slate-700 truncate">{a.amenity_name}</span>
                          {checked && (
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-slate-400">Qty:</span>
                              <input type="number" min={1} value={qty}
                                onChange={(e) => setQuantity(a.amenity_id, Number(e.target.value))}
                                className="w-12 h-7 rounded border border-slate-200 px-1 text-xs text-center focus:outline-none focus:border-sky-600"
                              />
                            </div>
                          )}
                          <button type="button" onClick={() => handleDeleteAmenity(a.amenity_id)}
                            className="shrink-0 text-slate-300 hover:text-rose-500 transition"
                            title="Hapus fasilitas"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  {/* Add new amenity */}
                  <div className="flex gap-2">
                    <input
                      value={newAmenityName}
                      onChange={(e) => setNewAmenityName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity() } }}
                      placeholder="Tambah fasilitas baru..."
                      className="flex-1 h-9 rounded-lg border border-dashed border-slate-300 px-3 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 placeholder:text-slate-400"
                    />
                    <button type="button" onClick={handleAddAmenity} disabled={!newAmenityName.trim() || addingAmenity}
                      className="h-9 px-3 rounded-lg bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {addingAmenity ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Peraturan (Rules)</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
                    {allRules.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Belum ada peraturan. Tambahkan di bawah.</p>
                    ) : allRules.map((r) => (
                      <div key={r.rule_id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <input type="checkbox" checked={selectedRules.has(r.rule_id)}
                          onChange={() => toggleRule(r.rule_id)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-700/20 shrink-0"
                        />
                        <span className="flex-1 text-sm text-slate-700">{r.rule_name}</span>
                        <button type="button" onClick={() => handleDeleteRule(r.rule_id)}
                          className="shrink-0 text-slate-300 hover:text-rose-500 transition"
                          title="Hapus peraturan"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Add new rule */}
                  <div className="flex gap-2">
                    <input
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule() } }}
                      placeholder="Tambah peraturan baru..."
                      className="flex-1 h-9 rounded-lg border border-dashed border-slate-300 px-3 text-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 placeholder:text-slate-400"
                    />
                    <button type="button" onClick={handleAddRule} disabled={!newRuleName.trim() || addingRule}
                      className="h-9 px-3 rounded-lg bg-sky-700 text-white text-xs font-bold hover:bg-sky-800 transition disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {addingRule ? '...' : '+ Tambah'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
