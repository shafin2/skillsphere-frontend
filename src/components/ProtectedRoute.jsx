import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, requireAuth = true, requireRole = null }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth/login" replace />
  }

  // If auth is NOT required but user IS logged in (for auth pages)
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Global checks for authenticated users
  if (requireAuth && user) {
    // If email not verified and not admin, redirect to verify notice
    if (!user.isEmailVerified && !user.roles?.includes('admin')) {
      return <Navigate to="/verify-email-required" replace />
    }
    // If user requested mentor but not approved yet, redirect to pending page
    if (user.roles?.includes('mentor') && !user.isApproved) {
      return <Navigate to="/pending-approval" replace />
    }
  }

  // If specific role is required
  if (requireRole && user) {
    if (!user.roles?.includes(requireRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
} 