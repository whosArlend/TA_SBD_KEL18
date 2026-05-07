import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Filter, ClipboardList, Building2, CalendarDays, AlertCircle, X, Check, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function BookingsPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [requests, setRequests] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReservations({ status: 'Pending' });
      setRequests(data);
    } catch (err: any) {
      console.error('Error fetching reservations:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, userName: string) => {
    setActionLoading(id);
    try {
      await api.updateReservationStatus(id, 'Approved');
      alert(`Booking dari ${userName} berhasil di-Approve!`);
      setRequests((prev) => prev.filter((r) => r.reservation_id !== id));
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, userName: string) => {
    if (!window.confirm(`Tolak booking dari ${userName}?`)) return;
    setActionLoading(id);
    try {
      await api.updateReservationStatus(id, 'Rejected');
      setRequests((prev) => prev.filter((r) => r.reservation_id !== id));
    } catch (err: any) {
      alert('Gagal: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 mb-2">Booking Approvals</h1>
            <p className="text-slate-500 text-[15px]">Review and manage pending room reservation requests.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} /> Filter: All Pending
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            {requests.length > 0 && (
              <span className="absolute top-6 right-6 bg-sky-50 text-sky-600 text-xs font-bold px-2 py-1 rounded-md">New</span>
            )}
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-6"><ClipboardList size={20} className="text-blue-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Requests</p>
            <h3 className="text-3xl font-bold text-slate-900">{requests.length}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-6"><Building2 size={20} className="text-orange-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Source</p>
            <h3 className="text-xl font-bold text-slate-900">Live API</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-6"><CalendarDays size={20} className="text-indigo-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Endpoint</p>
            <h3 className="text-sm font-bold text-slate-900">/api/reservations</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center mb-6"><AlertCircle size={20} className="text-rose-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status Filter</p>
            <h3 className="text-xl font-bold text-slate-900">Pending</h3>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Queue of Pending Requests</h2>
            <span className="text-sm text-slate-500">Showing {requests.length} results</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-4 px-6 text-left font-bold text-[11px] tracking-wider uppercase">User</th>
                  <th className="py-4 px-6 text-left font-bold text-[11px] tracking-wider uppercase">Room Requested</th>
                  <th className="py-4 px-6 text-left font-bold text-[11px] tracking-wider uppercase">Date/Time</th>
                  <th className="py-4 px-6 text-left font-bold text-[11px] tracking-wider uppercase">Tujuan</th>
                  <th className="py-4 px-6 text-right font-bold text-[11px] tracking-wider uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0065A1]" />Loading from API...
                    </td>
                  </tr>
                ) : requests.length > 0 ? requests.map((req) => {
                  const dt = formatDateTime(req.start_time);
                  const dtEnd = formatDateTime(req.end_time);
                  const initials = req.users?.full_name?.substring(0, 2) ?? 'US';
                  return (
                    <tr key={req.reservation_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">{initials}</div>
                          <div>
                            <p className="font-bold text-slate-900">{req.users?.full_name ?? '-'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{req.users?.department ?? '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{req.rooms?.room_name ?? '-'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{req.rooms?.location ?? '-'} · {req.rooms?.capacity ?? '-'} org</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{dt.date}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{dt.time} – {dtEnd.time}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div>{req.meeting_title ?? '-'}</div>
                        {req.person_in_charge && <div className="text-xs text-slate-400 mt-0.5">PIC: {req.person_in_charge}</div>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleReject(req.reservation_id, req.users?.full_name ?? '')}
                            disabled={actionLoading === req.reservation_id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-md text-xs font-bold hover:bg-rose-50 disabled:opacity-50">
                            <X size={14} strokeWidth={3} /> Reject
                          </button>
                          <button onClick={() => handleApprove(req.reservation_id, req.users?.full_name ?? '')}
                            disabled={actionLoading === req.reservation_id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0065A1] text-white rounded-md text-xs font-bold hover:bg-blue-800 disabled:opacity-50">
                            <Check size={14} strokeWidth={3} /> Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">Semua permintaan sudah selesai diproses. 🎉</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}