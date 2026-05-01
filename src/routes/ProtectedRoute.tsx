import * as React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export type AppRole = 'admin' | 'user'

export type AuthSnapshot = {
  userName: string | null
  role: AppRole | null
  isAuthenticated: boolean
}

function getAuth(): AuthSnapshot {
  const userName = localStorage.getItem('userName')
  const roleRaw = localStorage.getItem('role')
  const role = roleRaw === 'admin' || roleRaw === 'user' ? roleRaw : null

  return {
    userName,
    role,
    isAuthenticated: Boolean(userName && role),
  }
}

export default function ProtectedRoute(): React.ReactElement {
  const location = useLocation()
  const auth = React.useMemo(() => getAuth(), [])

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

