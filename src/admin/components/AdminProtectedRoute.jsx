import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import http from '../../lib/http.js'

export default function AdminProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      console.log('[AdminProtected] Checking token:', token ? 'exists' : 'none')
      
      if (!token) {
        console.log('[AdminProtected] No token found, redirecting to login')
        setIsLoading(false)
        return
      }
      
      setHasToken(true)
      console.log('[AdminProtected] Making /auth/me request...')
      
      const { data } = await http.get('/auth/me')
      console.log('[AdminProtected] User data response:', data)
      
      // Handle different response structures
      const user = data.user || data // Some APIs return user directly, others wrap it
      console.log('[AdminProtected] Extracted user:', user)
      
      if (user && user.roles && user.roles.includes('admin')) {
        console.log('[AdminProtected] User is admin, allowing access')
        setIsAdmin(true)
      } else {
        console.log('[AdminProtected] User is not admin:', user.roles)
        setError('User does not have admin privileges')
      }
    } catch (err) {
      console.error('[AdminProtected] Auth check failed:', err)
      // If token is invalid, clear it
      localStorage.removeItem('accessToken')
      setHasToken(false)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-2">Checking admin access...</div>
          <div className="text-gray-400">Please wait</div>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('[AdminProtected] Error occurred, redirecting to login:', error)
  }

  if (!hasToken || !isAdmin) {
    console.log('[AdminProtected] Redirecting to admin login')
    return <Navigate to="/admin/login" replace />
  }

  console.log('[AdminProtected] Access granted, rendering children')
  return children
}
