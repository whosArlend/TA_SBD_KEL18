import DashboardLayout from '../layout/DashboardLayout';

export default function ArchivedRoomsPage() {
  const userName = localStorage.getItem('userName') ?? 'Admin';

  return (
    <DashboardLayout role="admin" userName={userName} userRole="Administrator">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Archived Rooms</h1>
        <p className="text-slate-500 mb-8">Daftar ruangan yang telah diarsipkan.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-amber-500">
              <path d="M21 8v13H3V8" />
              <path d="M1 3h22v5H1z" />
              <path d="M10 12h4" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Halaman Archived Rooms</h2>
          <p className="text-sm text-slate-400">Fitur ini akan segera tersedia.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
