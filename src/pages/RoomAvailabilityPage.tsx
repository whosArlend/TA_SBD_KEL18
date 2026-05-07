import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
import type { Room, Reservation } from '../lib/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  Clock, 
  Plus, 
  MapPin, 
  Check,
  ChevronRight as ChevronRightIcon,
  CalendarDays
} from 'lucide-react';

const PillLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1.5">
    {children}
  </p>
);

const RoomAvailabilityPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [room, setRoom] = useState<any | null>(null);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [reservations, setReservations] = useState<api.Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const roomData = await api.getRoomById(roomId);
        setRoom(roomData);

        if (roomData.room_amenities_map) {
          setAmenities(
            roomData.room_amenities_map.map((item: any) => ({
              amenity_id: item.amenities.amenity_id,
              amenity_name: item.amenities.amenity_name,
            }))
          );
        }

        const resData = await api.getReservations({ room_id: parseInt(roomId) });
        setReservations(resData.filter(res => res.status === 'Approved'));
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toLocaleDateString('en-CA'));
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPosition = (timeStr: string) => {
    const date = new Date(timeStr);
    const totalMinutes = (date.getHours() * 60) + date.getMinutes();
    return (totalMinutes / 1440) * 100;
  };

  const isToday = selectedDate === new Date().toLocaleDateString('en-CA');
  const [currentTimePos, setCurrentTimePos] = useState(getPosition(new Date().toISOString()));

  useEffect(() => {
    if (isToday) {
      const interval = setInterval(() => {
        setCurrentTimePos(getPosition(new Date().toISOString()));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isToday]);

  if (loading || !room) return null;

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-sans antialiased">
        
        <nav className="flex items-center gap-1.5 mb-2">
          <Link to="/rooms" className="text-[12px] font-medium text-slate-400 hover:text-[#006194] uppercase tracking-wider">
            User Portal
          </Link>
          <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[12px] font-medium text-[#006194] uppercase tracking-wider">
            Check Availability
          </span>
        </nav>

        {/* ── Header & New Date Picker Position ── */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <PillLabel>{room.room_type || 'Meeting Room'}</PillLabel>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{room.room_name}</h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                <MapPin size={16} className="text-[#006194]" /> {room.location || '—'}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium border-l pl-4 border-slate-200">
                <Users size={16} className="text-[#006194]" /> {room.capacity} Pax
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
            {/* Tombol Back */}
            <button 
              onClick={() => changeDate(-1)} 
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            {/* Display Tanggal Utama */}
            <div className="flex flex-col items-center px-4 min-w-[140px]">
                <span className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Jadwal Hari</span>
                <span className="font-bold text-slate-800 text-base">
                {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
            </div>

            {/* TOMBOL KALENDER (Terpisah & Mudah Diklik) */}
            <div className="relative">
                <button 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="p-3 bg-sky-50 text-[#006194] rounded-xl hover:bg-[#006194] hover:text-white transition-all shadow-sm"
                    title="Pilih Tanggal Lain"
                >
                    <CalendarDays size={24} />
                </button>
                <input 
                    ref={dateInputRef}
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                />
            </div>

            {/* Tombol Next */}
            <button 
              onClick={() => changeDate(1)} 
              className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </section>

        {/* ── Legend ── */}
        <section className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#006194]" /> <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-dashed border-slate-300" /> <span>Available</span>
          </div>
        </section>

        {/* ── 24-Hour Timeline ── */}
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] relative bg-white"> 
              <div className="grid grid-cols-[120px_1fr] bg-slate-50/50 border-b border-slate-100 sticky top-0 z-20">
                <div className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200 flex items-center justify-center bg-slate-50">Hours</div>
                <div className="flex justify-between px-6">
                  {hours.map(h => (
                    <div key={h} className="p-4 text-[11px] font-bold text-slate-400 w-full text-center">
                        {h.toString().padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-[400px]">
                <div className="absolute inset-0 grid grid-cols-[120px_repeat(24,1fr)] pointer-events-none">
                  <div className="border-r border-slate-200 h-full bg-slate-50/20" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-r border-slate-100 h-full" />
                  ))}
                </div>

                {isToday && (
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none"
                        style={{ left: `calc(120px + ${currentTimePos}%)` }}
                    >
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -ml-1" />
                    </div>
                )}

                <div className="absolute inset-0 ml-[120px] p-8">
                  {reservations
                    .filter(res => {
                        const sel = new Date(selectedDate).setHours(0,0,0,0);
                        const start = new Date(res.start_time).setHours(0,0,0,0);
                        const end = new Date(res.end_time).setHours(0,0,0,0);
                        return sel >= start && sel <= end;
                    })
                    .map((res, i) => {
                      const isStartDay = new Date(res.start_time).toLocaleDateString('en-CA') === selectedDate;
                      const isEndDay = new Date(res.end_time).toLocaleDateString('en-CA') === selectedDate;
                      const leftPos = isStartDay ? getPosition(res.start_time) : 0;
                      const rightPos = isEndDay ? getPosition(res.end_time) : 100;

                      return (
                        <div 
                          key={res.reservation_id}
                          className="absolute bg-[#006194]/10 border-l-4 border-[#006194] rounded-r-lg p-3 shadow-sm"
                          style={{ 
                            left: `${leftPos}%`, 
                            width: `${rightPos - leftPos}%`,
                            top: `${20 + (i * 90)}px`,
                            height: '75px'
                          }}
                        >
                          <p className="text-[10px] font-bold text-[#006194] uppercase flex items-center gap-1.5">
                            <Clock size={10} />
                            {isStartDay ? new Date(res.start_time).getHours().toString().padStart(2, '0') + ':00' : '00:00'} - 
                            {isEndDay ? new Date(res.end_time).getHours().toString().padStart(2, '0') + ':00' : '23:59'}
                          </p>
                          <p className="text-[13px] font-semibold text-slate-800 truncate mt-1">{res.meeting_title}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 italic">PIC: {res.person_in_charge}</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Amenities & CTA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
            <PillLabel>Amenities</PillLabel>
            <div className="flex flex-wrap gap-2 mt-4">
              {amenities.map((item) => (
                <div key={item.amenity_id} className="flex items-center gap-2 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full">
                  <Check className="w-3.5 h-3.5 text-sky-500" />
                  {item.amenity_name}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#006194] rounded-xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg group">
             <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <CalendarIcon size={180} />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3">Tersedia untuk dipesan</h3>
                <p className="text-sky-100 mb-8 max-w-md text-[14px] leading-relaxed">
                  Lihat slot kosong pada timeline dan buat reservasi untuk tanggal yang dipilih.
                </p>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => navigate(`/booking/new?room_id=${room.room_id}&date=${selectedDate}`)}
                        className="bg-white text-[#006194] px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm uppercase tracking-wider"
                    >
                        <Plus size={18} /> Book Now
                    </button>
                    <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-lg font-bold border border-white/20 hover:bg-white/10 transition-all text-sm uppercase tracking-wider">
                        Go Back
                    </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomAvailabilityPage;