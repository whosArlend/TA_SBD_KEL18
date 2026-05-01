import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Clock3, LayoutDashboard } from 'lucide-react'
import DashboardLayout from '../layout/DashboardLayout'

type BookingRequest = {
  id: string
  userName: string
  department: string
  room: string
  dateTime: string
  purpose: string
  seats: string
  status: 'pending' | 'approved' | 'rejected'
}

const initialRequests: BookingRequest[] = [
  {
    id: '1',
    userName: 'Jonathan Smith',
    department: 'Marketing Department',
    room: 'Boardroom A',
    dateTime: 'Oct 12, 2023 • 09:00 AM - 11:30 AM',
    purpose: 'Quarterly Strategic Planning',
    seats: 'Floor 4 • 20 Seats',
    status: 'pending',
  },
  {
    id: '2',
    userName: 'Alice Wong',
    department: 'Product Design',
    room: 'Creative Studio',
    dateTime: 'Oct 12, 2023 • 02:00 PM - 04:00 PM',
    purpose: 'Sprint Retrospective',
    seats: 'Floor 2 • 8 Seats',
    status: 'pending',
  },
  {
    id: '3',
    userName: 'Michael Lee',
    department: 'Human Resources',
    room: 'Interview Room 3',
    dateTime: 'Oct 13, 2023 • 10:00 AM - 11:00 AM',
    purpose: 'Candidate Interview: Senior Dev',
    seats: 'Floor 1 • 4 Seats',
    status: 'pending',
  },
  {
    id: '4',
    userName: 'David Garcia',
    department: 'Sales Team',
    room: 'South Hub',
    dateTime: 'Oct 13, 2023 • 03:30 PM - 05:00 PM',
    purpose: 'Client Demo: Global Partners',
    seats: 'Floor 3 • 12 Seats',
    status: 'pending',
  },
]

export default function BookingApprovalsPage() {
  const fullName = localStorage.getItem('userName') || 'System Admin'
  const [requests, setRequests] = useState<BookingRequest[]>(initialRequests)

  const pendingCount = useMemo(() => requests.filter((item) => item.status === 'pending').length, [requests])
  const utilizedRooms = 12
  const totalRooms = 18
  const rescheduledCount = 15
  const urgentConflicts = 3

  const updateStatus = (requestId: string, status: BookingRequest['status']) => {
    setRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, status } : request))
  }

  return (
    <DashboardLayout role="admin" userName={fullName} userRole="System Admin">
      <div className="px-2 py-6 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Booking Approvals</h1>
            <p className="text-slate-600">Review and manage pending room reservation requests.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="text-slate-500 text-sm">Filter:</span>
            <button className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition">All Pending</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sky-700 mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100">
              <Clock3 size={24} />
            </div>
            <div className="text-3xl font-semibold">{pendingCount}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Pending Requests</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-amber-700 mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
              <LayoutDashboard size={24} />
            </div>
            <div className="text-3xl font-semibold">{utilizedRooms} / {totalRooms}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Rooms Utilized</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-violet-700 mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100">
              <CheckCircle2 size={24} />
            </div>
            <div className="text-3xl font-semibold">{rescheduledCount}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Rescheduled</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-rose-700 mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100">
              <XCircle size={24} />
            </div>
            <div className="text-3xl font-semibold">{urgentConflicts}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Urgent Conflicts</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Queue of Pending Requests</div>
              <div className="text-xs text-slate-400">Showing {pendingCount} of {requests.length} results</div>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <span>Updated just now</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Room Requested</th>
                  <th className="px-6 py-4">Date/Time</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-t border-slate-200">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{request.userName}</div>
                      <div className="text-xs text-slate-500">{request.department}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-medium text-slate-900">{request.room}</div>
                      <div className="text-xs text-slate-500">{request.seats}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{request.dateTime}</td>
                    <td className="px-6 py-5 text-slate-600 max-w-xs">{request.purpose}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          onClick={() => updateStatus(request.id, 'rejected')}
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateStatus(request.id, 'approved')}
                          className="inline-flex items-center justify-center rounded-lg bg-sky-800 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-900 transition"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
            <span>{pendingCount} pending approval requests remain.</span>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">Previous</button>
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">1</button>
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">2</button>
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">3</button>
              <button className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 transition">Next</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
