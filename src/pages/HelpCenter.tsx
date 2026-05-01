import { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { BookOpen, HelpCircle, MessageSquare, Mail, ChevronDown } from 'lucide-react';

export default function HelpCenter() {
  const fullName = localStorage.getItem('userName') || 'User Baru';

  // State untuk melacak FAQ mana yang sedang terbuka (null berarti tertutup semua)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    // Jika diklik FAQ yang sudah terbuka, maka tutup. Jika tertutup, maka buka.
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      id: 1,
      title: 'Pilih Ruangan di Katalog',
      desc: 'Jelajahi berbagai pilihan ruangan yang tersedia sesuai dengan kebutuhan kapasitas dan fasilitas Anda di menu Room Catalog.',
    },
    {
      id: 2,
      title: 'Klik Tombol Pinjam',
      desc: "Setelah menemukan ruangan yang cocok, klik tombol 'Pinjam' atau 'Book Now' untuk memulai proses reservasi.",
    },
    {
      id: 3,
      title: 'Isi Detail Form',
      desc: 'Lengkapi informasi yang diperlukan seperti tanggal, durasi, jumlah peserta, dan keperluan penggunaan ruangan.',
    },
    {
      id: 4,
      title: 'Tunggu Persetujuan Admin',
      desc: 'Tim admin akan meninjau pengajuan Anda. Status booking dapat dipantau secara real-time di menu My Bookings.',
    },
  ];

  const faqs = [
    {
      q: 'Berapa lama proses persetujuan booking?',
      a: 'Proses persetujuan biasanya memakan waktu 15-60 menit selama jam operasional kantor. Anda akan menerima notifikasi email setelah status berubah.',
    },
    {
      q: 'Bisakah saya membatalkan pesanan yang sudah disetujui?',
      a: "Ya, pembatalan dapat dilakukan melalui menu 'My Bookings' maksimal 2 jam sebelum waktu peminjaman dimulai.",
    },
    {
      q: 'Apa yang harus dilakukan jika kunci ruangan belum tersedia?',
      a: "Silakan hubungi staf operasional di meja resepsionis lantai terkait atau gunakan fitur 'Hubungi Admin' di halaman ini.",
    },
    {
      q: 'Apakah ada batas maksimal durasi peminjaman?',
      a: 'Maksimal durasi peminjaman standar adalah 8 jam per hari. Untuk peminjaman lebih dari 1 hari, silakan ajukan permohonan khusus ke Admin.',
    },
  ];

  return (
    <DashboardLayout role="user" userName={fullName} userRole="PROJECT LEAD">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Pusat Bantuan & Panduan</h2>
        <p className="text-slate-500">
          Temukan jawaban untuk pertanyaan Anda dan panduan penggunaan sistem TEKSPACE.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column: Panduan Peminjaman */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-[#0088FF]" size={24} />
            <h3 className="text-lg font-bold text-slate-800">Panduan Peminjaman Ruangan</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step) => (
              <div key={step.id} className="bg-slate-50 p-5 rounded-lg border border-slate-100">
                <div className="w-8 h-8 rounded-md bg-[#004A8F] text-white flex items-center justify-center font-bold mb-4 shadow-sm">
                  {step.id}
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{step.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Support & Jam Operasional */}
        <div className="flex flex-col gap-6">
          {/* Support Box */}
          <div className="bg-[#0077B6] rounded-xl p-6 text-white shadow-sm">
            <h3 className="text-lg font-bold mb-3">Butuh Bantuan Lebih?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Tim support kami siap membantu kendala teknis atau pertanyaan mendesak mengenai pemesanan ruangan Anda.
            </p>
            
            <div className="space-y-3">
              {/* Tombol WhatsApp Terintegrasi */}
              <button 
                onClick={() => {
                  const nama = localStorage.getItem('userName') || 'Mahasiswa';
                  const pesan = `Halo Admin TEKSPACE, saya ${nama}. Saya butuh bantuan terkait reservasi ruangan kampus.`;
                  // Ganti nomor di bawah dengan nomor WhatsApp admin yang asli (gunakan format 62)
                  window.open(`https://wa.me/6287822408980?text=${encodeURIComponent(pesan)}`, '_blank');
                }}
                className="w-full bg-white/20 hover:bg-white/30 transition border border-white/30 rounded-lg p-3 flex items-center gap-4 text-left"
              >
                <MessageSquare size={20} className="text-white" />
                <div>
                  <p className="text-[10px] font-bold text-white/70 tracking-wider uppercase">Live Chat (WhatsApp)</p>
                  <p className="font-semibold text-sm">Hubungi Admin</p>
                </div>
              </button>
              
              {/* Tombol Email Terintegrasi */}
              <button 
                onClick={() => {
                  const nama = localStorage.getItem('userName') || 'Mahasiswa';
                  const subject = `[TEKSPACE Support] Butuh Bantuan - ${nama}`;
                  const body = `Halo Tim Support TEKSPACE,%0D%0A%0D%0ASaya ${nama} ingin bertanya mengenai...`;
                  window.location.href = `mailto:support@spacereserve.com?subject=${subject}&body=${body}`;
                }}
                className="w-full bg-white/20 hover:bg-white/30 transition border border-white/30 rounded-lg p-3 flex items-center gap-4 text-left"
              >
                <Mail size={20} className="text-white" />
                <div>
                  <p className="text-[10px] font-bold text-white/70 tracking-wider uppercase">Email Support</p>
                  <p className="font-semibold text-sm">support@spacereserve.com</p>
                </div>
              </button>
            </div>
          </div>

          {/* Jam Operasional */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
              Jam Operasional Support
            </h3>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm text-slate-700 font-medium">Senin - Jumat</span>
              <span className="text-sm text-[#0088FF] font-bold">08:00 - 18:00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-700 font-medium">Sabtu</span>
              <span className="text-sm text-slate-600 font-medium">09:00 - 13:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: FAQ */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="text-[#0088FF]" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Pertanyaan yang Sering Diajukan (FAQ)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              onClick={() => toggleFaq(index)}
              className="group cursor-pointer bg-transparent hover:bg-slate-50 p-3 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-[15px] pr-4">{faq.q}</h4>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 mt-1 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180 text-[#0088FF]' : ''
                  }`} 
                />
              </div>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFaq === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-sm text-slate-500 leading-relaxed pr-8">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
