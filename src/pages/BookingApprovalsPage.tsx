import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock3, CornerDownLeft, Loader2, Search } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

type TabType = 'pending' | 'return';

export default function BookingApprovalsPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingList, setPendingList] = useState<Reservation[]>([]);
  const [returnList, setReturnList] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const pending = await api.getReservations({ status: 'Pending' });
      setPendingList(pending);
    } catch (err: any) {
      console.error('Error fetching pending:', err.message);
    }
    try {
      const returning = await api.getReservations({ status: 'Return Requested' });
      setReturnList(returning);
    } catch (err: any) {
      console.error('Error fetching returns:', err.message);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected', userName: string) => {
    if (status === 'Rejected') {
      if (!window.confirm(`Tolak booking dari ${userName}?`)) return;
    }
    setActionLoading(id);
    try {
      await api.updateReservationStatus(id, status);
      setPendingList((prev) => prev.filter((r) => r.reservation_id !== id));
    } catch (err: any) {
      alert('Gagal memperbarui status: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReturn = async (id: number, roomName: string) => {
    if (!window.confirm(`Konfirmasi pengembalian ruangan "${roomName}"?\nStatus ruangan akan kembali menjadi Available.`)) return;
    setActionLoading(id);
    try {
      await api.approveReturn(id);
      setReturnList((prev) => prev.filter((r) => r.reservation_id !== id));
    } catch (err: any) {
      alert('Gagal mengkonfirmasi pengembalian: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const rawList = activeTab === 'pending' ? pendingList : returnList;

  const displayList = rawList.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.users?.full_name?.toLowerCase().includes(q) ||
      r.rooms?.room_name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(displayList.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = displayList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [activeTab]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="px-2 py-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-slate-900">Booking Approvals</h1>
            <p className="text-slate-600">Review dan kelola permintaan reservasi dan pengembalian ruangan.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sky-700 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
              <Clock3 size={24} />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pending Booking</div>
            <div className="text-3xl font-bold text-slate-900">{pendingList.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-purple-700 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 border border-purple-100">
              <CornerDownLeft size={24} />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Return Requests</div>
            <div className="text-3xl font-bold text-slate-900">{returnList.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-emerald-700 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total Antrian</div>
            <div className="text-3xl font-bold text-slate-900">{pendingList.length + returnList.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-rose-700 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 border border-rose-100">
              <XCircle size={24} />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</div>
            <div className="text-lg font-bold text-slate-900">Live</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 w-fit mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'pending' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Clock3 size={15} /> Booking Requests
            {pendingList.length > 0 && (
              <span className="ml-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingList.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'return' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CornerDownLeft size={15} /> Return Requests
            {returnList.length > 0 && (
              <span className="ml-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {returnList.length}
              </span>
            )}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {activeTab === 'pending' ? 'Antrian Booking' : 'Antrian Pengembalian'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Cari user atau ruangan..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                />
              </div>
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                {currentData.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + ITEMS_PER_PAGE, displayList.length)} / {displayList.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Kegiatan</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#0065A1]" />
                      <p>Loading...</p>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? currentData.map((req) => (
                  <tr key={req.reservation_id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
                          {req.users?.full_name?.substring(0, 2) ?? 'US'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{req.users?.full_name ?? '-'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{req.users?.department ?? '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900">{req.rooms?.room_name ?? '-'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{req.rooms?.location ?? '-'} · {req.rooms?.capacity ?? '-'} org</div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 text-xs">
                      <div>{formatDateTime(req.start_time)}</div>
                      <div className="text-slate-400">s/d {formatDateTime(req.end_time)}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-600">
                      <div>{req.meeting_title ?? '-'}</div>
                      {req.person_in_charge && (
                        <div className="text-xs text-slate-400 mt-0.5">PIC: {req.person_in_charge}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {activeTab === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(req.reservation_id, 'Rejected', req.users?.full_name ?? '')}
                            disabled={actionLoading === req.reservation_id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition active:scale-95 disabled:opacity-50"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.reservation_id, 'Approved', req.users?.full_name ?? '')}
                            disabled={actionLoading === req.reservation_id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0065A1] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-95 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApproveReturn(req.reservation_id, req.rooms?.room_name ?? '')}
                          disabled={actionLoading === req.reservation_id}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition active:scale-95 disabled:opacity-50"
                        >
                          <CornerDownLeft size={14} />
                          {actionLoading === req.reservation_id ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      {activeTab === 'pending' ? 'Semua booking sudah diproses! 🎉' : 'Tidak ada permintaan pengembalian. ✅'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
            <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className="text-slate-500 font-medium hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md font-medium flex items-center justify-center transition-colors ${currentPage === i + 1 ? 'bg-[#0065A1] text-white font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
              className="text-slate-500 font-medium hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
