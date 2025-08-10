import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../../lib/http.js'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function AdminLogin() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('[AdminLogin] Attempting login with:', form.email)
      const { data } = await http.post('/auth/login', form)
      console.log('[AdminLogin] Login response:', data)
      
      localStorage.setItem('accessToken', data.accessToken)
      console.log('[AdminLogin] Token stored, checking admin status...')
      
      // Check if user is admin - user data is in the login response
      const user = data.user
      console.log('[AdminLogin] User data:', user)
      
      if (!user || !user.roles || !user.roles.includes('admin')) {
        console.log('[AdminLogin] User is not admin, denying access')
        setError('Access denied. Admin privileges required.')
        localStorage.removeItem('accessToken')
        return
      }
      
      console.log('[AdminLogin] Admin access confirmed, redirecting...')
      nav('/admin')
    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400 text-lg">Access the administration portal</p>
          </div>
          
          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              required
              placeholder="admin@skillsphere.com"
            />
            
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="Enter your password"
            />
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </Button>
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <a 
              href="/"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              ← Back to SkillSphere
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
