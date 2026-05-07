import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import AddRoomModal from '../components/AddRoomModal';
import EditRoomModal from '../components/EditRoomModal';
import { Loader2, Archive, Pencil, Search, Image as ImageIcon } from 'lucide-react';
import * as api from '../lib/api';
import type { Room } from '../lib/api';
import type { AddRoomValues } from '../components/AddRoomModal';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Tabel: hanya tampilkan yang belum diarsipkan
  const rooms = allRooms.filter((r) => r.archived_at === null);

  // Filter berdasarkan search
  const filteredRooms = rooms.filter((r) =>
    r.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalRooms = allRooms.length;
  const availableRooms = allRooms.filter((r) => r.status === 'Available').length;
  const maintenanceRooms = allRooms.filter((r) => r.status === 'Maintenance' || r.archived_at !== null).length; 
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
    try {
        await api.updateRoom(editTarget.room_id, updated);
        fetchRooms(); // Refresh data agar sinkron
    } catch (err: any) {
        alert('Gagal update: ' + err.message);
    }
  };

  const handleArchiveSubmit = async () => {
    if (!archiveTarget || !archiveReason.trim()) {
      alert('Alasan arsip wajib diisi.');
      return;
    }
    setActionLoading(archiveTarget.room_id);
    try {
      await api.archiveRoom(archiveTarget.room_id, archiveReason.trim());
      fetchRooms();
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
      <div className="px-4 py-8 md:px-10 max-w-7xl mx-auto font-inter">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-slate-900 tracking-tight">Room Management</h1>
            <p className="text-slate-500 font-medium">Kelola infrastruktur dan ketersediaan ruang rapat korporat.</p>
          </div>
          <button 
            onClick={() => setAddOpen(true)} 
            className="bg-[#006194] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-[#004b73] transition-all active:scale-95"
          >
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

        {/* Archive Modal */}
        {archiveTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setArchiveTarget(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Archive Room</h2>
              <p className="text-slate-500 mb-6 text-sm">Anda akan mengarsipkan <span className="font-bold text-slate-900">{archiveTarget.room_name}</span>.</p>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alasan Arsip</label>
              <textarea
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Renovasi berkala..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-[#006194] outline-none transition-all"
              />
              <div className="flex gap-3 mt-8">
                <button onClick={() => setArchiveTarget(null)} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition">Cancel</button>
                <button onClick={handleArchiveSubmit} className="flex-1 bg-amber-500 text-white rounded-xl py-3 text-sm font-bold hover:bg-amber-600 transition">
                  {actionLoading !== null ? 'Processing...' : 'Confirm Archive'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Rooms', value: totalRooms, sub: 'Registered' },
            { label: 'Available', value: availableRooms, sub: 'Ready to use' },
            { label: 'Maintenance', value: maintenanceRooms, sub: 'In Repair/Archived' },
            { label: 'Availability', value: `${availability}%`, sub: 'Real-time ratio' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-3xl font-black text-slate-900 mb-1">{s.value}</div>
              <div className="text-[10px] font-bold text-[#006194] uppercase tracking-[0.15em] mb-1">{s.label}</div>
              <div className="text-[10px] text-slate-400 font-medium">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Inventory Table Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Inventory List</h2>
              <p className="text-xs text-slate-500 font-medium">Monitoring {filteredRooms.length} active facilities.</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by room name..."
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full sm:w-72 focus:ring-4 focus:ring-blue-500/5 focus:border-[#006194] outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5 text-left">Room Name & Location</th>
                  <th className="px-6 py-5 text-left">Type</th>
                  <th className="px-6 py-5 text-left">Capacity</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#006194]" /></td></tr>
                ) : filteredRooms.length > 0 ? filteredRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* KOLOM NAMA & LOKASI DENGAN THUMBNAIL */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200 shadow-sm">
                          <img 
                            src={room.image_url || FALLBACK_IMG} 
                            alt={room.room_name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG }}
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base leading-tight">{room.room_name}</div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">{room.location || '-'}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-5 text-slate-600 font-semibold text-sm">{room.room_type || '-'}</td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-slate-700">{room.capacity}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Persons</div>
                    </td>
                    
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${
                        room.status === 'Available' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : room.status === 'Occupied' 
                        ? 'bg-orange-50 text-orange-600 border-orange-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.status === 'Available' ? 'bg-emerald-500' : room.status === 'Occupied' ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        {room.status}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(room)}
                          className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors border border-transparent hover:border-sky-100"
                          title="Edit Room"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setArchiveTarget(room)}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-100"
                          title="Archive Room"
                        >
                          <Archive size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium">No results found for your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}