import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalysisPage from '@/pages/analysis/AnalysisPage'
import PortfolioPage from '@/pages/dashboard/PortfolioPage'
import PricingPage from '@/pages/PricingPage'
import AdminPage from '@/pages/admin/AdminPage'
import SignalsPage from '@/pages/signals/SignalsPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import { useAuthStore } from '@/store/authStore'

// Requires login + isApproved
function ApprovedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.isApproved) return <Navigate to="/" replace />
  return <>{children}</>
}

// Requires ADMIN role
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Auth */}
      <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Approved users only */}
      <Route path="/dashboard"  element={<ApprovedRoute><DashboardPage /></ApprovedRoute>} />
      <Route path="/analysis"   element={<ApprovedRoute><AnalysisPage /></ApprovedRoute>} />
      <Route path="/portfolio"  element={<ApprovedRoute><PortfolioPage /></ApprovedRoute>} />
      <Route path="/signals"    element={<ApprovedRoute><SignalsPage /></ApprovedRoute>} />
      <Route path="/settings"   element={<ApprovedRoute><SettingsPage /></ApprovedRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
