import * as React from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { 
  CalendarPlus, 
  XCircle, 
  RotateCw, 
  ArrowLeftSquare, 
  Clock, 
  Users, 
  ArrowRight,
  Check
} from 'lucide-react';

type ActivityTab = 'all' | 'approvals' | 'canceled' | 'returned';

export default function ActivityFeedPage() {
  const fullName = localStorage.getItem('userName') || 'Alex Rivera';
  const [activeTab, setActiveTab] = React.useState<ActivityTab>('all');

  return (
    <DashboardLayout role="admin" userName={fullName} userRole="System Admin">
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 mb-2">Activity Feed</h1>
            <p className="text-slate-500 text-[15px]">Real-time logs of all space operations and system events.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#0088FF] text-[#0088FF] font-medium rounded-md hover:bg-blue-50 transition-colors text-sm shadow-sm">
            <Check size={16} />
            Mark all as read
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b border-slate-200 mb-8 px-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 text-[15px] font-medium transition-colors relative ${
              activeTab === 'all' ? 'text-[#0088FF]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Activity
            {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF]" />}
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`pb-4 text-[15px] font-medium transition-colors relative ${
              activeTab === 'approvals' ? 'text-[#0088FF]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Approvals
            {activeTab === 'approvals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF]" />}
          </button>
          <button
            onClick={() => setActiveTab('canceled')}
            className={`pb-4 text-[15px] font-medium transition-colors relative ${
              activeTab === 'canceled' ? 'text-[#0088FF]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Canceled
            {activeTab === 'canceled' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF]" />}
          </button>
          <button
            onClick={() => setActiveTab('returned')}
            className={`pb-4 text-[15px] font-medium transition-colors relative ${
              activeTab === 'returned' ? 'text-[#0088FF]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Returned Early
            {activeTab === 'returned' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF]" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Activity List */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            
            {/* ITEM 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex gap-5 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0 border border-sky-100">
                <CalendarPlus className="w-6 h-6 text-sky-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[17px] font-semibold text-slate-900">New Booking: Room 302</h3>
                  <span className="text-sm text-slate-500">2 mins ago</span>
                </div>
                <p className="text-[15px] text-slate-600 mb-4 leading-relaxed">
                  <span className="font-bold text-slate-800">Sarah Jenkins</span> (Senior Analyst) reserved the Executive Suite for a 'Quarterly Strategy Session'.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md text-sm border border-slate-200">
                    <Clock size={14} className="text-slate-400" /> 14:00 - 16:30
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-md text-sm border border-slate-200">
                    <Users size={14} className="text-slate-400" /> 12 People
                  </div>
                </div>
              </div>
            </div>

            {/* ITEM 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex gap-5 hover:border-rose-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 border border-rose-100">
                <XCircle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[17px] font-semibold text-slate-900">Canceled: Studio B</h3>
                  <span className="text-sm text-slate-500">18 mins ago</span>
                </div>
                <p className="text-[15px] text-slate-600 mb-4 leading-relaxed">
                  <span className="font-bold text-slate-800">Mark Thompson</span> (Creative Director) released the reservation due to schedule conflict.
                </p>
                <span className="inline-block px-2.5 py-1 bg-red-50 text-red-700 text-[11px] font-bold rounded uppercase tracking-wide border border-red-100">
                  HIGH PRIORITY RELEASE
                </span>
              </div>
            </div>

            {/* ITEM 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex gap-5 hover:border-amber-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-100">
                <RotateCw className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[17px] font-semibold text-slate-900">Rescheduled: Tech Hub</h3>
                  <span className="text-sm text-slate-500">1 hour ago</span>
                </div>
                <p className="text-[15px] text-slate-600 mb-3 leading-relaxed">
                  <span className="font-bold text-slate-800">Development Team A</span> moved 'Sprint Planning' from Tuesday 10:00 to Wednesday 09:00.
                </p>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className="text-slate-400 line-through">Aug 14, 10:00</span>
                  <ArrowRight size={16} className="text-slate-400" />
                  <span className="text-[#0088FF]">Aug 15, 09:00</span>
                </div>
              </div>
            </div>

            {/* ITEM 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex gap-5 hover:border-indigo-200 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                <ArrowLeftSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-[17px] font-semibold text-slate-900">Returned Early: Executive Suite 302</h3>
                  <span className="text-sm text-slate-500">3 hours ago</span>
                </div>
                <p className="text-[15px] text-slate-600 mb-4 leading-relaxed">
                  <span className="font-bold text-slate-800">Sarah Jenkins</span> ended their booking 30 minutes ahead of schedule. Room is now available.
                </p>
                <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded uppercase tracking-wide border border-indigo-100">
                  RETURNED EARLY
                </span>
              </div>
            </div>

            <div className="mt-4 text-center pb-8">
              <button className="text-[#0088FF] font-medium hover:underline text-[15px]">
                Load older activities...
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Widgets */}
          <div className="flex flex-col gap-6">
            
            {/* Widget: ACTIVITY SUMMARY */}
            <div className="bg-[#0065A1] rounded-xl p-6 shadow-md text-white">
              <h3 className="text-[11px] font-bold tracking-widest text-sky-100 mb-6 uppercase">Activity Summary</h3>
              
              <div className="mb-8">
                <div className="text-[44px] leading-none font-bold mb-2">124</div>
                <div className="text-sky-100 text-[15px]">Total Events Today</div>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sky-100 text-sm">Bookings</span>
                    <span className="font-bold text-[17px]">86</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#004A77] rounded-full overflow-hidden">
                    <div className="w-[70%] h-full bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sky-100 text-sm">Cancellations</span>
                    <span className="font-bold text-[17px]">12</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#004A77] rounded-full overflow-hidden">
                    <div className="w-[15%] h-full bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget: URGENT ATTENTION */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[17px] font-bold text-slate-800">Urgent Attention</h3>
                <div className="w-2 h-2 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.6)]"></div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="bg-sky-50 border-l-4 border-[#0088FF] p-4 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-1 text-[15px]">Rescheduled Booking</h4>
                  <p className="text-sm text-slate-600 mb-3">Room 204: 4:30 PM Today</p>
                  <button className="text-[11px] font-bold text-[#0088FF] hover:text-blue-800 tracking-wider uppercase">
                    Review Change
                  </button>
                </div>
                
                <div className="bg-[#FFF8F1] border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-1 text-[15px]">Approvals Pending</h4>
                  <p className="text-sm text-slate-600 mb-3">4 new board room requests</p>
                  <button className="text-[11px] font-bold text-orange-700 hover:text-orange-800 tracking-wider uppercase">
                    View Queue
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}