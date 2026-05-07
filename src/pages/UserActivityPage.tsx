import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, XCircle, Clock, Loader2, CalendarCheck } from 'lucide-react';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

function formatRelative(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getStyles(status: string) {
  if (status === 'Approved') return {
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    iconBg: 'bg-emerald-100',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  };
  if (status === 'Rejected') return {
    icon: <XCircle className="w-6 h-6 text-rose-600" />,
    iconBg: 'bg-rose-100',
    badgeBg: 'bg-rose-100 text-rose-700',
  };
  if (status === 'Canceled') return {
    icon: <XCircle className="w-6 h-6 text-orange-600" />,
    iconBg: 'bg-orange-100',
    badgeBg: 'bg-orange-100 text-orange-700',
  };
  // Pending
  return {
    icon: <CalendarCheck className="w-6 h-6 text-sky-600" />,
    iconBg: 'bg-sky-100',
    badgeBg: 'bg-sky-100 text-sky-700',
  };
}

export default function UserActivityPage() {
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';
  const userId = auth?.user?.user_id as number | undefined;

  const [activities, setActivities] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await api.getReservations({ user_id: userId });
        setActivities(data);
      } catch (err) {
        console.error('Error fetching user activity:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, [userId]);

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">Aktivitas Terbaru & Notifikasi</h1>
          <p className="text-slate-500 text-[15px]">Pantau status reservasi ruang dan pembaruan jadwal Anda secara real-time.</p>
        </div>

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#0088FF]" />
              Sinkronisasi data...
            </div>
          ) : activities.length > 0 ? activities.map((res) => {
            const styles = getStyles(res.status);
            const roomName = res.rooms?.room_name ?? '-';
            const title =
              res.status === 'Approved' ? `Booking Disetujui – ${roomName}` :
              res.status === 'Rejected' ? `Booking Ditolak – ${roomName}` :
              res.status === 'Canceled' ? `Booking Dibatalkan – ${roomName}` :
              `Menunggu Persetujuan – ${roomName}`;
            const desc =
              res.status === 'Approved' ? `Reservasi ruangan ${roomName} telah disetujui oleh admin.` :
              res.status === 'Rejected' ? `Reservasi ruangan ${roomName} ditolak. ${res.notes_from_admin ? 'Catatan admin: ' + res.notes_from_admin : ''}` :
              res.status === 'Canceled' ? `Reservasi ruangan ${roomName} telah dibatalkan.` :
              `Permintaan booking ruangan ${roomName} sedang menunggu persetujuan admin.`;
            return (
              <div key={res.reservation_id} className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-[17px]">{title}</h3>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${styles.badgeBg}`}>
                      {res.status}
                    </span>
                  </div>
                  <p className="text-[15px] text-slate-600 leading-relaxed">{desc}</p>
                  {res.meeting_title && (
                    <p className="text-sm text-slate-400 mt-1">Kegiatan: {res.meeting_title}</p>
                  )}
                  <div className="flex items-center gap-5 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                      <Clock className="w-4 h-4" />
                      {formatRelative(res.created_at)}
                    </div>
                    {res.booking_code && (
                      <span className="text-xs text-slate-400 font-mono">{res.booking_code}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Belum ada aktivitas</h3>
              <p className="text-sm text-slate-500">Anda belum memiliki riwayat reservasi ruangan.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}