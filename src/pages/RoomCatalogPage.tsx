import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Users, Search, X } from 'lucide-react';
import * as api from '../lib/api';
import type { Room } from '../lib/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80';

function BookRoomModal({ room, userId, onClose }: { room: Room; userId: number; onClose: () => void }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!startTime || !endTime) { setError('Waktu mulai dan selesai wajib diisi.'); return; }
    if (new Date(endTime) <= new Date(startTime)) { setError('Waktu selesai harus setelah waktu mulai.'); return; }
    if (!meetingTitle.trim()) { setError('Judul rapat wajib diisi.'); return; }
    if (!personInCharge.trim()) { setError('Penanggung jawab wajib diisi.'); return; }
    setLoading(true);
    try {
      await api.createReservation({
        user_id: userId,
        room_id: room.room_id,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        meeting_title: meetingTitle.trim(),
        person_in_charge: personInCharge.trim(),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        {success ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Terkirim!</h2>
            <p className="text-slate-500 text-sm mb-6">Permintaan booking <span className="font-bold">{room.room_name}</span> berhasil dikirim dan menunggu persetujuan admin.</p>
            <button onClick={onClose} className="w-full bg-[#0088FF] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition">Tutup</button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Book Room</h2>
            <p className="text-slate-500 text-sm mb-6">{room.room_name} · {room.capacity} orang · {room.location || '-'}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Mulai</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Selesai</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Rapat / Kegiatan</label>
                <input type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} required
                  placeholder="e.g. Rapat Tim, Seminar, Kuliah..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Penanggung Jawab</label>
                <input type="text" value={personInCharge} onChange={(e) => setPersonInCharge(e.target.value)} required
                  placeholder="Nama penanggung jawab kegiatan..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15" />
              </div>
              {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#0088FF] text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed">
                {loading ? 'Mengirim...' : 'Kirim Permintaan Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function RoomCatalogPage() {
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.dbUserId as number | undefined;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const data = await api.getRooms();
        // Only show non-archived rooms
        setRooms(data.filter((r) => r.archived_at === null));
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Room Catalog</h1>
            <p className="text-slate-500">Jelajahi dan temukan ruangan yang tepat untuk kebutuhanmu.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Cari nama atau lokasi ruangan..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0088FF]"
            />
          </div>
        </div>

        {bookingRoom && userId && (
          <BookRoomModal room={bookingRoom} userId={userId} onClose={() => setBookingRoom(null)} />
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#0088FF]" />
            <p>Memuat katalog ruangan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.length > 0 ? filteredRooms.map((room) => (
              <div key={room.room_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <img src={FALLBACK_IMG} alt={room.room_name} className="w-full h-48 object-cover" />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{room.room_name}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${room.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{room.location || '-'}</p>
                  <p className="text-xs text-slate-400 mb-4">{room.room_type || '-'}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                    <span className="flex items-center gap-1.5"><Users size={16} className="text-slate-400" /> {room.capacity} Orang</span>
                  </div>
                  <button
                    onClick={() => setBookingRoom(room)}
                    className="mt-auto w-full bg-[#0088FF] text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={room.status !== 'Available'}
                  >
                    {room.status === 'Available' ? 'Book Now' : 'Tidak Tersedia'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 text-center text-slate-500">Ruangan tidak ditemukan.</div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}