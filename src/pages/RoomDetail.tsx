import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../lib/api';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronRight, Users, Layers, Check, 
  Lock, CheckCircle2, ArrowRight, 
  Info, ArrowLeft, ArrowRight as ArrowRightIcon, Home, History
} from 'lucide-react';

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';

  const [room, setRoom] = useState<api.Room | null>(null);
  const [amenities, setAmenities] = useState<api.Amenity[]>([]);
  const [rules, setRules] = useState<api.Rule[]>([]);
  const [reservations, setReservations] = useState<api.Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  
  // State Navigasi Tanggal
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const operationalHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  useEffect(() => {
    if (roomId) fetchRoomDetail();
  }, [roomId]);

  const fetchRoomDetail = async () => {
    setLoading(true);
    try {
      const roomData = await api.getRoomById(roomId!);
      setRoom(roomData);
      if (roomData.room_amenities_map) {
        setAmenities(roomData.room_amenities_map.map(item => ({
          amenity_id: item.amenities.amenity_id,
          amenity_name: item.amenities.amenity_name
        })));
      }
      if (roomData.room_rules_map) {
        setRules(roomData.room_rules_map.map(item => ({
          rule_id: item.rules.rule_id, 
          rule_name: item.rules.rule_name
        })));
      }
      const resData = await api.getReservations({ room_id: Number(roomId) });
      setReservations(resData.filter(r => r.status !== 'Canceled'));
    } catch (error: any) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setSelectedSlot(null);
  };

  const getSlotStatus = (hour: number) => {
    const now = new Date();
    
    // Normalisasi tanggal untuk pembandingan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentSelected = new Date(selectedDate);
    currentSelected.setHours(0, 0, 0, 0);

    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const isToday = dateStr === now.toLocaleDateString('en-CA');

    // 1. Cek Tanggal/Jam Lampau
    if (currentSelected < today || (isToday && hour <= now.getHours())) {
      // Kita tetap cek apakah ada riwayat booking di waktu lampau tersebut
      const wasReserved = reservations.find(res => {
        const start = new Date(res.start_time);
        return start.toLocaleDateString('en-CA') === dateStr && hour === start.getHours();
      });
      return wasReserved ? { status: 'booked', detail: wasReserved, isPast: true } : { status: 'past' };
    }

    // 2. Cek Reservasi Aktif
    const isReserved = reservations.find(res => {
      const start = new Date(res.start_time);
      const end = new Date(res.end_time);
      return start.toLocaleDateString('en-CA') === dateStr && 
             hour >= start.getHours() && 
             hour < end.getHours();
    });

    if (isReserved) return { status: 'booked', detail: isReserved, isPast: false };
    if (selectedSlot === hour) return { status: 'selected' };
    return { status: 'available' };
  };

  // Logika Label Tombol Today Dinamis
  const isSelectedToday = selectedDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');
  const dateLabel = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit' });

  if (loading || !room) return null;

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-6xl mx-auto space-y-8 w-full p-4 md:p-8 font-inter">
        
        {/* Breadcrumbs */}
        <nav className="flex mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link className="text-[12px] font-bold text-slate-500 hover:text-[#006194] uppercase tracking-wider" to="/rooms">User Portal</Link></li>
            <li className="flex items-center"><ChevronRight className="w-4 h-4 text-slate-400 mx-1" /><span className="text-[12px] font-bold text-[#006194] uppercase tracking-wider">Check Availability</span></li>
          </ol>
        </nav>

        {/* Room Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md flex flex-col lg:flex-row">
          <div className="w-full lg:w-[45%] h-64 lg:h-auto overflow-hidden relative bg-slate-100">
            <img className="w-full h-full object-cover" src={room.image_url || ''} alt={room.room_name} />
          </div>
          <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between bg-gradient-to-br from-white to-[#f7f9ff]">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                      {/* Ikon Zap diganti Home */}
                      <Home className="w-5 h-5 text-sky-600" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900">{room.room_name}</h2>
                  <p className="text-sm font-semibold text-sky-600 mt-1 uppercase tracking-wide">{room.room_type || 'General Room'}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-[13px] font-bold border border-green-200 flex items-center shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  Available Now
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Capacity</p>
                  <p className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                    <Users className="w-6 h-6 text-sky-600" />
                    {room.capacity} <span className="text-sm font-medium text-slate-500">People</span>
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                  <p className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                    <Layers className="w-6 h-6 text-sky-600" />
                    {room.location || '-'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                  <p className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                    {/* Ikon Zap diganti Home */}
                    <Home className="w-6 h-6 text-sky-600" />
                    {room.room_type || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-4 flex items-center">
                <span className="w-10 h-px bg-slate-200 mr-3"></span>
                Included Amenities
              </h4>
              <div className="flex flex-wrap gap-3">
                {amenities.map((item) => (
                  <div key={item.amenity_id} className="flex items-center bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-200 transition-all cursor-default group">
                    <Check className="text-sky-500 w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-slate-700">{item.amenity_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Daily Schedule</h3>
              <p className="text-sm text-slate-500 mt-1 capitalize">
                {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button onClick={() => changeDate(-1)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"><ArrowLeft className="w-4 h-4"/></button>
              <button 
                onClick={() => { setSelectedDate(new Date()); setSelectedSlot(null); }}
                className={`px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold transition-all shadow-sm ${isSelectedToday ? 'text-slate-700 bg-white' : 'text-sky-600 bg-sky-50 border-sky-100'}`}
              >
                {isSelectedToday ? 'Today' : dateLabel}
              </button>
              <button onClick={() => changeDate(1)} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"><ArrowRightIcon className="w-4 h-4"/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
            {operationalHours.map(hour => {
              const slot = getSlotStatus(hour);
              const timeString = `${hour.toString().padStart(2, '0')}:00`;

              if (slot.status === 'booked') {
                return (
                  <div key={hour} className="grid grid-cols-[110px_1fr] bg-slate-50 opacity-80">
                    <div className="p-5 border-r border-slate-200 text-slate-400 font-bold text-[12px] flex items-center justify-center">{timeString}</div>
                    <div className="p-4 flex items-center">
                      <div className="w-full h-14 bg-white border border-slate-200 shadow-sm rounded-xl px-5 flex items-center text-slate-500 text-sm font-medium">
                        <History className="w-4 h-4 mr-3 text-slate-300" />
                        <span className="flex-1">{slot.detail?.meeting_title} <span className="text-xs text-slate-400">({slot.detail?.person_in_charge})</span></span>
                        <Lock className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  </div>
                );
              }

              if (slot.status === 'past') {
                return (
                  <div key={hour} className="grid grid-cols-[110px_1fr] bg-slate-50/50">
                    <div className="p-5 border-r border-slate-200 text-slate-300 font-bold text-[12px] flex items-center justify-center">{timeString}</div>
                    <div className="p-4 flex items-center">
                      <div className="w-full h-10 border border-slate-100 rounded-xl flex items-center px-5 text-slate-300 text-xs italic">Waktu sudah berlalu</div>
                    </div>
                  </div>
                );
              }

              const isSelected = slot.status === 'selected';
              return (
                <div 
                  key={hour} 
                  onClick={() => setSelectedSlot(isSelected ? null : hour)}
                  className={`grid grid-cols-[110px_1fr] group transition-colors cursor-pointer ${isSelected ? 'bg-white ring-2 ring-sky-600 ring-inset z-10 relative shadow-lg' : 'bg-white hover:bg-sky-50/40'}`}
                >
                  <div className={`p-5 border-r border-slate-200 font-bold text-[12px] flex items-center justify-center ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}>{timeString}</div>
                  <div className="p-4 flex items-center">
                    {isSelected ? (
                      <div className="w-full h-14 bg-sky-50 border border-sky-100 rounded-xl px-5 flex items-center justify-between text-sky-700 text-sm font-bold">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 mr-3 animate-pulse"></span>Selected Slot</div>
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-full h-10 border border-dashed border-sky-200 rounded-xl flex items-center justify-center text-sky-600/40 text-[11px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Select Time</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Rules Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-8"><h3 className="text-xl font-bold text-slate-900">Room Rules & Guidelines</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
            {rules.map((rule) => (
              <div key={rule.rule_id} className="flex items-start gap-3">
                <CheckCircle2 className="text-sky-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div><p className="text-sm font-semibold text-slate-800">{rule.rule_name}</p><p className="text-xs text-slate-500">Kebijakan resmi ruangan harus dipatuhi.</p></div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-sky-50 rounded-xl border border-sky-100">
            <p className="text-xs text-sky-700 font-medium flex items-center"><Info className="w-4 h-4 mr-2" /> Pelanggaran aturan dapat membatasi hak akses pemesanan di masa mendatang.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center py-12 border-t border-slate-100">
          <button 
            onClick={() => selectedSlot && navigate(`/booking/new?room_id=${roomId}&time=${selectedSlot}&date=${selectedDate.toLocaleDateString('en-CA')}`)}
            disabled={!selectedSlot}
            className={`group w-full max-w-xl py-6 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 flex items-center justify-center ${selectedSlot ? 'bg-[#006194] text-white hover:bg-[#006194]/90 shadow-sky-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            {selectedSlot ? 'Confirm Booking' : 'Select a Time Slot Above'} <ArrowRight className="ml-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;