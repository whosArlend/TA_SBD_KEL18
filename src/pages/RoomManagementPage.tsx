import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import AddRoomModal from '../components/AddRoomModal';
import EditRoomModal from '../components/EditRoomModal';
import { Loader2, Archive, Pencil } from 'lucide-react';
import * as api from '../lib/api';
import type { Room } from '../lib/api';
import type { AddRoomValues } from '../components/AddRoomModal';

export default function RoomManagementPage() {
  const auth = useAuth() as any;
  const adminName = auth?.fullName || localStorage.getItem('userName') || 'System Admin';

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Room | null>(null);
  const [archiveReason, setArchiveReason] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Tabel: hanya tampilkan yang belum diarsipkan
  const rooms = allRooms.filter((r) => r.archived_at === null);

  // Stats: hitung dari semua ruangan (termasuk archived)
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const maintenanceRooms = allRooms.filter((r) => r.status === 'Maintenance').length;
  const availability = totalRooms > 0 ? Math.round((availableRooms / totalRooms) * 100) : 0;

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRooms();
      setAllRooms(data);
    } catch (err: any) {
      console.error('Error fetching rooms:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRoom = async (values: AddRoomValues) => {
    try {
      const room = await api.createRoom({
        room_name: values.roomName,
        room_type: values.roomType,
        location: values.location || '-',
        capacity: values.capacity === '' ? 0 : Number(values.capacity),
        status: 'Available',
        image_url: values.imageUrl || null,
      });
      // Simpan amenities & rules ke mapping table
      await Promise.all([
        api.updateRoomAmenities(room.room_id, values.selectedAmenities),
        api.updateRoomRules(room.room_id, values.selectedRuleIds),
      ]);
      fetchRooms();
    } catch (err: any) {
      alert('Gagal menambahkan ruangan: ' + err.message);
    }
  };

  const handleEditSave = async (updated: Partial<Room>) => {
    if (!editTarget) return;
    await api.updateRoom(editTarget.room_id, updated);
    setAllRooms((prev) =>
      prev.map((r) => r.room_id === editTarget.room_id ? { ...r, ...updated } : r)
    );
  };

  const handleArchiveSubmit = async () => {
    if (!archiveTarget || !archiveReason.trim()) {
      alert('Alasan arsip wajib diisi.');
      return;
    }
    setActionLoading(archiveTarget.room_id);
    try {
      await api.archiveRoom(archiveTarget.room_id, archiveReason.trim());
      // Update lokal: tandai sebagai archived + Maintenance (tidak perlu refetch)
      setAllRooms((prev) =>
        prev.map((r) =>
          r.room_id === archiveTarget.room_id
            ? { ...r, status: 'Maintenance' as const, archived_at: new Date().toISOString(), archive_reason: archiveReason.trim() }
            : r
        )
      );
      setArchiveTarget(null);
      setArchiveReason('');
    } catch (err: any) {
      alert('Gagal mengarsipkan: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName={adminName}>
      <div className="px-2 py-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-slate-900">Room Management</h1>
            <p className="text-slate-500">Configure and monitor all meeting spaces.</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="bg-[#0065A1] text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-blue-800 transition">
            + Add New Room
          </button>
        </div>

        <AddRoomModal open={addOpen} onClose={() => setAddOpen(false)} onSave={handleAddRoom} />

        {editTarget && (
          <EditRoomModal
            room={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleEditSave}
          />
        )}

        {/* Archive Reason Modal */}
        {archiveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setArchiveTarget(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md z-10">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Archive Room</h2>
              <p className="text-slate-500 mb-4 text-sm">Archiving: <span className="font-bold text-slate-800">{archiveTarget.room_name}</span></p>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alasan Arsip <span className="text-rose-500">*</span></label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
                placeholder="e.g. Renovasi, kerusakan fasilitas..."
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0065A1] focus:ring-4 focus:ring-[#0065A1]/15"
              />
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setArchiveTarget(null); setArchiveReason(''); }} className="flex-1 border border-slate-300 rounded-lg py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleArchiveSubmit} disabled={actionLoading !== null} className="flex-1 bg-amber-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50">
                  {actionLoading !== null ? 'Memproses...' : 'Archive'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'TOTAL ROOMS', value: totalRooms, color: 'text-sky-700' },
            { label: 'AVAILABLE', value: availableRooms, color: 'text-emerald-600' },
            { label: 'MAINTENANCE', value: maintenanceRooms, color: 'text-amber-600' },
            { label: 'AVAILABILITY', value: `${availability}%`, color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center shadow-sm">
              <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Inventory List</h2>
            <span className="text-sm text-slate-500">{rooms.length} rooms (from API)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="py-3 text-left font-semibold">Room Name & Location</th>
                  <th className="py-3 text-left font-semibold">Type</th>
                  <th className="py-3 text-left font-semibold">Capacity</th>
                  <th className="py-3 text-left font-semibold">Status</th>
                  <th className="py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0065A1]" />Loading rooms...</td></tr>
                ) : rooms.length > 0 ? rooms.map((room) => (
                  <tr key={room.room_id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4">
                      <div className="font-bold text-slate-800">{room.room_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{room.location || '-'}</div>
                    </td>
                    <td className="py-4 text-slate-600">{room.room_type || '-'}</td>
                    <td className="py-4 font-medium text-slate-600">{room.capacity} Persons</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2 py-1 rounded ${room.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : room.status === 'Occupied' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-emerald-500' : room.status === 'Occupied' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        {room.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditTarget(room)}
                          disabled={actionLoading === room.room_id}
                          className="flex items-center gap-1 text-xs font-semibold text-sky-700 border border-sky-200 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition disabled:opacity-50"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => { setArchiveTarget(room); setArchiveReason(''); }}
                          disabled={actionLoading === room.room_id}
                          className="flex items-center gap-1 text-xs font-semibold text-amber-600 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 transition disabled:opacity-50"
                        >
                          <Archive size={13} /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-500">Belum ada ruangan. Klik "+ Add New Room" untuk menambah.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
