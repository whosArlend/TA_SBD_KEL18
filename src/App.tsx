import * as React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import ActivityFeedPage from './pages/ActivityFeedPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import RoomManagementPage from './pages/RoomManagementPage'
import HelpCenterPage from './pages/HelpCenter'
import AdminRoute from './routes/AdminRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import UserActivityPage from './pages/UserActivityPage'

function UserOnlyOutlet(): React.ReactElement {
  const role = localStorage.getItem('role')
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
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
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/room-management" element={<RoomManagementPage />} />
          <Route path="/activity-feed" element={<ActivityFeedPage />} />
        </Route>

        {/* shared protected (opsional) */}
        <Route path="/help-center" element={<HelpCenterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}