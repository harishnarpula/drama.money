/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, clearStoredAdminAuth, getStoredAdminAuth } from '../../services/api'
import type { AuthResponse } from '../../services/api'

type AdminSession = Pick<AuthResponse, 'user'>

type AdminAuthValue = {
  session: AdminSession | null
  login: (identifier: string, password: string) => Promise<AuthResponse>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(() => {
    const stored = getStoredAdminAuth()
    return stored ? { user: stored.user } : null
  })

  useEffect(() => {
    const onExpired = () => setSession(null)
    window.addEventListener('teambharat:admin-session-expired', onExpired)
    return () => window.removeEventListener('teambharat:admin-session-expired', onExpired)
  }, [])

  const value = useMemo<AdminAuthValue>(() => ({
    session,
    login: async (identifier, password) => {
      const auth = await api.adminAuth.login({ identifier: identifier.trim(), password })
      setSession({ user: auth.user })
      return auth
    },
    logout: () => {
      clearStoredAdminAuth()
      setSession(null)
    },
  }), [session])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext)
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return value
}
