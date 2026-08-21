import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'
import { FullScreenState } from './FullScreenState'

export function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode
  requireRole?: Role
}) {
  const { session, profile, loading } = useAuth()

  if (loading) return <FullScreenState label="Laddar…" />
  if (!session) return <Navigate to="/login" replace />
  if (requireRole && profile?.role !== requireRole) return <Navigate to="/" replace />

  return <>{children}</>
}
