import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import ActivityFeedPage from './pages/ActivityFeedPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboard from './pages/UserDashboard'
import RoomManagementPage from './pages/RoomManagementPage'
import HelpCenterPage from './pages/HelpCenter'
import UserActivityPage from './pages/UserActivityPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/room-management" element={<RoomManagementPage />} />
      <Route path="/activity-feed" element={<ActivityFeedPage />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/help-center" element={<HelpCenterPage />} />
      
      {/* Route Baru untuk Notifikasi User */}
      <Route path="/user-activity" element={<UserActivityPage />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}