import * as React from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CalendarCheck, 
  CalendarClock, 
  History, 
  ChevronLeft, 
  ChevronRight,
  CalendarPlus,
  XCircle,
  RotateCw,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

export default function AdminDashboard() {
  const fullName = localStorage.getItem('userName') || 'Alex Rivera';

  return (
    <DashboardLayout role="admin" userName={fullName} userRole="System Admin">
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-500 text-[15px]">Monitoring real-time operational capacity and pending actions.</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                +4% vs last mo
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Total Rooms</p>
              <h2 className="text-4xl font-bold text-slate-900">124</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <CalendarCheck size={24} />
              </div>
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                88% Capacity
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Active Bookings</p>
              <h2 className="text-4xl font-bold text-slate-900">42</h2>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                <CalendarClock size={24} />
              </div>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                Urgent
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-1">Pending Requests</p>
              <h2 className="text-4xl font-bold text-slate-900">18</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ROOM SCHEDULE (Col-span-2) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Room Schedule</h2>
                <p className="text-sm text-slate-500">Weekly overview for Floor 1-12</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button className="px-4 py-1.5 bg-white text-slate-800 text-sm font-semibold rounded shadow-sm">Week</button>
                  <button className="px-4 py-1.5 text-slate-500 text-sm font-medium hover:text-slate-800">Month</button>
                </div>
                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800">
                  <button className="p-1 text-slate-400 hover:text-slate-800"><ChevronLeft size={18} /></button>
                  Oct 16 - 22, 2023
                  <button className="p-1 text-slate-400 hover:text-slate-800"><ChevronRight size={18} /></button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
                  <div>ROOM</div>
                  <div>MON</div>
                  <div>TUE</div>
                  <div>WED</div>
                  <div>THU</div>
                  <div>FRI</div>
                </div>

                {/* Row 1 */}
                <div className="grid grid-cols-6 border-b border-slate-100 py-4 items-center">
                  <div className="font-semibold text-slate-800">Grand Conf A</div>
                  <div>
                    <div className="bg-sky-50 border-l-4 border-sky-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-sky-800">Board Meeting</p>
                      <p className="text-[10px] text-sky-600">09:00 - 11:30</p>
                    </div>
                  </div>
                  <div></div>
                  <div>
                    <div className="bg-sky-50 border-l-4 border-sky-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-sky-800">Town Hall</p>
                      <p className="text-[10px] text-sky-600">14:00 - 16:00</p>
                    </div>
                  </div>
                  <div></div>
                  <div>
                    <div className="bg-slate-50 border-l-4 border-slate-300 p-2 rounded-r">
                      <p className="text-xs font-bold text-slate-600">Maintenance</p>
                      <p className="text-[10px] text-slate-400">All Day</p>
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-6 border-b border-slate-100 py-4 items-center">
                  <div className="font-semibold text-slate-800">Suite 402</div>
                  <div></div>
                  <div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-orange-800">Client Sync</p>
                      <p className="text-[10px] text-orange-600">10:00 - 11:00</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-orange-800">Interview</p>
                      <p className="text-[10px] text-orange-600">13:30 - 14:30</p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-orange-800">Review</p>
                      <p className="text-[10px] text-orange-600">15:00 - 16:00</p>
                    </div>
                  </div>
                  <div></div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-6 border-b border-slate-100 py-4 items-center">
                  <div className="font-semibold text-slate-800">Studio B</div>
                  <div>
                    <div className="bg-rose-50 border-l-4 border-rose-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-rose-800">Podcast</p>
                      <p className="text-[10px] text-rose-600">11:00 - 13:00</p>
                    </div>
                  </div>
                  <div></div>
                  <div></div>
                  <div>
                    <div className="bg-rose-50 border-l-4 border-rose-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-rose-800">Recording</p>
                      <p className="text-[10px] text-rose-600">09:00 - 12:00</p>
                    </div>
                  </div>
                  <div></div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-6 py-4 items-center">
                  <div className="font-semibold text-slate-800">Tech Hub</div>
                  <div></div>
                  <div>
                    <div className="bg-sky-50 border-l-4 border-sky-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-sky-800">Workshop</p>
                      <p className="text-[10px] text-sky-600">14:00 - 17:00</p>
                    </div>
                  </div>
                  <div></div>
                  <div></div>
                  <div>
                    <div className="bg-sky-50 border-l-4 border-sky-500 p-2 rounded-r">
                      <p className="text-xs font-bold text-sky-800">Dev Sprint</p>
                      <p className="text-[10px] text-sky-600">10:00 - 12:00</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="mt-auto border-t border-slate-100 p-4 text-center bg-slate-50">
              <button className="text-[#0088FF] text-sm font-bold hover:underline">View All Rooms Schedule →</button>
            </div>
          </div>

          {/* RECENT ACTIVITY WIDGET (Col-span-1) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              <History size={20} className="text-slate-400" />
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* Act 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">New Booking: Room 302</h4>
                  <p className="text-xs text-slate-500 mt-1">By Sarah Jenkins • 12 mins ago</p>
                </div>
              </div>
              
              {/* Act 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">Canceled: Studio B</h4>
                  <p className="text-xs text-slate-500 mt-1">By Mike Ross • 45 mins ago</p>
                </div>
              </div>

              {/* Act 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                  <RotateCw size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">Rescheduled: Tech Hub</h4>
                  <p className="text-xs text-slate-500 mt-1">By Admin Panel • 2 hours ago</p>
                </div>
              </div>

              {/* Act 4 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">User Added: David Wu</h4>
                  <p className="text-xs text-slate-500 mt-1">Project Manager • 4 hours ago</p>
                </div>
              </div>

              {/* Act 5 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-900">Maintenance Complete</h4>
                  <p className="text-xs text-slate-500 mt-1">Floor 8 HVAC • 6 hours ago</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 text-center mt-auto">
              {/* Ini mengarah ke ActivityFeedPage yang kita buat di prompt sebelumnya */}
              <Link to="/activity-feed" className="text-[#0088FF] text-[15px] font-bold hover:underline block w-full py-2 border border-blue-100 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                View Full Audit Log
              </Link>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}