// Centralized API service — semua panggilan backend lewat sini
const API_BASE = 'https://ta-backend-one.vercel.app/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Room = {
  room_id: string;
  room_name: string;
  room_type: string | null;
  location: string | null;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  archived_at: string | null;
  archive_reason: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type ReservationUser = {
  user_id: string;
  full_name: string;
  email: string;
  department: string;
};

export type ReservationRoom = {
  room_id: string;
  room_name: string;
  room_type: string;
  location: string;
  capacity: number;
};

export type Reservation = {
  reservation_id: string;
  booking_code: string;
  user_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  meeting_title: string | null;
  person_in_charge: string | null;
  notes_from_admin: string | null;
  created_at: string;
  users: ReservationUser | null;
  rooms: ReservationRoom | null;
};

export type ReservationFilters = {
  status?: string;
  user_id?: number | string;
  room_id?: number | string;
};

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `API error ${res.status}`);
  }
  return json.data as T;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const getRooms = () => apiFetch<Room[]>('/rooms');

export const getRoomById = (id: string) => apiFetch<Room>(`/rooms/${id}`);

export const createRoom = (data: {
  room_name: string;
  room_type?: string;
  location?: string;
  capacity?: number;
  status?: string;
}) => apiFetch<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) });

export const updateRoom = (id: string, data: Partial<Room>) =>
  apiFetch<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteRoom = (id: string) =>
  apiFetch<void>(`/rooms/${id}`, { method: 'DELETE' });

export const archiveRoom = (id: string, reason: string) =>
  apiFetch<Room>(`/rooms/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });

export const unarchiveRoom = (id: string) =>
  apiFetch<Room>(`/rooms/${id}/unarchive`, { method: 'PATCH' });

// ─── Reservations ─────────────────────────────────────────────────────────────

export const getReservations = (filters?: ReservationFilters) => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', String(filters.status));
  if (filters?.user_id != null) params.set('user_id', String(filters.user_id));
  if (filters?.room_id != null) params.set('room_id', String(filters.room_id));
  const qs = params.toString() ? `?${params}` : '';
  return apiFetch<Reservation[]>(`/reservations${qs}`);
};

export const getReservationById = (id: string) =>
  apiFetch<Reservation>(`/reservations/${id}`);

export const createReservation = (data: {
  user_id: number;
  room_id: number | string;
  start_time: string;
  end_time: string;
  meeting_title: string;
  person_in_charge: string;
}) =>
  apiFetch<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateReservationStatus = (
  id: string,
  status: string,
  notes_from_admin?: string,
) =>
  apiFetch<Reservation>(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes_from_admin }),
  });

export const cancelReservation = (id: string) =>
  apiFetch<Reservation>(`/reservations/${id}/cancel`, { method: 'PATCH' });

export const deleteReservation = (id: string) =>
  apiFetch<void>(`/reservations/${id}`, { method: 'DELETE' });
