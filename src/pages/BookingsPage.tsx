import DashboardLayout from '../layout/DashboardLayout';

export default function BookingsPage() {
  const userName = localStorage.getItem('userName') ?? 'Admin';

  return (
    <DashboardLayout role="admin" userName={userName} userRole="Administrator">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Bookings</h1>
        <p className="text-slate-500 mb-8">Kelola semua pemesanan ruangan yang masuk.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-sky-500">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              <path d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Halaman Bookings</h2>
          <p className="text-sm text-slate-400">Fitur ini akan segera tersedia.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
