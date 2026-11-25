import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './auth/AdminAuth'
import { Guard } from './components/Guard'
import { AdminLayout } from './components/AdminLayout'
import AdminLoginPage from './pages/AdminLoginPage'
import DashboardPage from './pages/DashboardPage'
import { ReelReviewPage } from './pages/ReelReviewPage'
import { ReviewQueuePage } from './pages/ReviewPages'
import {
  AuditPage,
  CategoriesPage,
  FraudPage,
  KycPage,
  PayoutsPage,
  ReportsPage,
  SettingsPage,
  UsersPage,
} from './pages/SectionPages'
function AdminRootRedirect() {
  const { session } = useAdminAuth()
  return <Navigate to={session ? '/admin/dashboard' : '/admin/login'} replace />
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* If user visits /admin directly: send to dashboard if logged in, or login if not */}
        <Route index element={<AdminRootRedirect />} />

        {/* /admin/login */}
        <Route path="login" element={<AdminLoginPage />} />

        {/* Protected admin dashboard routes */}
        <Route
          element={
            <Guard>
              <AdminLayout />
            </Guard>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="review" element={<ReviewQueuePage />} />
          <Route path="review/:id" element={<Navigate to="/admin/review" replace />} />
          <Route path="reel-review" element={<ReelReviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="kyc" element={<KycPage />} />
          <Route path="payouts" element={<PayoutsPage />} />
          <Route path="fraud" element={<FraudPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit" element={<AuditPage />} />
        </Route>

        {/* Catch-all redirect back to /admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
