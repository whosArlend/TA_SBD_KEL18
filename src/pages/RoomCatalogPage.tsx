import DashboardLayout from '../layout/DashboardLayout';

export default function RoomCatalogPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Room Catalog</h1>
        <p className="text-slate-500 mb-8">Jelajahi ruangan yang tersedia untuk dipesan.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-emerald-500">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Halaman Room Catalog</h2>
          <p className="text-sm text-slate-400">Fitur ini akan segera tersedia.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
