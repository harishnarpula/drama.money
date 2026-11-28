import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { AuthProvider } from './auth/AuthContext'
import { useAuth } from './auth/auth-context'
import AppShell from './components/AppShell'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EditProfilePage from './pages/EditProfilePage'
import ReelsFeed from './pages/ReelsFeed'
import { CreatorDashboardPage, EarningsPage, HomePage, NotificationsPage, ProfilePage, SearchPage } from './pages/AppPages'
import UploadPage from './pages/UploadPage'
import { SessionExpiredModal } from './components/SessionExpiredModal'
import dramaIcon from './assets/dramaIcon.png'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#F8F6F1]" aria-label="Loading Drama.Money 3D experience"><img src={dramaIcon} alt="" className="h-[72px] w-auto motion-safe:animate-pulse" /></div>}><LandingPage /></Suspense>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy" element={<Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#F8F6F1]" aria-label="Loading privacy policy"><img src={dramaIcon} alt="" className="h-[72px] w-auto motion-safe:animate-pulse" /></div>}><PrivacyPolicyPage /></Suspense>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/*" element={<Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#F8F6F1]"><img src={dramaIcon} alt="" className="h-[72px] w-auto motion-safe:animate-pulse" /></div>}><AdminApp /></Suspense>} />
      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<HomePage />} />
        <Route path="reels" element={<ReelsFeed />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="creator" element={<CreatorDashboardPage />} />
        <Route path="earnings" element={<EarningsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <SessionExpiredModal />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
