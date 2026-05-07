import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Users, Layers, MapPin, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../lib/api';
import type { Room, Reservation } from '../lib/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80';

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';

  const [room, setRoom] = useState<Room | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Schedule date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Selected time slots for booking (supports multiple contiguous slots)
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const roomData = await api.getRoomById(id);
        setRoom(roomData);
        // Note: this fetches all reservations for the room. In a real app, it should be filtered by date.
        // If API allows, we can pass date filter, but let's fetch all and filter in frontend for simplicity
        const resData = await api.getReservations({ room_id: parseInt(id) });
        setReservations(resData);
      } catch (err) {
        console.error('Error fetching room details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Generate hourly slots from 08:00 to 18:00
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
    setSelectedSlots([]);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
    setSelectedSlots([]);
  };

  const handleToday = () => {
    setCurrentDate(newDate => {
      const today = new Date();
      // Only update if it's not today
      if (newDate.toDateString() !== today.toDateString()) {
        setSelectedSlots([]);
      }
      return today;
    });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  // Helper to get reservation for a specific hour on the current date
  const getReservationForSlot = (hour: number) => {
    const slotStart = new Date(currentDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(currentDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return reservations.find(res => {
      // Exclude rejected or canceled reservations from blocking the slot
      if (res.status === 'Rejected' || res.status === 'Canceled') return false;
      
      const resStart = new Date(res.start_time);
      const resEnd = new Date(res.end_time);
      
      // Check for overlap
      return resStart < slotEnd && resEnd > slotStart;
    });
  };

  const handleSlotClick = (hour: number) => {
    if (selectedSlots.length === 0) {
      setSelectedSlots([hour]);
      return;
    }

    const min = Math.min(...selectedSlots);
    const max = Math.max(...selectedSlots);

    if (selectedSlots.includes(hour)) {
      if (hour === min) {
        setSelectedSlots(selectedSlots.filter(s => s !== hour));
      } else if (hour === max) {
        setSelectedSlots(selectedSlots.filter(s => s !== hour));
      } else {
        setSelectedSlots([hour]); // Reset if clicked in the middle
      }
    } else {
      if (hour === min - 1 || hour === max + 1) {
        setSelectedSlots([...selectedSlots, hour].sort((a, b) => a - b));
      } else {
        // Attempt to fill gap
        const newMin = Math.min(min, hour);
        const newMax = Math.max(max, hour);
        let hasOccupied = false;
        
        for (let i = newMin; i <= newMax; i++) {
           const res = getReservationForSlot(i);
           const slotTime = new Date(currentDate);
           slotTime.setHours(i, 0, 0, 0);
           const isPast = slotTime <= new Date();
           if (res || isPast || room?.status !== 'Available') {
             hasOccupied = true;
             break;
           }
        }
        
        if (hasOccupied) {
           setSelectedSlots([hour]); // Fallback to just the clicked hour if gap has obstacles
        } else {
           const newSlots = [];
           for (let i = newMin; i <= newMax; i++) newSlots.push(i);
           setSelectedSlots(newSlots);
        }
      }
    }
  };

  const handleBookSelected = () => {
    if (selectedSlots.length === 0 || !room) return;
    
    const minHour = Math.min(...selectedSlots);
    const maxHour = Math.max(...selectedSlots);

    // Create start and end date objects for the selected slot
    const start = new Date(currentDate);
    start.setHours(minHour, 0, 0, 0);
    
    const end = new Date(currentDate);
    end.setHours(maxHour + 1, 0, 0, 0);
    
    // Pass the selected time to the booking page via state or query params
    navigate(`/book-room/${room.room_id}`, {
      state: {
        startTime: start.toISOString(),
        endTime: end.toISOString()
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0088FF]" />
          <p>Memuat ketersediaan ruangan...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="py-24 text-center text-slate-500">Ruangan tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  const amenities = room.room_amenities_map ?? [];
  const rules = room.room_rules_map ?? [];

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Room Details</h1>
        </div>

        {/* Room Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
          <div className="md:w-1/2 h-64 md:h-auto relative bg-slate-100">
            <img 
              src={room.image_url || FALLBACK_IMG} 
              alt={room.room_name} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} 
            />
          </div>
          <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-slate-900">{room.room_name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${room.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                {room.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Capacity</p>
                <p className="flex items-center gap-2 text-slate-800 font-semibold"><Users size={16} className="text-[#0088FF]"/> {room.capacity} People</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Location</p>
                <p className="flex items-center gap-2 text-slate-800 font-semibold"><MapPin size={16} className="text-[#0088FF]"/> {room.location || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Room Type</p>
                <p className="flex items-center gap-2 text-slate-800 font-semibold"><Layers size={16} className="text-[#0088FF]"/> {room.room_type || '-'}</p>
              </div>
            </div>

            {amenities.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Included Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                      <CheckCircle2 size={14} className="text-[#0088FF]" /> {a.amenities.amenity_name} {a.quantity > 1 ? `(x${a.quantity})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Daily Schedule</h2>
              <p className="text-sm text-slate-500">
                {currentDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                <button onClick={handlePrevDay} className="p-2 hover:bg-white rounded-md transition text-slate-600">
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleToday} 
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${isToday ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Today
                </button>
                <button onClick={handleNextDay} className="p-2 hover:bg-white rounded-md transition text-slate-600">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-6 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></span> Available</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></span> Occupied</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></span> Selected</span>
          </div>

          {/* Timeline Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {hours.map(hour => {
              const res = getReservationForSlot(hour);
              const isSelected = selectedSlots.includes(hour);
              
              // Only allow selecting future or current times if it's today
              const slotTime = new Date(currentDate);
              slotTime.setHours(hour, 0, 0, 0);
              const isPast = slotTime <= new Date();
              
              const isAvailable = !res && !isPast && room.status === 'Available';

              return (
                <div key={hour} className="flex border-b border-slate-100 last:border-0 group">
                  <div className="w-20 shrink-0 py-4 px-4 border-r border-slate-100 flex items-center justify-center text-xs font-semibold text-slate-400 bg-slate-50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  <div className="flex-1 p-2">
                    {res ? (
                      <div className="h-full w-full bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        <div>
                          <p className="text-sm font-semibold text-orange-900">{res.meeting_title || 'Occupied'}</p>
                          <p className="text-xs text-orange-700/70">{res.person_in_charge || 'N/A'}</p>
                        </div>
                      </div>
                    ) : isSelected ? (
                      <div className="h-full w-full bg-blue-50 border-2 border-[#0088FF] rounded-lg p-3 flex items-center gap-3 cursor-pointer"
                           onClick={() => handleSlotClick(hour)}>
                        <CheckCircle2 size={16} className="text-[#0088FF]" />
                        <p className="text-sm font-semibold text-[#0088FF]">Your Selection</p>
                      </div>
                    ) : (
                      <div 
                        onClick={() => isAvailable && handleSlotClick(hour)}
                        className={`h-full w-full rounded-lg p-3 flex items-center transition ${isAvailable ? 'cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200' : 'bg-slate-50/50 text-slate-400'}`}
                      >
                        {isPast ? (
                          <p className="text-xs italic text-slate-400">Time has passed</p>
                        ) : room.status !== 'Available' ? (
                          <p className="text-xs italic text-slate-400">Room not available</p>
                        ) : (
                          <p className="text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition">Click to select</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules & Action */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 mb-1">Room Rules & Guidelines</h3>
            <p className="text-sm text-slate-500">Please ensure adherence to these policies for a better experience.</p>
          </div>
          
          {rules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {rules.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-sm text-slate-600">{r.rules.rule_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-8">No specific rules defined for this room.</p>
          )}

          <div className="bg-blue-50 text-blue-800 text-xs font-medium px-4 py-3 rounded-lg mb-6">
            <span className="font-bold">Note:</span> Failure to follow room rules may result in restricted booking privileges.
          </div>

          <button 
            onClick={handleBookSelected}
            disabled={selectedSlots.length === 0}
            className="w-full md:w-auto md:px-12 py-3.5 bg-[#0088FF] text-white rounded-xl font-bold hover:bg-blue-600 transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mx-auto block"
          >
            {selectedSlots.length === 0 
              ? 'Select an available time slot above' 
              : `Book This Room for ${selectedSlots.length} hour${selectedSlots.length > 1 ? 's' : ''}`}
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}
