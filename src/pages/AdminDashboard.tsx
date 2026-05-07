import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  CalendarCheck, 
  CalendarClock, 
  ChevronLeft, 
  ChevronRight, 
  History, 
  Users,
  CheckCheck,
  XCircle,
  Clock,
  Search
} from 'lucide-react';
import * as api from '../lib/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [rooms, setRooms] = useState<api.Room[]>([]);
  const [reservations, setReservations] = useState<api.Reservation[]>([]);
  const [stats, setStats] = useState({ rooms: 0, activeBookings: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK SEARCH & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;

  const getDaysInWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toLocaleDateString('en-CA');
    });
  };

  const weekDays = getDaysInWeek();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [roomsData, allResData] = await Promise.all([
          api.getRooms(),
          api.getReservations(),
        ]);

        const activeRooms = roomsData.filter((r) => r.archived_at === null);
        const pending = allResData.filter(r => r.status === 'Pending');
        const approved = allResData.filter(r => r.status === 'Approved');

        setRooms(activeRooms);
        setReservations(allResData);
        setStats({
          rooms: activeRooms.length,
          activeBookings: approved.length,
          pending: pending.length,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- LOGIKA FILTER SEARCH ---
  const filteredRooms = rooms.filter(room => 
    room.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- LOGIKA PAGINATION ---
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto w-full font-inter text-sm antialiased">
        <div className="mb-8">
          <h1 className="text-[30px] font-bold text-slate-900 leading-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-base">Monitoring real-time operational capacity and pending actions.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#cce5ff] rounded-lg"><Building2 className="text-[#006194]" size={24} /></div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Rooms</p>
            <h3 className="text-[30px] font-bold text-slate-900 mt-1">{stats.rooms}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#ffdcc0] rounded-lg"><CalendarCheck className="text-[#894d00]" size={24} /></div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Active Bookings</p>
            <h3 className="text-[30px] font-bold text-slate-900 mt-1">{stats.activeBookings}</h3>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#ffdad6] rounded-lg"><CalendarClock className="text-[#ba1a1a]" size={24} /></div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Pending Requests</p>
            <h3 className="text-[30px] font-bold text-slate-900 mt-1">{stats.pending}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Schedule Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Room Schedule</h3>
                  <p className="text-sm text-slate-500">Weekly operational overview</p>
                </div>

                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006194] transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search room name..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#006194]/20 focus:bg-white outline-none w-48 md:w-64 transition-all"
                  />
                </div>
              </div>
              
                <div className="overflow-x-auto custom-scrollbar"> 
                  <table className="w-full text-left border-collapse min-w-[1200px]"> 
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                        {/* Kolom Room dibuat tetap (sticky) agar saat di-slide nama ruangan tetap kelihatan */}
                        <th className="p-4 border-b border-slate-100 w-48 sticky left-0 bg-slate-50 z-10">Room</th>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                          <th key={day} className="p-4 border-b border-slate-100 text-center">
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {currentRooms.length > 0 ? (
                        currentRooms.map((room) => (
                          <tr key={room.room_id} className="group hover:bg-slate-50 transition-colors">
                            {/* Kolom Room Nama juga dibuat sticky agar tetap terlihat saat slide */}
                            <td className="p-4 border-b border-slate-50 font-bold text-slate-900 align-top sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              {room.room_name}
                            </td>
                            
                              {weekDays.map(date => (
                                <td key={date} className="p-2 border-b border-slate-50 align-top min-w-[150px] w-[150px]">
                                  <div className="flex flex-col gap-2">
                                    {reservations
                                      .filter(res => {
                                        // 1. Pastikan Room ID cocok
                                        if (res.room_id !== room.room_id || res.status !== 'Approved') return false;

                                        // 2. Buat objek tanggal untuk perbandingan
                                        // Kita set jam ke 00:00 agar perbandingan tanggal murni (tanpa pengaruh jam)
                                        const columnDate = new Date(date).setHours(0,0,0,0);
                                        const startDate = new Date(res.start_time).setHours(0,0,0,0);
                                        const endDate = new Date(res.end_time).setHours(0,0,0,0);

                                        // 3. Cek apakah tanggal kolom berada di dalam rentang booking
                                        return columnDate >= startDate && columnDate <= endDate;
                                      })
                                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                                      .map((dailyBooking, index) => {
                                        // Cek apakah ini hari pertama atau bukan untuk tampilan jam
                                        const isFirstDay = new Date(dailyBooking.start_time).toLocaleDateString('en-CA') === date;
                                        const isLastDay = new Date(dailyBooking.end_time).toLocaleDateString('en-CA') === date;

                                        return (
                                          <div key={index} className="bg-[#007bb9]/10 border-l-4 border-[#006194] p-2 rounded-r-md shadow-sm">
                                            <p className="text-[9px] font-bold text-[#006194] leading-tight mb-1">
                                              {dailyBooking.meeting_title}
                                            </p>
                                            <p className="text-[8px] text-[#006194]/70 font-medium">
                                              {/* Jika hari pertama tampilkan jam mulai, jika hari terakhir tampilkan jam selesai */}
                                              {isFirstDay ? new Date(dailyBooking.start_time).getHours().toString().padStart(2, '0') : '00'}:00 - 
                                              {isLastDay ? new Date(dailyBooking.end_time).getHours().toString().padStart(2, '0') : '23'}:59
                                            </p>
                                          </div>
                                        );
                                      })
                                    }
                                  </div>
                                </td>
                              ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-10 text-center text-slate-400 italic">No rooms found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              {/* Pagination Nomor Halaman */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="text-[11px] text-slate-500 font-medium">
                  Showing {filteredRooms.length > 0 ? indexOfFirstRoom + 1 : 0} to {Math.min(indexOfLastRoom, filteredRooms.length)} of {filteredRooms.length} rooms
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[28px] h-7 px-2 rounded-md text-[11px] font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-[#006194] text-white shadow-sm shadow-blue-900/20' 
                          : 'text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1.5 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
              <History className="text-slate-400" size={20} />
            </div>
            <div className="space-y-6 flex-1">
              {reservations.slice(0, 5).map((res) => (
                <div key={res.reservation_id} className="flex gap-4 group">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    res.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
                    res.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {res.status === 'Pending' ? <Clock size={18} /> : 
                     res.status === 'Approved' ? <CheckCheck size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-bold truncate w-40">
                      {res.status} Booking: {res.rooms?.room_name || 'Room'}
                    </p>
                    <p className="text-[12px] text-slate-500 font-medium">
                      By {res.users?.full_name || 'User'} • {new Date(res.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/activity-feed')} 
              className="mt-8 w-full py-3 text-[#006194] text-xs font-bold hover:bg-slate-50 border-t border-slate-100 transition-colors uppercase tracking-widest"
            >
              View All Recent Activity
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}