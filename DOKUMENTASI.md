# TEKSPACE — Sistem Reservasi Ruangan Kampus
## Dokumentasi Tugas Akhir Praktikum Sistem Basis Data

---

## 1. Identitas Proyek

| Item | Keterangan |
|---|---|
| **Nama Sistem** | TEKSPACE – Smart Room Reservation |
| **Kelompok** | KEL18 |
| **Deskripsi** | Sistem web untuk reservasi ruangan kampus secara digital, mencakup manajemen ruangan, pengajuan peminjaman, persetujuan admin, dan pengembalian ruangan |
| **Repository** | https://github.com/whosArlend/TA_SBD_KEL18 |
| **Demo** | https://ta-sbd-kel18.vercel.app |

---

## 2. Aktor Sistem

Sistem TEKSPACE memiliki **2 aktor utama**:

### Aktor 1 — Admin (System Admin)
Pengelola sistem yang memiliki akses penuh terhadap seluruh data.

| Hak Akses | Deskripsi |
|---|---|
| Manajemen Ruangan | Tambah, edit, arsipkan, dan hapus permanen ruangan |
| Persetujuan Booking | Approve atau reject permintaan reservasi dari user |
| Konfirmasi Pengembalian | Menerima dan mengkonfirmasi request pengembalian ruangan |
| Lihat Riwayat | Melihat seluruh riwayat reservasi semua pengguna |
| Kelola Fasilitas | Tambah/hapus amenities dan rules ruangan |

### Aktor 2 — User (Mahasiswa/Dosen)
Pengguna yang dapat melakukan peminjaman ruangan.

| Hak Akses | Deskripsi |
|---|---|
| Katalog Ruangan | Melihat dan mencari ruangan yang tersedia |
| Detail Ruangan | Melihat informasi lengkap ruangan (fasilitas, peraturan, foto) |
| Buat Reservasi | Mengajukan peminjaman ruangan |
| My Bookings | Memantau status booking dengan filter per status |
| Batalkan Booking | Membatalkan booking yang masih Pending |
| Kembalikan Ruangan | Mengajukan pengembalian ruangan yang sedang Approved |

---

## 3. Entity Relationship Diagram (ERD)

### Entitas dan Atribut

```
┌─────────────────────────────┐
│           USERS             │
├─────────────────────────────┤
│ PK  user_id      : int4     │
│     full_name    : varchar  │
│ UQ  email        : varchar  │
│     password_hash: varchar  │
│     role         : user_role│
│     nim          : varchar  │
│     created_at   : timestamp│
│     deleted_at   : timestamp│
└─────────────────────────────┘

┌─────────────────────────────┐
│           ROOMS             │
├─────────────────────────────┤
│ PK  room_id      : int4     │
│     room_name    : varchar  │
│     room_type    : room_type│
│     capacity     : int4     │
│     location     : varchar  │
│     image_url    : text     │
│     status  : room_status   │
│     archived_at  : timestamp│
│     archive_reason: varchar │
│     created_at   : timestamp│
│     deleted_at   : timestamp│
└─────────────────────────────┘

┌──────────────────────────────────┐
│          RESERVATIONS            │
├──────────────────────────────────┤
│ PK  reservation_id  : int4       │
│ UQ  booking_code    : varchar    │
│ FK  user_id         : int4 → USERS│
│ FK  room_id         : int4 → ROOMS│
│     meeting_title   : varchar    │
│     person_in_charge: varchar    │
│     start_time      : timestamp  │
│     end_time        : timestamp  │
│     status : reservation_status  │
│     notes_from_admin: text       │
│     created_at      : timestamp  │
│     deleted_at      : timestamp  │
└──────────────────────────────────┘

┌─────────────────────────────┐
│          AMENITIES          │
├─────────────────────────────┤
│ PK  amenity_id   : int4     │
│     amenity_name : varchar  │
└─────────────────────────────┘

┌─────────────────────────────┐
│           RULES             │
├─────────────────────────────┤
│ PK  rule_id      : int4     │
│     rule_name    : varchar  │
└─────────────────────────────┘

┌────────────────────────────────────┐
│        ROOM_AMENITIES_MAP          │
├────────────────────────────────────┤
│ FK  room_id    : int4 → ROOMS      │
│ FK  amenity_id : int4 → AMENITIES  │
│     quantity   : int4              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│         ROOM_RULES_MAP             │
├────────────────────────────────────┤
│ FK  room_id    : int4 → ROOMS      │
│ FK  rule_id    : int4 → RULES      │
└────────────────────────────────────┘
```

### Relasi Antar Entitas

```
USERS ──────────────────────── RESERVATIONS
   1                                  N
   (1 user dapat membuat banyak reservasi)

ROOMS ──────────────────────── RESERVATIONS
   1                                  N
   (1 ruangan dapat memiliki banyak reservasi)

ROOMS ──── ROOM_AMENITIES_MAP ──── AMENITIES
   1                N : N              1
   (Ruangan dapat memiliki banyak fasilitas, qty berbeda)

ROOMS ────── ROOM_RULES_MAP ─────── RULES
   1                N : N              1
   (Ruangan dapat memiliki banyak peraturan)
```

### Constraint yang Digunakan

| Constraint | Tabel | Kolom | Keterangan |
|---|---|---|---|
| PRIMARY KEY | Semua tabel | id kolom | Identitas unik tiap baris |
| FOREIGN KEY | reservations | user_id → users | Integritas referensial |
| FOREIGN KEY | reservations | room_id → rooms | Integritas referensial |
| FOREIGN KEY | room_amenities_map | room_id, amenity_id | Integritas relasi M:N |
| FOREIGN KEY | room_rules_map | room_id, rule_id | Integritas relasi M:N |
| UNIQUE | users | email | Email tidak boleh duplikat |
| UNIQUE | reservations | booking_code | Kode booking unik per transaksi |
| ENUM | users | role | Nilai: `User`, `System Admin` |
| ENUM | rooms | status | Nilai: `Available`, `Occupied`, `Maintenance` |
| ENUM | reservations | status | Nilai: `Pending`, `Approved`, `Rejected`, `Canceled`, `Return Requested`, `Completed` |
| SOFT DELETE | users, rooms, reservations | deleted_at | Hapus logis dengan timestamp |

---

## 4. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│              React + TypeScript + Vite                   │
│              Deployed: Vercel (Frontend)                 │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST API
                         │ Authorization: Bearer JWT
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND SERVER                         │
│              Express.js + Node.js                        │
│              Deployed: Vercel (Serverless)               │
│                                                          │
│  Routes:                                                 │
│  POST   /api/auth/login          → Login (email/NIM)     │
│  POST   /api/auth/register       → Daftar akun baru      │
│  POST   /api/auth/check-nim      → Cek NIM tersedia      │
│  GET    /api/rooms               → Daftar ruangan        │
│  POST   /api/rooms               → Tambah ruangan        │
│  PUT    /api/rooms/:id           → Edit ruangan          │
│  DELETE /api/rooms/:id           → Hapus permanen        │
│  PATCH  /api/rooms/:id/archive   → Arsipkan ruangan      │
│  PATCH  /api/rooms/:id/unarchive → Pulihkan ruangan      │
│  GET    /api/reservations        → Daftar reservasi      │
│  POST   /api/reservations        → Buat reservasi        │
│  PATCH  /api/reservations/:id/status → Update status     │
│  PATCH  /api/reservations/:id/cancel → Batalkan          │
│  POST   /api/upload/room-image   → Upload gambar         │
│  GET    /api/amenities           → Daftar fasilitas      │
│  POST   /api/amenities           → Tambah fasilitas      │
│  DELETE /api/amenities/:id       → Hapus fasilitas       │
│  GET    /api/rules               → Daftar peraturan      │
└────────────────────────┬────────────────────────────────┘
                         │ Supabase JS Client
┌────────────────────────▼────────────────────────────────┐
│                  DATABASE                                │
│              Supabase (PostgreSQL)                       │
│              7 Tabel dengan Foreign Key & Enum           │
│              Storage Bucket: room-images                 │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Implementasi CRUD

### CREATE

| Fitur | Endpoint | Deskripsi |
|---|---|---|
| Daftar akun | `POST /api/auth/register` | Membuat user baru dengan bcrypt password hash |
| Tambah ruangan | `POST /api/rooms` | Admin menambah ruangan baru beserta fasilitas dan peraturan |
| Buat reservasi | `POST /api/reservations` | User mengajukan peminjaman ruangan |
| Tambah fasilitas | `POST /api/amenities` | Admin menambah fasilitas baru ke database |
| Tambah peraturan | `POST /api/rules` | Admin menambah peraturan baru |

### READ

| Fitur | Endpoint | Deskripsi |
|---|---|---|
| Daftar ruangan | `GET /api/rooms` | Mengambil semua ruangan yang belum dihapus |
| Detail ruangan | `GET /api/rooms/:id` | Detail ruangan **beserta** fasilitas dan peraturan (JOIN 3 tabel) |
| Semua reservasi | `GET /api/reservations` | Dengan filter status, user_id, room_id |
| Katalog ruangan | Frontend | Filter ruangan yang `archived_at = null` |
| My Bookings | Frontend | Filter reservasi berdasarkan `user_id` dan status |

### UPDATE

| Fitur | Endpoint | Deskripsi |
|---|---|---|
| Edit ruangan | `PUT /api/rooms/:id` | Edit nama, tipe, kapasitas, lokasi, gambar, fasilitas, peraturan |
| Approve/Reject booking | `PATCH /api/reservations/:id/status` | Admin mengubah status reservasi + update status ruangan otomatis |
| Arsipkan ruangan | `PATCH /api/rooms/:id/archive` | Set `archived_at` dan ubah status ke `Maintenance` |
| Pulihkan ruangan | `PATCH /api/rooms/:id/unarchive` | Reset `archived_at = null` dan status ke `Available` |
| Kembalikan ruangan | `PATCH /api/reservations/:id/status` | User ajukan `Return Requested`, admin approve jadi `Completed` |

### DELETE

| Jenis | Fitur | Deskripsi |
|---|---|---|
| **Soft Delete** | Batalkan reservasi | Set `status = 'Canceled'`, room kembali `Available` |
| **Soft Delete** | Hapus user | Set `deleted_at = NOW()`, data tetap ada di database |
| **Hard Delete** | Hapus permanen ruangan | `DELETE FROM rooms` + hapus data di `room_amenities_map` dan `room_rules_map` |

---

## 6. Query Join (Lebih dari 2 Tabel)

### JOIN Reservasi + User + Ruangan

Digunakan di halaman **Booking Approvals**, **Booking History**, dan **My Bookings**:

```sql
SELECT
    r.*,
    u.user_id, u.full_name, u.email, u.nim,
    rm.room_id, rm.room_name, rm.room_type, rm.location, rm.capacity
FROM reservations r
LEFT JOIN users u ON r.user_id = u.user_id
LEFT JOIN rooms rm ON r.room_id = rm.room_id
WHERE r.deleted_at IS NULL
ORDER BY r.created_at DESC;
```

**Tabel yang di-join**: `reservations` + `users` + `rooms` = **3 tabel**

### JOIN Detail Ruangan + Fasilitas + Peraturan

Digunakan di halaman **Room Detail Modal** dan **Edit Room**:

```sql
SELECT
    r.*,
    ram.quantity,
    a.amenity_id, a.amenity_name,
    rrul.rule_id, rul.rule_name
FROM rooms r
LEFT JOIN room_amenities_map ram ON r.room_id = ram.room_id
LEFT JOIN amenities a ON ram.amenity_id = a.amenity_id
LEFT JOIN room_rules_map rrul ON r.room_id = rrul.room_id
LEFT JOIN rules rul ON rrul.rule_id = rul.rule_id
WHERE r.room_id = $1
AND r.deleted_at IS NULL;
```

**Tabel yang di-join**: `rooms` + `room_amenities_map` + `amenities` + `room_rules_map` + `rules` = **5 tabel**

---

## 7. Fitur Pencarian Data

| Halaman | Pencarian Berdasarkan |
|---|---|
| Room Catalog | Nama ruangan |
| Room Management | Nama ruangan |
| Booking Approvals | Nama user atau nama ruangan |
| Booking History | Nama user, nama ruangan, atau booking code |
| My Bookings | Filter berdasarkan status (tab) |

---

## 8. Sistem Autentikasi

### Alur Login
```
User input (email atau NIM) + password
    ↓
Backend: cek apakah identifier mengandung '@'
    ├── Ya → findUserByEmail()
    └── Tidak → findUserByNim()
    ↓
Verifikasi password dengan bcrypt.compare()
    ↓
Generate JWT token (expires 7 hari)
    ↓
Token disimpan di localStorage browser
    ↓
Setiap API request: Authorization: Bearer <token>
    ↓
Backend middleware verifikasi token sebelum memproses request
```

### Role-Based Access
- **Admin** (`System Admin`): akses ke Room Management, Booking Approvals, Booking History, Activity Feed
- **User** (`User`): akses ke Room Catalog, My Bookings, User Dashboard

---

## 9. Navbar

Setiap halaman memiliki **navbar sidebar** yang konsisten:

**Admin:**
- Dashboard
- Room Management
- Bookings (Approval)
- Archived Rooms
- Booking History

**User:**
- Dashboard
- Room Catalog
- My Bookings

**Header** (semua halaman): nama pengguna, avatar, notifikasi, help center, logout.

---

## 10. Alur Bisnis Utama

### Alur Peminjaman Ruangan

```
[User] Lihat Room Catalog
    ↓
[User] Klik "Book Now" → isi form (judul, PIC, waktu)
    ↓
[Backend] Cek konflik waktu → simpan dengan status "Pending"
    ↓
[Admin] Lihat di Booking Approvals → Approve / Reject
    ↓
    ├── Approve → status "Approved", ruangan jadi "Occupied"
    └── Reject → status "Rejected", ruangan kembali "Available"
    ↓
[User] Lihat status di My Bookings
    ↓
[User] Selesai menggunakan → klik "Kembalikan"
    ↓
[Backend] Status jadi "Return Requested"
    ↓
[Admin] Konfirmasi di Booking History / Booking Approvals
    ↓
[Backend] Status jadi "Completed", ruangan kembali "Available"
```

### Alur Manajemen Ruangan

```
[Admin] Tambah ruangan (nama, tipe, kapasitas, lokasi, gambar)
    ↓
[Admin] Edit ruangan → set fasilitas dan peraturan
    ↓
Ruangan tersedia di Room Catalog untuk user
    ↓
[Admin] Jika rusak/renovasi → Archive (status "Maintenance")
    ↓
Ruangan tidak muncul di katalog, tercatat di Archived Rooms
    ↓
[Admin] Jika sudah selesai → Pulihkan (status "Available")
    ATAU
[Admin] Jika permanen → Hapus Permanen (dihapus dari database)
```

---

## 11. Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js 5 |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Supabase Storage (gambar ruangan) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Deployment** | Vercel (frontend + backend serverless) |
| **Version Control** | Git + GitHub |

---

## 12. Struktur Direktori

```
TA_SBD_KEL18/
├── src/                          ← Frontend (React)
│   ├── components/               ← Komponen reusable
│   │   ├── AddRoomModal.tsx       ← Modal tambah ruangan
│   │   ├── EditRoomModal.tsx      ← Modal edit ruangan + fasilitas
│   │   └── RoomDetailModal.tsx   ← Modal detail ruangan (join 5 tabel)
│   ├── contexts/
│   │   └── AuthContext.tsx        ← State autentikasi global
│   ├── lib/
│   │   └── api.ts                 ← Semua fungsi pemanggilan API
│   ├── layout/
│   │   └── DashboardLayout.tsx    ← Navbar sidebar (admin & user)
│   └── pages/
│       ├── LoginPage.tsx          ← Login (email atau NIM)
│       ├── RegisterPage.tsx       ← Registrasi + cek NIM duplikat
│       ├── AdminDashboard.tsx     ← Dashboard admin
│       ├── RoomManagementPage.tsx ← CRUD ruangan + search
│       ├── ArchivedRoomsPage.tsx  ← Arsip + hard delete
│       ├── BookingApprovalsPage.tsx ← Approve/reject + return
│       ├── BookingHistoryPage.tsx ← Riwayat + konfirmasi pengembalian
│       ├── RoomCatalogPage.tsx    ← Katalog + booking form
│       └── MyBookingsPage.tsx     ← Booking user + filter status
│
└── backend/                      ← Backend (Express.js)
    └── src/
        ├── auth/                  ← Login, register, JWT
        ├── rooms/                 ← CRUD ruangan
        ├── reservation/           ← CRUD reservasi + join query
        ├── amenities/             ← CRUD fasilitas
        ├── rules/                 ← CRUD peraturan
        ├── upload/                ← Upload gambar ke Supabase Storage
        ├── middleware/
        │   └── auth.middleware.js ← Verifikasi JWT token
        └── lib/
            ├── supabase.js        ← Supabase client (anon key)
            └── supabase-admin.js  ← Supabase client (service key, untuk storage)
```
