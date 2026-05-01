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
  Check,
  CheckCheck
} from 'lucide-react';

// --- DEFINISI TIPE DATA ---
type ActivityTab = 'all' | 'approvals' | 'canceled' | 'returned';
type ActivityType = 'approvals' | 'canceled' | 'rescheduled' | 'returned';

interface ActivityItem {
  id: string;
  type: ActivityType;
  iconType: ActivityType;
  title: string;
  time: string;
  actor: string;
  role?: string;
  actionText: string;
  isRead: boolean;
  timeRange?: string;
  peopleCount?: string;
  badgeLabel?: string;
  badgeStyle?: string;
  rescheduleFrom?: string;
  rescheduleTo?: string;
}

// --- DATA DUMMY AWAL ---
const initialActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'approvals',
    iconType: 'approvals',
    title: 'New Booking: Room 302',
    time: '2 mins ago',
    actor: 'Sarah Jenkins',
    role: 'Senior Analyst',
    actionText: "reserved the Executive Suite for a 'Quarterly Strategy Session'.",
    timeRange: '14:00 - 16:30',
    peopleCount: '12 People',
    isRead: false,
  },
  {
    id: '2',
    type: 'canceled',
    iconType: 'canceled',
    title: 'Canceled: Studio B',
    time: '18 mins ago',
    actor: 'Mark Thompson',
    role: 'Creative Director',
    actionText: "released the reservation due to schedule conflict.",
    badgeLabel: 'HIGH PRIORITY RELEASE',
    badgeStyle: 'bg-red-50 text-red-700 border-red-100',
    isRead: false,
  },
  {
    id: '3',
    type: 'rescheduled', // Rescheduled akan muncul di 'All Activity'
    iconType: 'rescheduled',
    title: 'Rescheduled: Tech Hub',
    time: '1 hour ago',
    actor: 'Development Team A',
    actionText: "moved 'Sprint Planning' from Tuesday 10:00 to Wednesday 09:00.",
    rescheduleFrom: 'Aug 14, 10:00',
    rescheduleTo: 'Aug 15, 09:00',
    isRead: false,
  },
  {
    id: '4',
    type: 'returned',
    iconType: 'returned',
    title: 'Returned Early: Executive Suite 302',
    time: '3 hours ago',
    actor: 'Sarah Jenkins',
    actionText: "ended their booking 30 minutes ahead of schedule. Room is now available.",
    badgeLabel: 'RETURNED EARLY',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    isRead: false,
  }
];

export default function ActivityFeedPage() {
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = React.useState<ActivityTab>('all');
  const [activities, setActivities] = React.useState<ActivityItem[]>(initialActivities);

  // Mengecek apakah masih ada notifikasi yang belum dibaca
  const hasUnread = activities.some(act => !act.isRead);

  // --- LOGIKA FILTER ---
  const filteredActivities = activities.filter((act) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approvals') return act.type === 'approvals';
    if (activeTab === 'canceled') return act.type === 'canceled';
    if (activeTab === 'returned') return act.type === 'returned';
    return false;
  });

  // --- FUNGSI MARK ALL AS READ ---
  const handleMarkAllAsRead = () => {
    setActivities(activities.map(act => ({ ...act, isRead: true })));
  };

  // --- HELPER UNTUK IKON BERDASARKAN TIPE ---
  const getIconData = (type: ActivityType) => {
    switch(type) {
      case 'approvals': return { icon: <CalendarPlus className="w-6 h-6 text-sky-600" />, bg: 'bg-sky-50 border-sky-100' };
      case 'canceled': return { icon: <XCircle className="w-6 h-6 text-rose-600" />, bg: 'bg-rose-50 border-rose-100' };
      case 'rescheduled': return { icon: <RotateCw className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50 border-amber-100' };
      case 'returned': return { icon: <ArrowLeftSquare className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50 border-indigo-100' };
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-[32px] font-bold text-slate-900 mb-2">Activity Feed</h1>
            <p className="text-slate-500 text-[15px]">Real-time logs of all space operations and system events.</p>
          </div>
          
          {/* Tombol Mark as Read Terhubung ke State */}
          <button 
            onClick={handleMarkAllAsRead}
            disabled={!hasUnread}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-md transition-all text-sm shadow-sm border ${
              hasUnread 
                ? 'bg-blue-50 border-[#0088FF] text-[#0088FF] hover:bg-blue-100' 
                : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {hasUnread ? <Check size={16} /> : <CheckCheck size={16} />}
            {hasUnread ? 'Mark all as read' : 'All caught up!'}
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-8 border-b border-slate-200 mb-8 px-2">
          {(['all', 'approvals', 'canceled', 'returned'] as ActivityTab[]).map((tab) => {
            const labels = {
              all: 'All Activity',
              approvals: 'Approvals',
              canceled: 'Canceled',
              returned: 'Returned Early'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab ? 'text-[#0088FF]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {labels[tab]}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0088FF]" />}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Activity List Terfilter */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((act) => {
                const { icon, bg } = getIconData(act.iconType);
                
                return (
                  <div 
                    key={act.id} 
                    className={`rounded-xl p-6 shadow-sm border flex gap-5 transition-all relative ${
                      act.isRead 
                        ? 'bg-white border-slate-100' 
                        : 'bg-[#F4FAFF] border-blue-200' // Tampilan sedikit berbeda jika unread
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!act.isRead && (
                      <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-[#0088FF] rounded-full shadow-[0_0_8px_rgba(0,136,255,0.4)]"></div>
                    )}

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg}`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pr-6">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`text-[17px] font-semibold ${act.isRead ? 'text-slate-800' : 'text-slate-900'}`}>
                          {act.title}
                        </h3>
                        <span className={`text-sm ${act.isRead ? 'text-slate-400' : 'text-[#0088FF] font-medium'}`}>
                          {act.time}
                        </span>
                      </div>
                      
                      <p className="text-[15px] text-slate-600 mb-4 leading-relaxed">
                        <span className="font-bold text-slate-800">{act.actor}</span> {act.role && `(${act.role})`} {act.actionText}
                      </p>

                      {/* Spesifik Konten Tambahan Berdasarkan Tipe */}
                      {act.timeRange && act.peopleCount && (
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-md text-sm border border-slate-200 shadow-sm">
                            <Clock size={14} className="text-slate-400" /> {act.timeRange}
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 rounded-md text-sm border border-slate-200 shadow-sm">
                            <Users size={14} className="text-slate-400" /> {act.peopleCount}
                          </div>
                        </div>
                      )}

                      {act.badgeLabel && (
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded uppercase tracking-wide border ${act.badgeStyle}`}>
                          {act.badgeLabel}
                        </span>
                      )}

                      {act.rescheduleFrom && act.rescheduleTo && (
                        <div className="flex items-center gap-3 text-sm font-medium bg-white border border-slate-200 w-fit px-3 py-2 rounded-lg shadow-sm">
                          <span className="text-slate-400 line-through">{act.rescheduleFrom}</span>
                          <ArrowRight size={16} className="text-slate-400" />
                          <span className="text-[#0088FF]">{act.rescheduleTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty State jika Tab kosong
              <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">No activities found</h3>
                <p className="text-sm text-slate-500">There are no records matching this category.</p>
              </div>
            )}

            {filteredActivities.length > 0 && (
              <div className="mt-4 text-center pb-8">
                <button className="text-[#0088FF] font-medium hover:underline text-[15px]">
                  Load older activities...
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Widgets (Tetap Sesuai Desain) */}
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