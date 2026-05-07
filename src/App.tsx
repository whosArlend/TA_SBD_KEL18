import * as React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import ActivityFeedPage from './pages/ActivityFeedPage'
import BookingApprovalsPage from './pages/BookingApprovalsPage'
import BookingsPage from './pages/BookingsPage'
import ArchivedRoomsPage from './pages/ArchivedRoomsPage'
import BookingHistoryPage from './pages/BookingHistoryPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import RoomManagementPage from './pages/RoomManagementPage'
import RoomCatalogPage from './pages/RoomCatalogPage'
import RoomDetailPage from './pages/RoomDetailPage'
import BookRoomPage from './pages/BookRoomPage'
import MyBookingsPage from './pages/MyBookingsPage'
import HelpCenterPage from './pages/HelpCenter'
import AdminRoute from './routes/AdminRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import UserActivityPage from './pages/UserActivityPage'
import RoomDetail from './pages/RoomDetail';
import ReservationForm from './pages/ReservationForm';
import QuickBookingPage from './pages/QuickBookingPage';
import RoomAvailabilityPage from './pages/RoomAvailabilityPage';

function UserOnlyOutlet(): React.ReactElement {
  const { role } = useAuth()
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        

        {/* Routes: wajib login */}
        <Route element={<ProtectedRoute />}>
          {/* USER only */}
          <Route element={<UserOnlyOutlet />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/user-activity" element={<UserActivityPage />} />
            <Route path="/room-catalog" element={<RoomCatalogPage />} />
            <Route path="/room-catalog/:id" element={<RoomDetailPage />} />
            <Route path="/book-room/:roomId" element={<BookRoomPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/rooms-catalog/:roomId" element={<RoomDetail />} />
            <Route path="/booking/new" element={<ReservationForm />} />
            <Route path="/quick-booking" element={<QuickBookingPage />} />
            <Route path="/rooms/:roomId" element={<RoomAvailabilityPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/booking-approvals" element={<BookingApprovalsPage />} />
            <Route path="/room-management" element={<RoomManagementPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/archived-rooms" element={<ArchivedRoomsPage />} />
            <Route path="/booking-history" element={<BookingHistoryPage />} />
            <Route path="/activity-feed" element={<ActivityFeedPage />} />
          </Route>

          {/* shared protected (opsional) */}
          <Route path="/help-center" element={<HelpCenterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}