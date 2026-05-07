import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Building2, CalendarCheck, CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import * as api from '../lib/api';

export default function AdminDashboard() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [stats, setStats] = useState({ rooms: 0, activeBookings: 0, pending: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rooms, pending, approved] = await Promise.all([
          api.getRooms(),
          api.getReservations({ status: 'Pending' }),
          api.getReservations({ status: 'Approved' }),
        ]);
        setStats({
          rooms: rooms.filter((r) => r.archived_at === null).length,
          activeBookings: approved.length,
          pending: pending.length,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-500 text-[15px]">Monitoring real-time operational capacity and pending actions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Building2 size={24} /></div>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Total Rooms (Active)</p>
              <h2 className="text-4xl font-bold text-slate-900">{stats.rooms}</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><CalendarCheck size={24} /></div>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Active Bookings (Approved)</p>
              <h2 className="text-4xl font-bold text-slate-900">{stats.activeBookings}</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><CalendarClock size={24} /></div>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Pending Requests</p>
              <h2 className="text-4xl font-bold text-slate-900">{stats.pending}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Room Schedule</h2>
              <p className="text-sm text-slate-500">Weekly overview</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                <button className="p-1 text-slate-400 hover:text-slate-800"><ChevronLeft size={18} /></button>
                Today
                <button className="p-1 text-slate-400 hover:text-slate-800"><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
          <div className="p-6 text-center text-slate-500 py-12">
            Real-time schedule will be displayed here.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}