import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import * as api from '../lib/api';
import type { Room } from '../lib/api';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80';

export default function BookRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [meetingTitle, setMeetingTitle] = useState('');
  const [personInCharge, setPersonInCharge] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      setIsLoading(true);
      try {
        const roomData = await api.getRoomById(roomId);
        setRoom(roomData);
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    // Pre-fill form from location state if available
    if (location.state && location.state.startTime && location.state.endTime) {
      const s = new Date(location.state.startTime);
      const e = new Date(location.state.endTime);
      
      // Format to YYYY-MM-DD
      const formatDate = (d: Date) => {
        const offset = d.getTimezoneOffset();
        const date = new Date(d.getTime() - (offset*60*1000));
        return date.toISOString().split('T')[0];
      };
      
      // Format to HH:MM
      const formatTime = (d: Date) => {
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      };

      setStartDate(formatDate(s));
      setEndDate(formatDate(e));
      setStartTime(formatTime(s));
      setEndTime(formatTime(e));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!userId || !room) {
      setError('Invalid session or room data.');
      return;
    }

    if (!meetingTitle.trim() || !personInCharge.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    // Construct full datetime
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createReservation({
        user_id: userId,
        room_id: room.room_id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        meeting_title: meetingTitle.trim(),
        person_in_charge: personInCharge.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0088FF]" />
          <p>Memuat detail reservasi...</p>
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

  if (success) {
    return (
      <DashboardLayout role="user" userName={userName}>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reservation Submitted!</h1>
          <p className="text-slate-500 text-center max-w-md">Your request for <span className="font-semibold">{room.room_name}</span> has been submitted and is pending admin approval. Redirecting to your bookings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Reservation Details</h1>
          <p className="text-sm text-slate-500">Lengkapi informasi di bawah ini untuk mengamankan ruanganmu.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Title / Activity Name</label>
                <input 
                  type="text" 
                  value={meetingTitle} 
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Quarterly Strategic Planning" 
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Person in Charge</label>
                <input 
                  type="text" 
                  value={personInCharge} 
                  onChange={(e) => setPersonInCharge(e.target.value)}
                  placeholder="Enter full name" 
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15"
                />
              </div>

              <hr className="border-slate-100" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Time</label>
                  <input 
                    type="time" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15 text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Time</label>
                  <input 
                    type="time" 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0088FF] focus:ring-4 focus:ring-[#0088FF]/15 text-slate-700"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium border border-rose-200">
                  {error}
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm transition"
                >
                  <ArrowLeft size={16} /> Back to Availability
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#0088FF] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-[#0088FF]/20"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Confirm Reservation
                </button>
              </div>

            </form>
          </div>

          {/* Room Summary Card */}
          <div className="lg:w-80 shrink-0 h-max bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-40 bg-slate-100 relative">
              <img 
                src={room.image_url || FALLBACK_IMG} 
                alt={room.room_name} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }} 
              />
              <div className="absolute top-4 right-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${room.status === 'Available' ? 'bg-emerald-400 text-white shadow-sm' : 'bg-orange-400 text-white shadow-sm'}`}>
                  {room.status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-lg text-slate-900 mb-1">{room.room_name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> {room.location || '-'}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Capacity</span>
                  <span className="font-semibold text-slate-700">{room.capacity} Persons</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Type</span>
                  <span className="font-semibold text-slate-700">{room.room_type || '-'}</span>
                </div>
              </div>

              {room.room_amenities_map && room.room_amenities_map.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Room Amenities</p>
                  <div className="flex flex-col gap-2">
                    {room.room_amenities_map.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle2 size={16} className="text-[#0088FF]" /> 
                        <span>{a.amenities.amenity_name} {a.quantity > 1 ? `(x${a.quantity})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
