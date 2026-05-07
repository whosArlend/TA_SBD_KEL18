import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
import { ChevronRight, ArrowLeft, MapPin, Users, CheckCircle, AlertCircle, Home, Clock } from 'lucide-react';

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
  
  const roomIdParam = searchParams.get('room_id');
  const timeParam = searchParams.get('time'); 
  const dateParam = searchParams.get('date');

  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;

  const [room, setRoom] = useState<Room | null>(null);
  const [existingReservations, setExistingReservations] = useState<api.Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Status Validasi Waktu
  const [isTimeSlotTaken, setIsTimeSlotTaken] = useState(false);
  const [isPastTime, setIsPastTime] = useState(false);

  const [meetingTitle, setMeetingTitle] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  
  // Batas minimum tanggal (Hari ini)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const initialDate = dateParam || todayStr;
  
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(initialDate);
  
  const defaultStartTime = timeParam ? `${timeParam.padStart(2, '0')}:00` : '09:00';
  const defaultEndTime = timeParam ? `${(parseInt(timeParam) + 1).toString().padStart(2, '0')}:00` : '10:00';
  
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomIdParam) {
        setLoading(false);
        return;
      }
      try {
        const allRooms = await api.getRooms();
        const foundRoom = allRooms.find((r: any) => r.room_id.toString() === roomIdParam);
        if (foundRoom) setRoom(foundRoom as any);

        const resData = await api.getReservations({ room_id: parseInt(roomIdParam) });
        setExistingReservations(resData.filter((r: any) => r.status !== 'Canceled'));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomIdParam]);

  // Logika Cek Validasi Waktu (Bentrok vs Lampau)
  useEffect(() => {
    if (!startDate || !startTime || !endDate || !endTime) return;

    const checkValidation = () => {
      const now = new Date();
      const newStart = new Date(`${startDate}T${startTime}:00`);
      const newEnd = new Date(`${endDate}T${endTime}:00`);

      // 1. Cek apakah waktu sudah lewat
      if (newStart < now) {
        setIsPastTime(true);
        setIsTimeSlotTaken(false);
        return;
      } else {
        setIsPastTime(false);
      }

      // 2. Cek apakah bentrok dengan reservasi lain
      const hasOverlap = existingReservations.some(res => {
        const existStart = new Date(res.start_time).getTime();
        const existEnd = new Date(res.end_time).getTime();
        return newStart.getTime() < existEnd && newEnd.getTime() > existStart;
      });

      setIsTimeSlotTaken(hasOverlap);
    };

    checkValidation();
  }, [startDate, startTime, endDate, endTime, existingReservations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isPastTime) {
      setError('Tidak dapat memproses: Waktu mulai sudah berlalu.');
      return;
    }

    if (isTimeSlotTaken) {
      setError('Jadwal yang Anda pilih sudah terisi oleh user lain.');
      return;
    }

    if (!userId || !room) return;

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

  if (loading) return <DashboardLayout role="user" userName={userName}><div className="p-20 text-center font-bold text-slate-400 italic animate-pulse">Memuat Formulir...</div></DashboardLayout>;
  if (!room) return <DashboardLayout role="user" userName={userName}><div className="p-20 text-center text-rose-500 font-bold uppercase">Ruangan Tidak Ditemukan</div></DashboardLayout>;

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-inter">
        
        {/* Breadcrumbs */}
        <nav className="flex mb-6">
          <ol className="flex items-center space-x-2 text-slate-500">
            <li><span onClick={() => navigate('/rooms')} className="cursor-pointer text-xs font-bold hover:text-[#006194] uppercase tracking-wider transition-colors">Room Catalog</span></li>
            <li className="flex items-center"><ChevronRight className="w-4 h-4 mx-1" /><span className="text-xs font-bold text-[#006194] uppercase tracking-wider">Reservation Details</span></li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <header className="mb-8">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Reservation Details</h2>
              <p className="text-slate-500 mt-2">Lengkapi detail kegiatan untuk melakukan pemesanan ruangan.</p>
            </header>

            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Meeting Title / Activity</label>
                    <input required value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium" placeholder="e.g. Quarterly Strategic Meeting" type="text" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Person In Charge (PIC)</label>
                    <input required value={personInCharge} onChange={(e) => setPersonInCharge(e.target.value)} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium" placeholder="Enter full name" type="text" />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-4 text-center md:text-left">Date & Time Selection</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="text-[10px] text-slate-400 absolute left-4 top-2 uppercase font-black">Booking Date</label>
                      <input 
                        required 
                        type="date" 
                        min={todayStr}
                        value={startDate} 
                        onChange={(e) => {setStartDate(e.target.value); setEndDate(e.target.value);}} 
                        className="w-full border border-slate-200 rounded-xl pt-7 pb-3 px-4 outline-none focus:border-sky-500 font-bold text-slate-700" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <label className="text-[10px] text-slate-400 absolute left-4 top-2 uppercase font-black">Start Time</label>
                            <input 
                              required 
                              type="time" 
                              value={startTime} 
                              onChange={(e) => setStartTime(e.target.value)} 
                              className={`w-full border rounded-xl pt-7 pb-3 px-4 outline-none font-bold ${isPastTime || isTimeSlotTaken ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'}`} 
                            />
                        </div>
                        <div className="relative">
                            <label className="text-[10px] text-slate-400 absolute left-4 top-2 uppercase font-black">End Time</label>
                            <input 
                              required 
                              type="time" 
                              value={endTime} 
                              onChange={(e) => setEndTime(e.target.value)} 
                              className={`w-full border rounded-xl pt-7 pb-3 px-4 outline-none font-bold ${isPastTime || isTimeSlotTaken ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-700'}`} 
                            />
                        </div>
                    </div>
                  </div>

                  {/* Feedback Status Waktu */}
                  {(isTimeSlotTaken || isPastTime) && (
                    <div className="mt-4 flex items-center gap-2 text-rose-600 text-[11px] font-bold uppercase tracking-widest p-3 bg-rose-50 rounded-lg border border-rose-100">
                        <AlertCircle className="w-4 h-4" /> 
                        {isPastTime ? 'Waktu sudah berlalu' : 'Jadwal sudah terisi oleh user lain'}
                    </div>
                  )}
                </div>

                {error && <div className="p-4 bg-rose-100 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}

                <div className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
                  <button type="button" onClick={() => navigate(-1)} className="text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors flex items-center gap-2 uppercase tracking-widest"><ArrowLeft className="w-4 h-4" /> Back to Availability</button>
                  <button 
                    type="submit" 
                    disabled={submitting || isTimeSlotTaken || isPastTime}
                    className={`w-full sm:w-auto font-bold py-4 px-12 rounded-2xl transition-all shadow-xl active:scale-95 ${isTimeSlotTaken || isPastTime ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-[#006194] text-white hover:bg-[#004b73] shadow-sky-900/20'}`}
                  >
                    {submitting ? 'Processing...' : isPastTime ? 'Waktu Berlalu' : isTimeSlotTaken ? 'Jadwal Bentrok' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Room Summary Card */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden sticky top-24 shadow-sm">
              <div className="h-48 w-full bg-slate-100">
                <img className="w-full h-full object-cover" src={room.image_url || ''} alt={room.room_name} />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-sky-50 rounded-lg"><Home size={16} className="text-sky-600"/></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Room</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{room.room_name}</h3>
                <div className="flex items-center gap-2 text-slate-500 mt-2 text-sm"><MapPin className="w-4 h-4 text-sky-500" /> {room.location}</div>
                
                <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2"><Users size={14}/> Capacity</span>
                    <span className="font-extrabold text-slate-700">{room.capacity} Persons</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2"><Clock size={14}/> Room Type</span>
                    <span className="font-extrabold text-slate-700">{room.room_type}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                <div className="relative bg-white rounded-[40px] shadow-2xl p-12 w-full max-w-sm text-center animate-in zoom-in-95 duration-300">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-emerald-50 mb-8">
                        <CheckCircle className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Booking Sent!</h2>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                        Permintaan reservasi Anda untuk <span className="font-bold text-slate-800">{room.room_name}</span> telah berhasil dibuat dan menunggu persetujuan.
                    </p>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="w-full bg-[#006194] text-white font-bold py-5 rounded-[20px] hover:bg-[#004b73] transition-all shadow-xl shadow-sky-900/20 active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Back to Catalog
                    </button>
                </div>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReservationForm;