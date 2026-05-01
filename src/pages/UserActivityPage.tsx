import * as React from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { 
  CheckCircle2, 
  RotateCw, 
  XCircle, 
  CalendarX2, 
  Clock, 
  ChevronDown 
} from 'lucide-react';

// --- TIPE DATA ---
type TabType = 'Semua' | 'Persetujuan' | 'Penjadwalan Ulang';
type NotificationType = 'approved' | 'reschedule_accepted' | 'rejected' | 'reschedule_rejected';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: React.ReactNode;
  badgeLabel: string;
  timestamp: string;
  actionText: string;
  quote?: string;
}

// --- DATA DUMMY ---
const notificationsData: Notification[] = [
  {
    id: '1',
    type: 'approved',
    title: 'Booking Approved',
    badgeLabel: 'DISETUJUI',
    message: (
      <>Reservasi Anda untuk <span className="font-bold text-slate-800">Innovation Lab (Gedung A, Lt. 3)</span> pada 24 Okt 2023 pukul 09:00 WIB telah disetujui oleh Administrator.</>
    ),
    timestamp: 'Baru saja',
    actionText: 'Lihat Detail Tiket',
  },
  {
    id: '2',
    type: 'reschedule_accepted',
    title: 'Reschedule Request Accepted',
    badgeLabel: 'PENJADWALAN ULANG',
    message: (
      <>Permintaan perubahan jadwal untuk <span className="font-bold text-slate-800">Boardroom Platinum</span> telah diterima. Waktu baru: 26 Okt 2023, 14:00 - 16:00 WIB.</>
    ),
    timestamp: '2 jam yang lalu',
    actionText: 'Perbarui Kalender',
  },
  {
    id: '3',
    type: 'rejected',
    title: 'Booking Rejected',
    badgeLabel: 'DITOLAK',
    message: (
      <>Maaf, reservasi <span className="font-bold text-slate-800">Creative Corner</span> pada 25 Okt 2023 ditolak karena pemeliharaan fasilitas mendadak.</>
    ),
    quote: '"Mohon maaf, ruangan sedang dalam perbaikan sistem pendingin udara hingga akhir minggu." - Admin HR',
    timestamp: 'Kemarin, 16:45 WIB',
    actionText: 'Cari Ruangan Lain',
  },
  {
    id: '4',
    type: 'reschedule_rejected',
    title: 'Reschedule Request Rejected',
    badgeLabel: 'GAGAL RESCHEDULE',
    message: (
      <>Permintaan pemindahan jadwal untuk <span className="font-bold text-slate-800">War Room Alpha</span> tidak dapat diproses karena bentrok dengan jadwal rutin Direksi.</>
    ),
    timestamp: '2 hari yang lalu',
    actionText: 'Lihat Alternatif',
  },
];

export default function UserActivityPage() {
  const fullName = localStorage.getItem('userName') || 'User';
  const role = (localStorage.getItem('role') as 'admin' | 'user') || 'user';
  
  const [activeTab, setActiveTab] = React.useState<TabType>('Semua');

  // --- LOGIKA FILTER BERDASARKAN TAB ---
  const filteredNotifications = notificationsData.filter((notif) => {
    if (activeTab === 'Semua') return true;
    if (activeTab === 'Persetujuan') return ['approved', 'rejected'].includes(notif.type);
    if (activeTab === 'Penjadwalan Ulang') return ['reschedule_accepted', 'reschedule_rejected'].includes(notif.type);
    return true;
  });

  // --- HELPER UNTUK STYLING BERDASARKAN TIPE ---
  const getTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          iconBg: 'bg-emerald-100',
          badgeBg: 'bg-emerald-100 text-emerald-700',
        };
      case 'reschedule_accepted':
        return {
          icon: <RotateCw className="w-6 h-6 text-sky-600" />,
          iconBg: 'bg-sky-100',
          badgeBg: 'bg-sky-100 text-sky-700',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          iconBg: 'bg-rose-100',
          badgeBg: 'bg-rose-100 text-rose-700',
        };
      case 'reschedule_rejected':
        return {
          icon: <CalendarX2 className="w-6 h-6 text-amber-600" />,
          iconBg: 'bg-amber-100',
          badgeBg: 'bg-amber-100 text-amber-700',
        };
    }
  };

  return (
    <DashboardLayout role={role} userName={fullName} userRole="PROJECT LEAD">
      <div className="max-w-5xl">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">
            Aktivitas Terbaru & Notifikasi
          </h1>
          <p className="text-slate-500 text-[15px]">
            Pantau status reservasi ruang rapat dan pembaruan jadwal Anda secara real-time.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-3 mb-8">
          {(['Semua', 'Persetujuan', 'Penjadwalan Ulang'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#007BFF] text-white shadow-sm border border-[#007BFF]'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* NOTIFICATION LIST */}
        <div className="flex flex-col gap-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const styles = getTypeStyles(notif.type);

              return (
                <div 
                  key={notif.id} 
                  className="bg-white border border-slate-200 rounded-xl p-5 flex gap-4 hover:shadow-sm transition-shadow"
                >
                  {/* ICON */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                    {styles.icon}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-[17px]">
                        {notif.title}
                      </h3>
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wide ${styles.badgeBg}`}>
                        {notif.badgeLabel}
                      </span>
                    </div>
                    
                    <p className="text-[15px] text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* QUOTE BOX (Untuk Notif Rejected) */}
                    {notif.quote && (
                      <div className="mt-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-sm text-slate-500 italic">
                        {notif.quote}
                      </div>
                    )}

                    {/* FOOTER: Timestamp & Action */}
                    <div className="flex items-center gap-5 mt-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        {notif.timestamp}
                      </div>
                      <button className="text-sm font-bold text-[#007BFF] hover:text-blue-800 hover:underline transition-colors">
                        {notif.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* EMPTY STATE: Jika tidak ada data di tab yang dipilih */
            <div className="bg-white border border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Belum ada aktivitas</h3>
              <p className="text-sm text-slate-500">Tidak ada notifikasi untuk kategori ini saat ini.</p>
            </div>
          )}
        </div>

        {/* LOAD MORE BUTTON */}
        {filteredNotifications.length > 0 && (
          <div className="mt-8 flex justify-center pb-10">
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              Tampilkan Lebih Banyak
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}