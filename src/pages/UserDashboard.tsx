import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from 'lucide-react';
import * as api from '../lib/api';

export default function UserDashboard() {
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;
  const firstName = userName.split(' ')[0];
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  useEffect(() => {
    if (!userId) return;
    const fetchStats = async () => {
      try {
        const all = await api.getReservations({ user_id: userId });
        setStats({
          total: all.length,
          pending: all.filter((r) => r.status === 'Pending').length,
          approved: all.filter((r) => r.status === 'Approved').length,
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
      }
    };
    fetchStats();
  }, [userId]);

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="p-8 max-w-7xl mx-auto">

        {/* Welcome Banner */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 mb-8 flex justify-between items-center bg-gradient-to-r from-white to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back, {firstName}!</h2>
            <p className="text-slate-600 mb-6 max-w-md">
              You have {stats.approved} confirmed booking{stats.approved !== 1 ? 's' : ''}. Start exploring the catalog to find your next meeting space.
            </p>
            <button onClick={() => navigate('/room-catalog')} className="bg-[#0088FF] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition shadow-sm flex items-center gap-2">
              <Calendar size={18} /> Book a Room
            </button>
          </div>
          <div className="hidden md:block opacity-20 text-8xl">🚪</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 tracking-wider mb-2">TOTAL</p>
                <h3 className="text-4xl font-bold text-slate-800 mb-1">{stats.total}</h3>
                <p className="text-sm text-slate-500">All Bookings</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 tracking-wider mb-2">REVIEWING</p>
                <h3 className="text-4xl font-bold text-slate-800 mb-1">{stats.pending}</h3>
                <p className="text-sm text-slate-500">Pending Requests</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 tracking-wider mb-2">VERIFIED</p>
                <h3 className="text-4xl font-bold text-slate-800 mb-1">{stats.approved}</h3>
                <p className="text-sm text-slate-500">Approved Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/my-bookings')} className="text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition">👀 Lihat Status Booking</button>
              <button onClick={() => navigate('/user-activity')} className="text-left px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition">🔔 Cek Notifikasi</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}