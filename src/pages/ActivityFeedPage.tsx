import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { CalendarPlus, XCircle, RotateCw, Check, CheckCheck, Loader2 } from 'lucide-react';
import * as api from '../lib/api';
import type { Reservation } from '../lib/api';

function getIconData(status: string) {
  switch (status) {
    case 'Approved': return { icon: <CalendarPlus className="w-6 h-6 text-sky-600" />, bg: 'bg-sky-50 border-sky-100' };
    case 'Canceled': return { icon: <XCircle className="w-6 h-6 text-rose-600" />, bg: 'bg-rose-50 border-rose-100' };
    case 'Rejected': return { icon: <XCircle className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-50 border-orange-100' };
    default: return { icon: <RotateCw className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50 border-amber-100' };
  }
}

export default function ActivityFeedPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [activities, setActivities] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markedRead, setMarkedRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await api.getReservations();
        setActivities(data);
      } catch (err) {
        console.error('Error fetching activity feed:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const hasUnread = activities.some((a) => !markedRead.has(a.reservation_id));

  const handleMarkAllAsRead = () => {
    setMarkedRead(new Set(activities.map((a) => a.reservation_id)));
  };

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 mb-2">Activity Feed</h1>
            <p className="text-slate-500 text-[15px]">Real-time reservation logs from API backend.</p>
          </div>
          <button onClick={handleMarkAllAsRead} disabled={!hasUnread}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md text-sm border ${hasUnread ? 'bg-blue-50 border-[#0088FF] text-[#0088FF]' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {hasUnread ? <Check size={16} /> : <CheckCheck size={16} />} Mark all as read
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="text-center py-10">
              <Loader2 className="animate-spin mx-auto mb-2 text-[#0088FF]" /> Loading logs...
            </div>
          ) : activities.length > 0 ? activities.map((res) => {
            const { icon, bg } = getIconData(res.status);
            const isRead = markedRead.has(res.reservation_id);
            const userName = res.users?.full_name ?? 'Unknown User';
            const roomName = res.rooms?.room_name ?? 'Unknown Room';
            const actionText =
              res.status === 'Approved' ? `booking ruangan ${roomName} disetujui.` :
              res.status === 'Rejected' ? `booking ruangan ${roomName} ditolak.` :
              res.status === 'Canceled' ? `membatalkan booking ruangan ${roomName}.` :
              `mengajukan booking ruangan ${roomName} — menunggu persetujuan.`;
            return (
              <div key={res.reservation_id}
                className={`rounded-xl p-6 shadow-sm border flex gap-5 ${isRead ? 'bg-white' : 'bg-[#F4FAFF] border-blue-200'}`}
                onClick={() => setMarkedRead((prev) => new Set([...prev, res.reservation_id]))}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg}`}>{icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[17px] font-semibold text-slate-900">
                      Reservasi {res.status} – {roomName}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {new Date(res.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-[15px] text-slate-600">
                    <span className="font-bold">{userName}</span> {actionText}
                  </p>
                  {res.booking_code && (
                    <span className="text-xs text-slate-400 font-mono mt-1 block">{res.booking_code}</span>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-10 text-slate-500">No activities found in API.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}