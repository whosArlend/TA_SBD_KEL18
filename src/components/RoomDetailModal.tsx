import { useEffect, useState } from 'react'
import { X, MapPin, Users, Layers, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { getRoomById } from '../lib/api'
import type { Room } from '../lib/api'

const FALLBACK = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'

type Props = {
  roomId: number
  onClose: () => void
  onBook?: () => void
}

function StatusBadge({ status }: { status: Room['status'] }) {
  const map = {
    Available:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    Occupied:    'bg-orange-100 text-orange-700 border-orange-200',
    Maintenance: 'bg-slate-100 text-slate-600 border-slate-300',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Available' ? 'bg-emerald-500' : status === 'Occupied' ? 'bg-orange-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  )
}

export default function RoomDetailModal({ roomId, onClose, onBook }: Props) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    getRoomById(roomId)
      .then(setRoom)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [roomId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const amenities = room?.room_amenities_map ?? []
  const rules = room?.room_rules_map ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60 z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur shadow text-slate-500 hover:text-slate-800 transition"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-sky-600" />
            <p className="text-sm">Memuat detail ruangan...</p>
          </div>
        ) : !room ? (
          <div className="py-24 text-center text-slate-500">Ruangan tidak ditemukan.</div>
        ) : (
          <>
            {/* Hero Image */}
            <div className="relative h-56 bg-slate-100 overflow-hidden rounded-t-2xl">
              <img
                src={imgError || !room.image_url ? FALLBACK : room.image_url}
                alt={room.room_name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <StatusBadge status={room.status} />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{room.room_name}</h2>
                {room.room_type && (
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    <Layers size={14} /> {room.room_type}
                  </p>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                    <Users size={18} className="text-sky-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Kapasitas</p>
                    <p className="text-base font-bold text-slate-800">{room.capacity} Orang</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <MapPin size={18} className="text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Lokasi</p>
                    <p className="text-base font-bold text-slate-800 truncate">{room.location || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-sky-600" /> Fasilitas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a, i) => (
                      <span key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-semibold"
                      >
                        {a.amenities.amenity_name}
                        {a.quantity > 1 && (
                          <span className="bg-sky-200 text-sky-800 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            ×{a.quantity}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {rules.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-amber-600" /> Peraturan Ruangan
                  </h3>
                  <ul className="space-y-2">
                    {rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        {r.rules.rule_name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty states */}
              {amenities.length === 0 && rules.length === 0 && (
                <p className="text-sm text-slate-400 italic">Belum ada informasi fasilitas dan peraturan.</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              {onBook ? (
                <button
                  onClick={onBook}
                  disabled={room.status !== 'Available'}
                  className="w-full h-11 rounded-xl bg-[#0088FF] text-white font-bold text-sm hover:bg-blue-600 transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {room.status === 'Available' ? 'Book Now' : room.status === 'Occupied' ? 'Sedang Terpakai' : 'Dalam Maintenance'}
                </button>
              ) : (
                <button onClick={onClose}
                  className="w-full h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
                >
                  Tutup
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
