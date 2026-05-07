import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
import type { Room } from '../lib/api';
import { 
  Search, 
  ChevronRight, 
  Users, 
  Monitor, 
  Calendar, 
  User, 
  Clock, 
  Lock, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const QuickBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id;

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allReservations, setAllReservations] = useState<api.Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Status Validasi Waktu
  const [isTimeSlotTaken, setIsTimeSlotTaken] = useState(false);
  const [isPastTime, setIsPastTime] = useState(false);

  // Form States
  const [meetingTitle, setMeetingTitle] = useState('');
  // Ubah state ini agar bisa diisi bebas (default tetap nama user login)
  const [picName, setPicName] = useState(userName); 
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, resData] = await Promise.all([
          api.getRooms(),
          api.getReservations()
        ]);
        
        const activeRooms = roomsData.filter((r) => r.status === 'Available' && r.archived_at === null);
        
        setRooms(activeRooms);
        setAllReservations(resData.filter((r: any) => r.status !== 'Canceled'));
        
        if (activeRooms.length > 0) setSelectedRoom(activeRooms[0]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!startDate || !startTime || !endDate || !endTime || !selectedRoom) return;

    const checkValidation = () => {
      const now = new Date();
      const newStart = new Date(`${startDate}T${startTime}:00`);
      const newEnd = new Date(`${endDate}T${endTime}:00`);

      if (newStart < now) {
        setIsPastTime(true);
        setIsTimeSlotTaken(false);
        return;
      } else {
        setIsPastTime(false);
      }

      const hasOverlap = allReservations.some(res => {
        if (res.room_id !== selectedRoom.room_id) return false;
        const existStart = new Date(res.start_time).getTime();
        const existEnd = new Date(res.end_time).getTime();
        return newStart.getTime() < existEnd && newEnd.getTime() > existStart;
      });

      setIsTimeSlotTaken(hasOverlap);
    };

    checkValidation();
  }, [startDate, startTime, endDate, endTime, selectedRoom, allReservations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isPastTime) {
        setError('Waktu mulai tidak boleh di masa lalu.');
        return;
    }
    if (isTimeSlotTaken) {
        setError('Ruangan sudah dipesan pada jam tersebut.');
        return;
    }
    if (new Date(`${endDate}T${endTime}`) <= new Date(`${startDate}T${startTime}`)) {
        setError('Waktu selesai harus setelah waktu mulai.');
        return;
    }

    if (!selectedRoom || !userId) return;

    setSubmitting(true);
    try {
      await api.createReservation({
        user_id: userId,
        room_id: selectedRoom.room_id,
        start_time: new Date(`${startDate}T${startTime}:00`).toISOString(),
        end_time: new Date(`${endDate}T${endTime}:00`).toISOString(),
        meeting_title: meetingTitle.trim(),
        person_in_charge: picName.trim() // Gunakan picName hasil input
      });

      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.message || "Gagal membuat reservasi.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="min-h-screen bg-[#f7f9ff] font-inter antialiased">
        <div className="p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
          
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Dashboard</span>
            <ChevronRight size={16} />
            <span className="text-[#006194] font-bold">Quick Booking Flow</span>
          </div>

          <h2 className="text-3xl font-bold text-[#006194]">Quick Booking</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Room Selection */}
            <section className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Step 1: Select Your Room</h3>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006194] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-slate-400 animate-pulse">Memuat ruangan tersedia...</div>
                ) : filteredRooms.length > 0 ? filteredRooms.map((room) => (
                  <div 
                    key={room.room_id}
                    onClick={() => setSelectedRoom(room)}
                    className={`bg-white rounded-xl p-4 shadow-sm transition-all cursor-pointer group relative overflow-hidden border-2 ${
                      selectedRoom?.room_id === room.room_id ? 'border-[#006194] ring-4 ring-sky-500/10' : 'border-transparent hover:border-slate-200'
                    }`}
                  >
                    {selectedRoom?.room_id === room.room_id && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-[#006194] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} fill="currentColor" /> Selected
                        </span>
                      </div>
                    )}
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-slate-100">
                      <img src={room.image_url || ''} alt={room.room_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-lg font-bold text-slate-900">{room.room_name}</h4>
                      <div className="flex items-center gap-4 text-slate-500 text-xs">
                        <span className="flex items-center gap-1"><Users size={14} /> {room.capacity} Pax</span>
                        <span className="flex items-center gap-1"><Monitor size={14} /> {room.room_type}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                    <div className="col-span-full py-10 text-center text-slate-400 italic">Tidak ada ruangan tersedia saat ini.</div>
                )}
              </div>
            </section>

            {/* RIGHT: Reservation Form */}
            <aside className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="text-[#006194]" size={20} /> Step 2: Reservation Details
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Meeting Title / Activity Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Weekly Strategy Sync"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006194] outline-none"
                    />
                  </div>

                  {/* UPDATE: Bagian Penanggung Jawab */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Penanggung Jawab (PIC)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="text"
                        placeholder="Nama penanggung jawab..."
                        value={picName}
                        onChange={(e) => setPicName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#006194] outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Start Date</label>
                      <input 
                        required 
                        type="date" 
                        min={todayStr}
                        value={startDate} 
                        onChange={(e) => {setStartDate(e.target.value); setEndDate(e.target.value);}} 
                        className="w-full px-3 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#006194]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">End Date</label>
                      <input required type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#006194]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Start Time</label>
                      <input 
                        required 
                        type="time" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        className={`w-full px-3 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#006194] ${isPastTime || isTimeSlotTaken ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">End Time</label>
                      <input 
                        required 
                        type="time" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        className={`w-full px-3 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#006194] ${isPastTime || isTimeSlotTaken ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`} 
                      />
                    </div>
                  </div>

                  {(isTimeSlotTaken || isPastTime) && (
                    <div className="flex items-center gap-2 text-rose-600 text-[11px] font-bold uppercase tracking-widest p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <AlertCircle size={14} /> 
                        {isPastTime ? 'Waktu sudah berlalu' : 'Jadwal bentrok dengan user lain'}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-100 mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Selected Room:</span>
                      <span className="font-bold text-slate-900">{selectedRoom?.room_name || '-'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Location:</span>
                      <span className="font-bold text-slate-900">{selectedRoom?.location}</span>
                    </div>
                  </div>

                  {error && <div className="text-rose-600 text-xs font-bold text-center">{error}</div>}

                  <button 
                    type="submit" 
                    disabled={submitting || isTimeSlotTaken || isPastTime || !selectedRoom}
                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                        (isTimeSlotTaken || isPastTime || !selectedRoom) ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#006194] hover:bg-[#004b73]'
                    }`}
                  >
                    <Lock size={18} fill="currentColor" /> {submitting ? 'Memproses...' : 'Confirm Reservation'}
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuickBookingPage;