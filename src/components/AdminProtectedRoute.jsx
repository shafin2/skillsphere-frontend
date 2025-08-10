import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import http from '../api/http'

export default function AdminProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const { data: user } = await http.get('/auth/me')
      if (user.roles && user.roles.includes('admin')) {
        setIsAdmin(true)
      }
    } catch (err) {
      console.error('Admin access check failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
