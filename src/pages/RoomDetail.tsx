import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../lib/api';
import DashboardLayout from '../layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronRight, Users, Layers, Check,
  Lock, CheckCircle2, ArrowRight,
  Info, ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon,
  Building, MapPin, Calendar, CalendarCheck, History
} from 'lucide-react';

// ─── Reusable sub-components ────────────────────────────────────────────────

const PillLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-400 mb-1.5">
    {children}
  </p>
);

const StatCard: React.FC<{ label: string; icon: React.ReactNode; value: React.ReactNode }> = ({
  label, icon, value,
}) => (
  <div className="bg-slate-50 rounded-lg p-3">
    <PillLabel>{label}</PillLabel>
    <p className="text-[15px] font-medium text-slate-800 flex items-center gap-2">
      <span className="text-sky-600">{icon}</span>
      {value}
    </p>
  </div>
);

// ─── Slot types ──────────────────────────────────────────────────────────────

type SlotResult =
  | { status: 'past' }
  | { status: 'booked'; detail: api.Reservation; isPast: boolean }
  | { status: 'selected' }
  | { status: 'available' };

// ─── Main component ──────────────────────────────────────────────────────────

const RoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userName = auth?.fullName || localStorage.getItem('userName') || 'User';

  const [room, setRoom] = useState<api.Room | null>(null);
  const [amenities, setAmenities] = useState<api.Amenity[]>([]);
  const [rules, setRules] = useState<api.Rule[]>([]);
  const [reservations, setReservations] = useState<api.Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  useEffect(() => {
    if (roomId) fetchRoomDetail();
  }, [roomId]);

  const fetchRoomDetail = async () => {
    setLoading(true);
    try {
      const roomData = await api.getRoomById(roomId!);
      setRoom(roomData);
      if (roomData.room_amenities_map) {
        setAmenities(
          roomData.room_amenities_map.map((item: any) => ({
            amenity_id: item.amenities.amenity_id,
            amenity_name: item.amenities.amenity_name,
          }))
        );
      }
      if (roomData.room_rules_map) {
        setRules(
          roomData.room_rules_map.map((item: any) => ({
            rule_id: item.rules.rule_id,
            rule_name: item.rules.rule_name,
          }))
        );
      }
      const resData = await api.getReservations({ room_id: Number(roomId) });
      setReservations(resData.filter((r: api.Reservation) => r.status !== 'Canceled'));
    } catch (error: any) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
    setSelectedSlot(null);
  };

  const getSlotStatus = (hour: number): SlotResult => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const current = new Date(selectedDate);
    current.setHours(0, 0, 0, 0);

    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const isToday = dateStr === now.toLocaleDateString('en-CA');

    if (current < today || (isToday && hour <= now.getHours())) {
      const wasReserved = reservations.find((res) => {
        const start = new Date(res.start_time);
        return (
          start.toLocaleDateString('en-CA') === dateStr &&
          hour === start.getHours()
        );
      });
      return wasReserved
        ? { status: 'booked', detail: wasReserved, isPast: true }
        : { status: 'past' };
    }

    const isReserved = reservations.find((res) => {
      const start = new Date(res.start_time);
      const end = new Date(res.end_time);
      return (
        start.toLocaleDateString('en-CA') === dateStr &&
        hour >= start.getHours() &&
        hour < end.getHours()
      );
    });

    if (isReserved) return { status: 'booked', detail: isReserved, isPast: false };
    if (selectedSlot === hour) return { status: 'selected' };
    return { status: 'available' };
  };

  const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;

  const isSelectedToday =
    selectedDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');

  const dateLabel = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });

  const fullDateLabel = selectedDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading || !room) return null;

  return (
    <DashboardLayout role="user" userName={userName}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 font-sans">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-1.5 mb-2">
          <Link
            to="/rooms"
            className="text-[12px] font-medium text-slate-400 hover:text-sky-600 uppercase tracking-wider transition-colors"
          >
            User Portal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[12px] font-medium text-sky-600 uppercase tracking-wider">
            Check Availability
          </span>
        </nav>

        {/* ── Room Header Card ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="h-56 lg:h-auto bg-slate-100 overflow-hidden">
            <img
              src={room.image_url || ''}
              alt={room.room_name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="p-6 lg:p-8 flex flex-col justify-between gap-6">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <PillLabel>{room.room_type || 'Meeting Room'}</PillLabel>
                <h1 className="text-2xl font-semibold text-slate-900 leading-snug">
                  {room.room_name}
                </h1>
              </div>
              <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Capacity"
                icon={<Users className="w-4 h-4" />}
                value={<>{room.capacity} <span className="text-slate-400 font-normal text-sm">pax</span></>}
              />
              <StatCard
                label="Location"
                icon={<MapPin className="w-4 h-4" />}
                value={room.location || '—'}
              />
              <StatCard
                label="Type"
                icon={<Building className="w-4 h-4" />}
                value={room.room_type || '—'}
              />
            </div>

            {/* Amenities */}
            <div>
              <PillLabel>Amenities</PillLabel>
              <div className="flex flex-wrap gap-2">
                {amenities.map((item) => (
                  <span
                    key={item.amenity_id}
                    className="inline-flex items-center gap-1.5 text-[13px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-sky-500" />
                    {item.amenity_name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Availability Grid ── */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="text-[15px] font-medium text-slate-900">Daily Schedule</p>
              <p className="text-[13px] text-slate-400 mt-0.5 capitalize">{fullDateLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                aria-label="Hari sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSelectedDate(new Date()); setSelectedSlot(null); }}
                className={`px-4 py-1.5 rounded-lg border text-[13px] font-medium transition-all ${
                  isSelectedToday
                    ? 'border-slate-200 text-slate-700 bg-white'
                    : 'border-sky-200 text-sky-600 bg-sky-50'
                }`}
              >
                {isSelectedToday ? 'Today' : dateLabel}
              </button>
              <button
                onClick={() => changeDate(1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                aria-label="Hari berikutnya"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-6 py-2.5 bg-slate-50 border-b border-slate-100">
            {[
              { color: 'bg-sky-100 border-sky-400', label: 'Dipilih' },
              { color: 'bg-slate-100 border-slate-300', label: 'Terisi' },
              { color: 'bg-white border-dashed border-slate-300', label: 'Tersedia' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded border ${color}`} />
                <span className="text-[12px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>

          {/* Slots */}
          <div className="divide-y divide-slate-100">
            {HOURS.map((hour) => {
              const slot = getSlotStatus(hour);
              const time = fmt(hour);

              // ── Past ──
              if (slot.status === 'past') {
                return (
                  <div key={hour} className="grid grid-cols-[72px_1fr] opacity-40">
                    <div className="flex items-center justify-center py-3 border-r border-slate-100 text-[12px] font-medium text-slate-400">
                      {time}
                    </div>
                    <div className="flex items-center px-4 py-3">
                      <span className="text-[12px] text-slate-400 italic">Waktu sudah berlalu</span>
                    </div>
                  </div>
                );
              }

              // ── Booked ──
              if (slot.status === 'booked') {
                return (
                  <div key={hour} className="grid grid-cols-[72px_1fr] bg-slate-50/60">
                    <div className="flex items-center justify-center py-3 border-r border-slate-100 text-[12px] font-medium text-slate-400">
                      {time}
                    </div>
                    <div className="flex items-center px-4 py-2.5">
                      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Lock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                          <div>
                            <p className="text-[13px] font-medium text-slate-700 leading-tight">
                              {slot.detail?.meeting_title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {slot.detail?.person_in_charge}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                          Booked
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // ── Selected ──
              if (slot.status === 'selected') {
                return (
                  <div
                    key={hour}
                    onClick={() => setSelectedSlot(null)}
                    className="grid grid-cols-[72px_1fr] cursor-pointer ring-2 ring-inset ring-sky-500 relative z-10"
                  >
                    <div className="flex items-center justify-center py-3 border-r border-sky-200 text-[12px] font-medium text-sky-600">
                      {time}
                    </div>
                    <div className="flex items-center px-4 py-2.5">
                      <div className="w-full flex items-center justify-between bg-sky-50 border border-sky-200 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2.5 text-sky-700 font-medium text-[13px]">
                          <CheckCircle2 className="w-4 h-4 text-sky-500" />
                          Slot dipilih
                        </div>
                        <span className="text-[12px] text-sky-500 font-medium">
                          {fmt(hour)} – {fmt(hour + 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // ── Available ──
              return (
                <div
                  key={hour}
                  onClick={() => setSelectedSlot(hour)}
                  className="grid grid-cols-[72px_1fr] cursor-pointer group hover:bg-sky-50/30 transition-colors"
                >
                  <div className="flex items-center justify-center py-3 border-r border-slate-100 text-[12px] font-medium text-slate-400 group-hover:text-sky-500 transition-colors">
                    {time}
                  </div>
                  <div className="flex items-center px-4 py-2.5">
                    <div className="w-full h-10 border border-dashed border-slate-200 group-hover:border-sky-300 group-hover:bg-sky-50 rounded-lg flex items-center justify-center gap-2 text-[12px] text-slate-300 group-hover:text-sky-500 font-medium transition-all uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      Pilih slot ini
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Room Rules ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-[15px] font-medium text-slate-900 mb-4">Room Rules & Guidelines</p>
          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div key={rule.rule_id} className="flex items-start gap-3 py-3">
                <CheckCircle2 className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-slate-800">{rule.rule_name}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    Kebijakan resmi ruangan harus dipatuhi.
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 bg-sky-50 border border-sky-100 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-sky-700">
              Pelanggaran aturan dapat membatasi hak akses pemesanan di masa mendatang.
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="pb-8">
          <button
            onClick={() =>
              selectedSlot &&
              navigate(
                `/booking/new?room_id=${roomId}&time=${selectedSlot}&date=${selectedDate.toLocaleDateString('en-CA')}`
              )
            }
            disabled={!selectedSlot}
            className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[15px] font-medium transition-all duration-200 ${
              selectedSlot
                ? 'bg-sky-700 text-white hover:bg-sky-800 shadow-sm shadow-sky-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CalendarCheck className="w-5 h-5" />
            {selectedSlot
              ? `Konfirmasi Booking — ${fmt(selectedSlot)}`
              : 'Pilih slot waktu di atas'}
            {selectedSlot && <ArrowRight className="w-4 h-4 ml-1" />}
          </button>
          {selectedSlot && (
            <p className="text-center text-[12px] text-slate-400 mt-2">
              {fullDateLabel} · {fmt(selectedSlot)} – {fmt(selectedSlot + 1)}
            </p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;