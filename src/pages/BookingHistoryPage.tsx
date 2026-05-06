import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle2, XCircle, Search, Loader2, ChevronLeft, ChevronRight, CornerDownLeft } from 'lucide-react';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

type TabType = 'All' | 'Approved' | 'Rejected' | 'Canceled' | 'Return Requested' | 'Completed';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Approved:          'bg-emerald-100 text-emerald-700',
    Rejected:          'bg-rose-100 text-rose-700',
    Canceled:         'bg-orange-100 text-orange-700',
    Completed:         'bg-blue-100 text-blue-700',
    'Return Requested': 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}

export default function BookingHistoryPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [history, setHistory] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReservations();
      setHistory(data.filter((r) => r.status !== 'Pending'));
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReturn = async (id: number, roomName: string) => {
    if (!window.confirm(`Konfirmasi pengembalian ruangan "${roomName}"?\nStatus ruangan akan kembali menjadi Available.`)) return;
    setActionLoading(id);
    try {
      await api.approveReturn(id);
      setHistory((prev) =>
        prev.map((r) => r.reservation_id === id ? { ...r, status: 'Completed' } : r)
      );
    } catch (err: any) {
      alert('Gagal mengkonfirmasi: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredData = history.filter((item) => {
    const matchTab = activeTab === 'All' || item.status === activeTab;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      item.rooms?.room_name?.toLowerCase().includes(query) ||
      item.users?.full_name?.toLowerCase().includes(query) ||
      item.booking_code?.toLowerCase().includes(query);
    return matchTab && matchSearch;
  });

  const returnRequestCount = history.filter((h) => h.status === 'Return Requested').length;
  const totalBookings = history.length;
  const approvedCount = history.filter((h) => h.status === 'Approved').length;
  const canceledCount = history.filter((h) => h.status === 'Canceled' || h.status === 'Rejected').length;

  const TABS: TabType[] = ['All', 'Approved', 'Return Requested', 'Completed', 'Rejected', 'Canceled'];

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-slate-900 mb-2">Booking History</h1>
          <p className="text-slate-500 text-[15px]">Review riwayat reservasi dan konfirmasi pengembalian ruangan.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center mb-4 border border-sky-100"><Calendar size={20} className="text-[#0065A1]" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalBookings}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100"><CheckCircle2 size={20} className="text-emerald-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Approved</p>
            <h3 className="text-3xl font-bold text-slate-900">{approvedCount}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 border border-purple-100"><CornerDownLeft size={20} className="text-purple-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Return Requests</p>
            <h3 className="text-3xl font-bold text-slate-900">{returnRequestCount}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center mb-4 border border-rose-100"><XCircle size={20} className="text-rose-600" /></div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rejected / Canceled</p>
            <h3 className="text-3xl font-bold text-slate-900">{canceledCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap bg-slate-50 p-1 rounded-lg border border-slate-200 gap-1">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab ? 'bg-white text-[#0065A1] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}>
                  {tab}
                  {tab === 'Return Requested' && returnRequestCount > 0 && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {returnRequestCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari nama atau ruangan..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#0065A1]" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="py-4 px-6 text-left font-bold text-[12px]">User</th>
                  <th className="py-4 px-6 text-left font-bold text-[12px]">Room</th>
                  <th className="py-4 px-6 text-left font-bold text-[12px]">Waktu</th>
                  <th className="py-4 px-6 text-left font-bold text-[12px]">Booking Code</th>
                  <th className="py-4 px-6 text-left font-bold text-[12px]">Status</th>
                  <th className="py-4 px-6 text-left font-bold text-[12px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2 text-[#0065A1] w-6 h-6" />Loading...
                  </td></tr>
                ) : filteredData.length > 0 ? filteredData.map((item) => (
                  <tr key={item.reservation_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{item.users?.full_name ?? '-'}</div>
                      <div className="text-xs text-slate-400">{item.users?.department ?? '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">{item.rooms?.room_name ?? '-'}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      <div>{formatDateTime(item.start_time)}</div>
                      <div className="text-slate-400">s/d {formatDateTime(item.end_time)}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">{item.booking_code ?? '-'}</td>
                    <td className="py-4 px-6"><StatusBadge status={item.status} /></td>
                    <td className="py-4 px-6">
                      {item.status === 'Return Requested' && (
                        <button
                          onClick={() => handleApproveReturn(item.reservation_id, item.rooms?.room_name ?? '')}
                          disabled={actionLoading === item.reservation_id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition disabled:opacity-50 whitespace-nowrap"
                        >
                          <CornerDownLeft size={13} />
                          {actionLoading === item.reservation_id ? 'Memproses...' : 'Konfirmasi Kembali'}
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500">No matching history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-between items-center text-sm">
            <span className="text-slate-500">Showing {filteredData.length} entries</span>
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded border border-[#0065A1] bg-[#0065A1] text-white flex items-center justify-center font-bold">1</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-500"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
