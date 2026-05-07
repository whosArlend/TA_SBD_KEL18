const API_BASE = 'https://ta-backend-one.vercel.app/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole = 'admin' | 'user';

export type AuthUser = {
  user_id: number;
  email: string;
  role: AppRole;
  full_name: string;
  department: string | null;
};

export type RoomAmenity = {
  quantity: number;
  amenities: { amenity_id: number; amenity_name: string };
};

export type RoomRule = {
  rules: { rule_id: number; rule_name: string };
};

export type Room = {
  room_id: number;
  room_name: string;
  room_type: string | null;
  location: string | null;
  capacity: number;
  image_url: string | null;
  status: 'Available' | 'Occupied' | 'Maintenance';
  archived_at: string | null;
  archive_reason: string | null;
  deleted_at: string | null;
  created_at: string;
  room_amenities_map?: RoomAmenity[];
  room_rules_map?: RoomRule[];
};

export type ReservationUser = {
  user_id: number;
  full_name: string;
  email: string;
  department: string | null;
};

export type ReservationRoom = {
  room_id: number;
  room_name: string;
  room_type: string | null;
  location: string | null;
  capacity: number;
};

export type Reservation = {
  reservation_id: number;
  booking_code: string;
  user_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Canceled' | 'Return Requested' | 'Completed';
  meeting_title: string | null;
  person_in_charge: string | null;
  notes_from_admin: string | null;
  created_at: string;
  users: ReservationUser | null;
  rooms: ReservationRoom | null;
};

export type ReservationFilters = {
  status?: string;
  user_id?: number;
  room_id?: number;
};

// ─── Internal fetch helper ────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `API error ${res.status}`);
  }
  return json.data as T;
}

// ─── Amenities & Rules ────────────────────────────────────────────────────────

export type Amenity = { amenity_id: number; amenity_name: string };
export type Rule = { rule_id: number; rule_name: string };

export const getAmenities = () => apiFetch<Amenity[]>('/amenities');
export const createAmenity = (amenity_name: string) =>
  apiFetch<Amenity>('/amenities', { method: 'POST', body: JSON.stringify({ amenity_name }) });
export const deleteAmenity = (id: number) =>
  apiFetch<void>(`/amenities/${id}`, { method: 'DELETE' });

export const getRules = () => apiFetch<Rule[]>('/rules');
export const createRule = (rule_name: string) =>
  apiFetch<Rule>('/rules', { method: 'POST', body: JSON.stringify({ rule_name }) });
export const deleteRule = (id: number) =>
  apiFetch<void>(`/rules/${id}`, { method: 'DELETE' });

export const updateRoomAmenities = (
  roomId: number | string,
  amenity_ids: { amenity_id: number; quantity: number }[],
) =>
  apiFetch<void>(`/rooms/${roomId}/amenities`, {
    method: 'PUT',
    body: JSON.stringify({ amenity_ids }),
  });

export const updateRoomRules = (roomId: number | string, rule_ids: number[]) =>
  apiFetch<void>(`/rooms/${roomId}/rules`, {
    method: 'PUT',
    body: JSON.stringify({ rule_ids }),
  });

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadRoomImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/upload/room-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message ?? 'Upload gagal');
  return json.data.url as string;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginApi = (identifier: string, password: string) =>
  apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

export const registerApi = (data: {
  full_name: string;
  email: string;
  password: string;
  department?: string;
}) =>
  apiFetch<{ token: string; user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const checkNimApi = (nim: string) =>
  apiFetch<{ exists: boolean }>('/auth/check-nim', {
    method: 'POST',
    body: JSON.stringify({ nim }),
  });

export const checkEmailApi = (email: string) =>
  apiFetch<{ exists: boolean }>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const getRooms = () => apiFetch<Room[]>('/rooms');

export const getRoomById = (id: number | string) => apiFetch<Room>(`/rooms/${id}`);

export const createRoom = (data: {
  room_name: string;
  room_type?: string;
  location?: string;
  capacity?: number;
  status?: string;
  image_url?: string | null;
}) => apiFetch<Room>('/rooms', { method: 'POST', body: JSON.stringify(data) });

export const updateRoom = (id: number | string, data: Partial<Room>) =>
  apiFetch<Room>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteRoom = (id: number | string) =>
  apiFetch<void>(`/rooms/${id}`, { method: 'DELETE' });

export const archiveRoom = (id: number | string, reason: string) =>
  apiFetch<Room>(`/rooms/${id}/archive`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });

export const unarchiveRoom = (id: number | string) =>
  apiFetch<Room>(`/rooms/${id}/unarchive`, { method: 'PATCH' });

// ─── Reservations ─────────────────────────────────────────────────────────────

export const getReservations = (filters?: ReservationFilters) => {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.user_id != null) params.set('user_id', String(filters.user_id));
  if (filters?.room_id != null) params.set('room_id', String(filters.room_id));
  const qs = params.toString() ? `?${params}` : '';
  return apiFetch<Reservation[]>(`/reservations${qs}`);
};

export const getReservationById = (id: number | string) =>
  apiFetch<Reservation>(`/reservations/${id}`);

export const createReservation = (data: {
  user_id: number;
  room_id: number;
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
  id: number | string,
  status: string,
  notes_from_admin?: string,
) =>
  apiFetch<Reservation>(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes_from_admin }),
  });

export const cancelReservation = (id: number | string) =>
  apiFetch<Reservation>(`/reservations/${id}/cancel`, { method: 'PATCH' });

export const requestReturn = (id: number | string) =>
  apiFetch<Reservation>(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Return Requested' }),
  });

export const approveReturn = (id: number | string) =>
  apiFetch<Reservation>(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Completed' }),
  });

export const deleteReservation = (id: number | string) =>
  apiFetch<void>(`/reservations/${id}`, { method: 'DELETE' });
