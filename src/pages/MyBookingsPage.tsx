import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, CalendarClock, XCircle, CornerDownLeft } from 'lucide-react';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved:          'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected:          'bg-rose-50 text-rose-700 border-rose-200',
    Cancelled:         'bg-slate-100 text-slate-500 border-slate-200',
    Completed:         'bg-blue-50 text-blue-700 border-blue-200',
    'Return Requested': 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-3 py-1 text-[11px] font-bold uppercase rounded border ${map[status] ?? 'bg-amber-50 text-amber-700 border-amber-200'}`}>
      {status}
    </span>
  );
}

export default function MyBookingsPage() {
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;

  const [myBookings, setMyBookings] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchMyBookings = async () => {
      setIsLoading(true);
      try {
        const data = await api.getReservations({ user_id: userId });
        setMyBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyBookings();
  }, [userId]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Batalkan booking ini?')) return;
    setActionLoading(id);
    try {
      await api.cancelReservation(id);
      setMyBookings((prev) =>
        prev.map((b) => b.reservation_id === id ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (err: any) {
      alert('Gagal membatalkan: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestReturn = async (id: number, roomName: string) => {
    if (!window.confirm(`Ajukan pengembalian ruangan "${roomName}"?\n\nAdmin akan mereview dan mengkonfirmasi pengembalian.`)) return;
    setActionLoading(id);
    try {
      await api.requestReturn(id);
      setMyBookings((prev) =>
        prev.map((b) => b.reservation_id === id ? { ...b, status: 'Return Requested' } : b)
      );
    } catch (err: any) {
      alert('Gagal mengajukan pengembalian: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500 mb-8">Pantau status persetujuan dan riwayat pemesanan ruangan Anda.</p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Room</th>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Waktu Mulai</th>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Waktu Selesai</th>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Kegiatan</th>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Status</th>
                  <th className="py-4 px-6 font-bold text-[12px] uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0088FF]" /> Memuat data...
                  </td></tr>
                ) : myBookings.length > 0 ? myBookings.map((booking) => (
                  <tr key={booking.reservation_id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 px-6 font-bold text-slate-800">{booking.rooms?.room_name ?? '-'}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{formatDateTime(booking.start_time)}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{formatDateTime(booking.end_time)}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{booking.meeting_title ?? '-'}</div>
                      {booking.person_in_charge && (
                        <div className="text-xs text-slate-400 mt-0.5">PIC: {booking.person_in_charge}</div>
                      )}
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={booking.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        {booking.status === 'Pending' && (
                          <button
                            onClick={() => handleCancel(booking.reservation_id)}
                            disabled={actionLoading === booking.reservation_id}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-50 whitespace-nowrap"
                          >
                            <XCircle size={13} /> Batalkan
                          </button>
                        )}
                        {booking.status === 'Approved' && (
                          <button
                            onClick={() => handleRequestReturn(booking.reservation_id, booking.rooms?.room_name ?? '')}
                            disabled={actionLoading === booking.reservation_id}
                            className="flex items-center gap-1 text-xs font-semibold text-purple-600 border border-purple-200 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition disabled:opacity-50 whitespace-nowrap"
                          >
                            <CornerDownLeft size={13} />
                            {actionLoading === booking.reservation_id ? 'Mengajukan...' : 'Kembalikan'}
                          </button>
                        )}
                        {booking.status === 'Return Requested' && (
                          <span className="text-xs text-purple-600 font-medium italic">Menunggu konfirmasi admin...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                        <CalendarClock className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">Anda belum pernah melakukan pemesanan ruangan.</p>
                    </td>
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
