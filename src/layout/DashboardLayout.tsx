import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Search, Bell, HelpCircle, LogOut, LayoutDashboard, 
  Archive, History, BookOpen, Bookmark, Building2, ClipboardList
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode;
  role?: 'admin' | 'user'; 
  userName?: string;       
}

export default function DashboardLayout({ children, role: propRole, userName: propName }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role: authRole, fullName, signOut } = useAuth()

  // Source of truth: AuthContext (fallback ke prop untuk kompatibilitas UI lama)
  const activeRole = propRole || authRole || location.state?.currentRole || 'user';
  const activeUserName = propName || fullName || 'User';

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true });
  };

  const adminMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { name: 'Room Management', icon: Building2, path: '/room-management' },
    { name: 'Bookings', icon: ClipboardList, path: '/bookings' },
    { name: 'Archived Rooms', icon: Archive, path: '/archived-rooms' },
    { name: 'Booking History', icon: History, path: '/booking-history' },
  ];

  const userMenu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
    { name: 'Room Catalog', icon: BookOpen, path: '/room-catalog' },
    { name: 'My Bookings', icon: Bookmark, path: '/my-bookings' },
  ];

  const menu = activeRole === 'admin' ? adminMenu : userMenu;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141C2F] text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-[#0088FF] p-2 rounded-lg text-white">
            {activeRole === 'admin' ? <Building2 size={24} /> : <span className="font-bold text-lg px-1">P</span>}
          </div>
          <div>
            <h1 className="text-white font-bold tracking-wider uppercase text-lg">Tekspace</h1>
            <p className="text-xs text-slate-400">
              {activeRole === 'admin' ? 'Corporate HQ' : 'Corporate Portal'}
            </p>
          </div>
        </div>

        <nav className="flex-1 mt-4">
          {menu.map((item) => {
            const isActivityFeed = activeRole === 'admin' && item.name === 'Dashboard' && location.pathname === '/activity-feed';
            const isActive = location.pathname === item.path || isActivityFeed;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive 
                    ? 'bg-slate-800 border-l-4 border-[#0088FF] text-white' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-[#0088FF]' : 'text-slate-400'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          {activeRole === 'user' && (
            <button className="w-full mb-4 bg-[#0088FF] text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition flex items-center justify-center gap-2">
              <span className="text-lg">⊕</span> Book Now
            </button>
          )}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-2 py-3 w-full text-slate-400 hover:text-white transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mr-8">Tekspace</h2>
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-lg w-96 border border-slate-200">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search rooms or bookings..." 
                className="bg-transparent border-none outline-none w-full text-sm text-slate-700 placeholder:text-slate-400" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              // FIX: Mengirim state router saat diklik
              onClick={() => navigate(activeRole === 'admin' ? '/activity-feed' : '/user-activity', { state: { currentRole: activeRole } })}
              className={`transition-colors relative ${location.pathname === '/activity-feed' || location.pathname === '/user-activity' ? 'text-[#0088FF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button 
              // FIX: Mengirim state router saat diklik
              onClick={() => navigate('/help-center', { state: { currentRole: activeRole } })}
              className={`transition-colors ${location.pathname === '/help-center' ? 'text-[#0088FF]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <HelpCircle size={20} />
            </button>

            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <span className="text-sm font-bold text-slate-800">{activeUserName}</span>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUserName}`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}