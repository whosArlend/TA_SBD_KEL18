import DashboardLayout from '../layout/DashboardLayout'
import { useState } from 'react';

const dummyRooms = [
  {
    name: 'The Executive Suite',
    location: 'Floor 4, Wing A',
    capacity: 12,
    equipment: ['4K Display', 'Video Conf', '+3'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=96&h=64',
  },
  {
    name: 'Innovation Hub',
    location: 'Floor 1, Lobby',
    capacity: 30,
    equipment: ['Whiteboard', 'Projector'],
    status: 'Occupied',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=facearea&w=96&h=64',
  },
  {
    name: 'Focus Pod Alpha',
    location: 'Floor 2, Wing C',
    capacity: 4,
    equipment: ['Acoustic Paneling'],
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=96&h=64',
  },
];

export default function RoomManagementPage() {
  const fullName = localStorage.getItem('userName') || 'System Admin';
  const [rooms] = useState(dummyRooms);

  return (
    <DashboardLayout role="admin" userName={fullName} userRole="System Admin">
      <div className="px-2 py-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Room Management</h1>
            <p className="text-slate-600">Configure and monitor all corporate meeting spaces.</p>
          </div>
          <button className="bg-[#0088FF] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">+ Add New Room</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center">
            <div className="text-sky-700 mb-2"><svg width="32" height="32" fill="none" stroke="currentColor"><rect width="32" height="32" rx="8" fill="#F5FAFF"/><path d="M8 20h16M8 16h16M8 12h16" stroke="#0088FF" strokeWidth="2"/></svg></div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-xs text-slate-500">TOTAL ROOMS <span className="ml-2 text-xs text-sky-600 bg-sky-50 rounded px-2 py-0.5">+2 this month</span></div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center">
            <div className="text-indigo-700 mb-2"><svg width="32" height="32" fill="none" stroke="currentColor"><rect width="32" height="32" rx="8" fill="#F5F6FF"/><path d="M16 8v8l6 3" stroke="#6C63FF" strokeWidth="2"/></svg></div>
            <div className="text-2xl font-bold">18</div>
            <div className="text-xs text-slate-500">AVAILABLE NOW <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 rounded px-2 py-0.5">43% current capacity</span></div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center">
            <div className="text-orange-500 mb-2"><svg width="32" height="32" fill="none" stroke="currentColor"><rect width="32" height="32" rx="8" fill="#FFF8F1"/><path d="M16 8v8l6 3" stroke="#FF9900" strokeWidth="2"/></svg></div>
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs text-slate-500">OCCUPIED <span className="ml-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-0.5">Rooms currently in use</span></div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center">
            <div className="text-rose-600 mb-2"><svg width="32" height="32" fill="none" stroke="currentColor"><rect width="32" height="32" rx="8" fill="#FFF5F5"/><path d="M16 8v8l6 3" stroke="#FF3B3B" strokeWidth="2"/></svg></div>
            <div className="text-2xl font-bold">15</div>
            <div className="text-xs text-slate-500">BOOKED <span className="ml-2 text-xs text-rose-600 bg-rose-50 rounded px-2 py-0.5">Reserved for later today</span></div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Inventory List</h2>
            <button className="border border-slate-300 rounded px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Filter</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b">
                  <th className="py-2 text-left">Room Name & Location</th>
                  <th className="py-2 text-left">Capacity</th>
                  <th className="py-2 text-left">Equipment</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.name} className="border-b last:border-b-0">
                    <td className="py-3 flex items-center gap-3">
                      <img src={room.image} alt={room.name} className="w-12 h-8 object-cover rounded" />
                      <div>
                        <div className="font-semibold text-slate-800">{room.name}</div>
                        <div className="text-xs text-slate-500">{room.location}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1"><svg width="16" height="16" fill="none" stroke="currentColor"><path d="M2 14V6a2 2 0 012-2h8a2 2 0 012 2v8" stroke="#64748B" strokeWidth="1.5"/><circle cx="8" cy="10" r="2" stroke="#64748B" strokeWidth="1.5"/></svg>{room.capacity} Persons</span>
                    </td>
                    <td className="py-3">
                      {room.equipment.map((eq, i) => (
                        <span key={i} className="inline-block bg-slate-100 text-slate-700 rounded px-2 py-0.5 text-xs font-medium mr-1 mb-1">{eq}</span>
                      ))}
                    </td>
                    <td className="py-3">
                      {room.status === 'Available' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">● Available</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">● Occupied</span>
                      )}
                    </td>
                    <td className="py-3">
                      <button className="text-slate-400 hover:text-sky-700 mr-2" title="Edit"><svg width="18" height="18" fill="none" stroke="currentColor"><path d="M3 14.25V16.5h2.25l6.586-6.586a1.5 1.5 0 00-2.121-2.121L3 14.25z" stroke="#64748B" strokeWidth="1.5"/><path d="M14.25 6.75l-2.25-2.25" stroke="#64748B" strokeWidth="1.5"/></svg></button>
                      <button className="text-slate-400 hover:text-rose-600" title="Delete"><svg width="18" height="18" fill="none" stroke="currentColor"><path d="M6 7.5v6a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-6" stroke="#64748B" strokeWidth="1.5"/><path d="M4.5 4.5h9M7.5 4.5V3a1.5 1.5 0 011.5-1.5h0A1.5 1.5 0 0110.5 4.5v0" stroke="#64748B" strokeWidth="1.5"/></svg></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
            <span>Showing 1 to 3 of 42 rooms</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center disabled:opacity-50">&lt;</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center bg-sky-100 text-sky-700 font-bold">1</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center">2</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center">3</button>
              <button className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
