import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
// Gunakan Lucide Icons agar konsisten
import { ChevronRight, ArrowLeft, MapPin, Users, MonitorPlay, Wifi, Tv, Video, Edit3, CheckCircle } from 'lucide-react';

// Interfaces
interface Room {
  room_id: string;
  room_name: string;
  room_type: string;
  capacity: number;
  location: string;
  image_url: string;
  status: string;
}

const ReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Mengambil Parameter dari URL (dikirim dari RoomDetail)
  const roomIdParam = searchParams.get('room_id');
  const timeParam = searchParams.get('time'); // Contoh: "9" (berarti 09:00)

  // Auth
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State
  const [meetingTitle, setMeetingTitle] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  
  // Konversi timeParam menjadi format yang bisa dimasukkan ke input datetime/time
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  
  // Default waktu mulai dari parameter yang dipilih, default waktu selesai adalah +1 jam
  const defaultStartTime = timeParam ? `${timeParam.padStart(2, '0')}:00` : '09:00';
  const defaultEndTime = timeParam ? `${(parseInt(timeParam) + 1).toString().padStart(2, '0')}:00` : '10:00';
  
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomIdParam) {
        setLoading(false);
        return;
      }
      try {
        const allRooms = await api.getRooms();
        const foundRoom = allRooms.find((r: any) => r.room_id.toString() === roomIdParam);
        if (foundRoom) setRoom(foundRoom as any);
      } catch (err) {
        console.error("Gagal mengambil data ruangan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomIdParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) { setError('Sesi tidak valid. Silakan login kembali.'); return; }
    if (!room) { setError('Data ruangan tidak ditemukan.'); return; }
    if (!meetingTitle.trim()) { setError('Judul rapat wajib diisi.'); return; }
    if (!personInCharge.trim()) { setError('Penanggung jawab wajib diisi.'); return; }

    // Gabungkan Tanggal dan Waktu menjadi ISO String yang valid untuk Supabase TIMESTAMPTZ
    const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('Waktu selesai harus setelah waktu mulai.');
      return;
    }

    setSubmitting(true);
    try {
      await api.createReservation({
        user_id: userId,
        room_id: parseInt(room.room_id), 
        start_time: startDateTime,
        end_time: endDateTime,
        meeting_title: meetingTitle.trim(),
        person_in_charge: personInCharge.trim(),
      });
      
        setShowSuccessModal(true);
      
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat membuat reservasi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout role="user" userName={userName}><div className="p-20 text-center text-slate-500">Memuat formulir...</div></DashboardLayout>;
  if (!room) return <DashboardLayout role="user" userName={userName}><div className="p-20 text-center text-red-500">Ruangan tidak ditemukan atau parameter tidak valid.</div></DashboardLayout>;

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="flex items-center space-x-2 text-slate-500">
            <li><span onClick={() => navigate('/rooms')} className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-blue-600 uppercase transition-colors">Room Catalog</span></li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span onClick={() => navigate(`/rooms/${room.room_id}`)} className="cursor-pointer text-xs font-semibold text-slate-500 hover:text-blue-600 uppercase transition-colors">{room.room_name}</span>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-xs font-semibold text-blue-600 uppercase">Reservation Details</span>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Form */}
          <div className="flex-grow space-y-6">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Reservation Details</h2>
              <p className="text-slate-500 mt-2">Complete the information below to secure your workspace.</p>
            </header>

            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Activity and PIC Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">MEETING TITLE / ACTIVITY NAME</label>
                    <input 
                      required
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      placeholder="e.g. Quarterly Strategic Planning" 
                      type="text"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-2">PERSON IN CHARGE</label>
                    <input 
                      required
                      value={personInCharge}
                      onChange={(e) => setPersonInCharge(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      placeholder="Enter full name" 
                      type="text"
                    />
                  </div>
                </div>

                {/* Date Range Section */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-4">BOOKING DATE RANGE</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] text-slate-400 absolute left-3 top-2 uppercase font-bold">Start Date</label>
                      <input 
                        required
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pt-6 pb-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] text-slate-400 absolute left-3 top-2 uppercase font-bold">End Date</label>
                      <input 
                        required
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pt-6 pb-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-4">BOOKING TIME DURATION</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="text-[10px] text-slate-400 absolute left-3 top-2 uppercase font-bold">Start Time</label>
                      <input 
                        required
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pt-6 pb-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                    <div className="relative">
                      <label className="text-[10px] text-slate-400 absolute left-3 top-2 uppercase font-bold">End Time</label>
                      <input 
                        required
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg pt-6 pb-2 px-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                  <button 
                    type="button" 
                    onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
                    className="w-full sm:w-auto text-slate-500 font-medium hover:text-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Availability
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3.5 px-8 rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Processing...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Room Summary */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden sticky top-24 shadow-sm">
              <div className="h-48 w-full bg-slate-100 relative">
                <img alt={room.room_name} className="w-full h-full object-cover" src={room.image_url || 'https://via.placeholder.com/400x300'} />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    room.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {room.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">{room.room_name}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{room.location || '-'}</span>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Capacity</span>
                    <span className="font-medium text-slate-700">{room.capacity} Persons</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-400">Type</span>
                    <span className="font-medium text-slate-700">{room.room_type || '-'}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-3">ROOM AMENITIES</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Dummy Icons for Summary - Replace with actual map if needed */}
                    <div className="bg-slate-50 p-2 rounded flex items-center gap-1" title="High-speed Wi-Fi"><Wifi className="w-4 h-4 text-slate-400" /></div>
                    <div className="bg-slate-50 p-2 rounded flex items-center gap-1" title="Display"><Tv className="w-4 h-4 text-slate-400" /></div>
                    <div className="bg-slate-50 p-2 rounded flex items-center gap-1" title="Video Conferencing"><Video className="w-4 h-4 text-slate-400" /></div>
                    <div className="bg-slate-50 p-2 rounded flex items-center gap-1" title="Whiteboard"><Edit3 className="w-4 h-4 text-slate-400" /></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
          

          {/* pop up keterangan */}
          {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Background overlay (klik luar untuk tutup) */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => navigate('/rooms-catalog')}
          ></div>
          
          {/* Modal Box */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center transform transition-all scale-100 opacity-100 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Terkirim!</h2>
            <p className="text-slate-500 text-sm mb-8">
              Permintaan reservasi Anda untuk <span className="font-bold text-slate-700">{room.room_name}</span> telah berhasil dikirim dan sedang menunggu persetujuan Admin.
            </p>
            
            <button
              onClick={() => navigate('/rooms')}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReservationForm;