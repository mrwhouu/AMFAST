import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ConfigMissing } from './components/ConfigMissing'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { FastighetPage } from './pages/FastighetPage'
import { AdminPage } from './pages/AdminPage'
import { FakturaPrintPage } from './pages/FakturaPrintPage'
import { FakturorBulkPrintPage } from './pages/FakturorBulkPrintPage'

export default function App() {
  if (!isSupabaseConfigured) return <ConfigMissing />

  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fastighet/:id"
          element={
            <ProtectedRoute>
              <FastighetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faktura/:id"
          element={
            <ProtectedRoute>
              <FakturaPrintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fakturor/skriv-ut"
          element={
            <ProtectedRoute>
              <FakturorBulkPrintPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
