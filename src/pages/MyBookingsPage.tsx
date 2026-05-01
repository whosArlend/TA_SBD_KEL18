import DashboardLayout from '../layout/DashboardLayout';

export default function MyBookingsPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Bookings</h1>
        <p className="text-slate-500 mb-8">Daftar pemesanan ruangan kamu.</p>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-sky-500">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-1">Halaman My Bookings</h2>
          <p className="text-sm text-slate-400">Fitur ini akan segera tersedia.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
