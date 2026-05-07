import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../lib/api';
// --- IMPORT LAYOUT & AUTH ---
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
// --- IMPORT LUCIDE ICONS ---
import { ChevronRight, Users, Layers, MonitorPlay, Check, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

// --- Tipe Data TypeScript ---
interface Room {
  room_id: string;
  room_name: string;
  room_type: string;
  capacity: number;
  location: string;
  image_url: string;
  status: string;
}

interface Amenity {
  amenity_name: string;
}

interface Rule {
  rule_name: string;
}

interface Reservation {
  start_time: string;
  end_time: string;
  meeting_title: string;
  person_in_charge: string;
}

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  // --- AUTH UNTUK NAVBAR PADA LAYOUT ---
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';

  const [room, setRoom] = useState<Room | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Jam operasional ruangan (08:00 - 17:00)
  const operationalHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  useEffect(() => {
    if (roomId) fetchRoomDetail();
  }, [roomId]);

  const fetchRoomDetail = async () => {
      setLoading(true);
      try {
        const allRooms = await api.getRooms();
        const roomData = allRooms.find((r: any) => r.room_id.toString() === roomId);

        if (!roomData) {
          setRoom(null);
          setLoading(false);
          return;
        }
        
        setRoom(roomData as any);
        setAmenities([]);
        setRules([]);
        setReservations([]);

      } catch (error: any) {
        console.error("Error fetching room details:", error.message);
      } finally {
        setLoading(false);
      }
    };

  const handleBooking = () => {
    if (!selectedSlot) return;
    navigate(`/booking/new?room_id=${roomId}&time=${selectedSlot}`);
  };

  const getSlotStatus = (hour: number) => {
    const isReserved = reservations.find(res => {
      const startHour = new Date(res.start_time).getHours();
      const endHour = new Date(res.end_time).getHours();
      return hour >= startHour && hour < endHour;
    });

    if (isReserved) return { status: 'booked', detail: isReserved };
    if (selectedSlot === hour) return { status: 'selected' };
    return { status: 'available' };
  };

  // State Loading / Not Found juga perlu dibungkus Layout agar Navbar tidak hilang saat proses fetch
  if (loading) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="flex items-center justify-center py-40 text-slate-500 font-medium">Loading Room Details...</div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="flex flex-col items-center justify-center py-40 text-slate-500 font-medium">
          <p>Room Not Found</p>
          <Link to="/rooms" className="text-blue-600 hover:underline mt-4 text-sm">Kembali ke Katalog</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    // --- BUNGKUS DENGAN DASHBOARD LAYOUT ---
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-6xl mx-auto space-y-8 w-full p-4 md:p-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex mb-6">
          <ol className="flex items-center space-x-2 text-slate-500">
            <li><Link className="text-xs font-semibold text-slate-500 hover:text-blue-600 uppercase transition-colors" to="/rooms">Room Catalog</Link></li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1" />
              <span className="text-xs font-semibold text-blue-600 uppercase">{room.room_name}</span>
            </li>
          </ol>
        </nav>

        {/* Room Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row">
          <div className="w-full lg:w-[45%] h-64 lg:h-auto overflow-hidden relative bg-slate-100">
            <img className="w-full h-full object-cover" src={room.image_url || 'https://via.placeholder.com/600x400?text=No+Image'} alt={room.room_name} />
          </div>
          <div className="p-8 lg:p-10 flex-1 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/50">
            <div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">{room.room_name}</h2>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border flex items-center shadow-sm ${
                  room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  room.status === 'Maintenance' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                  'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${room.status === 'Available' ? 'bg-emerald-500' : room.status === 'Maintenance' ? 'bg-rose-500' : 'bg-orange-500'}`}></span>
                  {room.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                <div className="flex items-center group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <Users className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Capacity</p>
                    <p className="text-lg font-bold text-slate-700">{room.capacity} People</p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <Layers className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location</p>
                    <p className="text-lg font-bold text-slate-700">{room.location || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center group">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
                    <MonitorPlay className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                    <p className="text-lg font-bold text-slate-700">{room.room_type || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 mb-4 flex items-center">
                <span className="w-8 h-px bg-slate-200 mr-3"></span>
                Included Amenities
              </h4>
              <div className="flex flex-wrap gap-3">
                {amenities.length > 0 ? amenities.map((item, index) => (
                  <div key={index} className="flex items-center bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
                    <Check className="text-blue-600 w-4 h-4 mr-2" />
                    <span className="text-sm font-semibold text-slate-700">{item.amenity_name}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 italic">No special amenities listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Daily Schedule</h3>
              <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
            {operationalHours.map(hour => {
              const slotData = getSlotStatus(hour);
              const timeString = `${hour.toString().padStart(2, '0')}:00`;

              if (slotData.status === 'booked') {
                return (
                  <div key={hour} className="grid grid-cols-[110px_1fr] bg-slate-50">
                    <div className="p-5 border-r border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center">{timeString}</div>
                    <div className="p-4 flex items-center">
                      <div className="w-full h-14 bg-white border border-slate-200 shadow-sm rounded-xl px-5 flex items-center text-slate-600 text-sm font-medium">
                        <Lock className="w-4 h-4 mr-3 text-slate-400" />
                        {slotData.detail?.meeting_title} ({slotData.detail?.person_in_charge})
                      </div>
                    </div>
                  </div>
                );
              }

              if (slotData.status === 'selected') {
                return (
                  <div key={hour} onClick={() => setSelectedSlot(null)} className="grid grid-cols-[110px_1fr] bg-white ring-2 ring-blue-500 ring-inset z-10 relative shadow-lg cursor-pointer">
                    <div className="p-5 border-r border-slate-200 text-blue-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center">{timeString}</div>
                    <div className="p-4 flex items-center">
                      <div className="w-full h-14 bg-blue-50 border border-blue-200 rounded-xl px-5 flex items-center justify-between text-blue-700 text-sm font-bold">
                        <div className="flex items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-3 animate-pulse"></span>
                          Your Selection
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={hour} onClick={() => setSelectedSlot(hour)} className="grid grid-cols-[110px_1fr] bg-white group hover:bg-blue-50/50 transition-colors cursor-pointer">
                  <div className="p-5 border-r border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center group-hover:text-blue-500 transition-colors">{timeString}</div>
                  <div className="p-4 flex items-center">
                    <div className="w-full h-10 bg-blue-50/50 border border-blue-200 border-dashed rounded-xl flex items-center justify-center text-blue-600/70 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Select Time Slot</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout/Book Action */}
        <div className="flex flex-col items-center py-8">
          <button 
            onClick={handleBooking}
            disabled={!selectedSlot}
            className={`group w-full max-w-xl py-4 md:py-5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center relative ${selectedSlot ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            <span className="relative z-10 flex items-center">
              {selectedSlot ? 'Book This Room' : 'Select a Time Slot First'} 
              <ArrowRight className={`w-5 h-5 ml-3 transition-transform ${selectedSlot ? 'group-hover:translate-x-1' : ''}`} />
            </span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;