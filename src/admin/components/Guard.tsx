import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAdminAuth } from '../auth/AdminAuth'

export function Guard({ children }: { children: ReactNode }) {
  const { session } = useAdminAuth()
  const location = useLocation()
  return session ? children : <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
}
