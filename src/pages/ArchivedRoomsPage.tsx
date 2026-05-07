import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Archive, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import * as api from '../lib/api';
import type { Room } from '../lib/api';

export default function ArchivedRoomsPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [archivedRooms, setArchivedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchArchived(); }, []);

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRooms();
      setArchivedRooms(data.filter((r) => r.archived_at !== null));
    } catch (err) {
      console.error('Error fetching archived rooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async (room: Room) => {
    if (!window.confirm(`Pulihkan ruangan "${room.room_name}" agar aktif kembali?`)) return;
    setActionLoading(room.room_id);
    try {
      await api.unarchiveRoom(room.room_id);
      setArchivedRooms((prev) => prev.filter((r) => r.room_id !== room.room_id));
    } catch (err: any) {
      alert('Gagal memulihkan ruangan: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!window.confirm(
      `Hapus permanen "${room.room_name}"?\n\nData ruangan ini akan dihapus selamanya dari database dan tidak dapat dipulihkan kembali.`
    )) return;
    setActionLoading(room.room_id);
    try {
      await api.deleteRoom(room.room_id);
      setArchivedRooms((prev) => prev.filter((r) => r.room_id !== room.room_id));
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-[32px] font-bold text-slate-900 mb-2">Archived Rooms</h1>
        <p className="text-slate-500 mb-8">
          Daftar ruangan yang telah diarsipkan. Pulihkan untuk mengaktifkan kembali, atau hapus permanen dari database.
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#0065A1]" />
              Memuat data...
            </div>
          ) : archivedRooms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200">
                    <th className="py-3 text-left font-semibold">Room Name</th>
                    <th className="py-3 text-left font-semibold">Location</th>
                    <th className="py-3 text-left font-semibold">Type</th>
                    <th className="py-3 text-left font-semibold">Alasan Arsip</th>
                    <th className="py-3 text-left font-semibold">Tanggal Arsip</th>
                    <th className="py-3 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archivedRooms.map((room) => (
                    <tr key={room.room_id} className="border-b border-slate-100 last:border-b-0 opacity-80 hover:opacity-100 transition-opacity">
                      <td className="py-4 font-bold text-slate-800">{room.room_name}</td>
                      <td className="py-4 text-slate-500">{room.location || '-'}</td>
                      <td className="py-4 text-slate-500">{room.room_type || '-'}</td>
                      <td className="py-4 text-slate-600 max-w-xs">
                        <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5 text-xs">
                          {room.archive_reason || '-'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500 text-xs">
                        {room.archived_at
                          ? new Date(room.archived_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUnarchive(room)}
                            disabled={actionLoading === room.room_id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg hover:bg-sky-50 transition disabled:opacity-50"
                          >
                            <RotateCcw size={13} />
                            {actionLoading === room.room_id ? 'Memproses...' : 'Pulihkan'}
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            disabled={actionLoading === room.room_id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-50"
                          >
                            <Trash2 size={13} />
                            Hapus Permanen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <Archive className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 mb-1">Database Bersih</h2>
              <p className="text-sm text-slate-400">Tidak ada ruangan yang diarsipkan saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
