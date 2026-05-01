import DashboardLayout from '../layout/DashboardLayout';

export default function BookingHistoryPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Booking History</h1>
        <p className="text-slate-500 mb-8">Riwayat seluruh pemesanan ruangan.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-violet-500">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Halaman Booking History</h2>
          <p className="text-sm text-slate-400">Fitur ini akan segera tersedia.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
