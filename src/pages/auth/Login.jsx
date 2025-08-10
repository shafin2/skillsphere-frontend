import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import AuthLayout from '../../components/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { isDark } = useTheme()

  // Get role from navigation state or redirect to role selection
  const selectedRole = location.state?.role
  const returnTo = location.state?.returnTo || '/dashboard'

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no role selected, redirect to role selection
    if (!selectedRole) {
      navigate('/auth/role-selection', { state: { mode: 'login', returnTo } })
    }
  }, [selectedRole, navigate, returnTo])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Please fill in all fields' })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const user = await login(formData.email, formData.password)
      
      // Check if user has the selected role
      if (!user.roles?.includes(selectedRole)) {
        if (selectedRole === 'mentor') {
          setErrors({ general: 'This account is not registered as a mentor. Please sign up as a mentor or continue as a learner.' })
          return
        }
      }
      
      navigate(returnTo)
    } catch (error) {
      if (error.response?.status === 403) {
        const code = error.response.data.code
        const message = error.response.data.message
        
        if (code === 'EMAIL_NOT_VERIFIED') {
          navigate('/verify-email-required')
          return
        }
        
        if (message?.includes('approval')) {
          navigate('/pending-approval')
          return
        }
      }
      
      setErrors({ 
        general: error.response?.data?.message || 'Login failed. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${selectedRole}&returnTo=${encodeURIComponent(returnTo)}`
  }

  if (!selectedRole) {
    return null // Will redirect to role selection
  }

  const roleTitle = selectedRole === 'mentor' ? 'Mentor' : 'Learner'

  return (
    <AuthLayout
      title={`Sign in as ${roleTitle}`}
      subtitle="Welcome back to SkillSphere"
    >
      <Card className={`shadow-xl border-0 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CardContent className="p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <div className="flex justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-medium"
              size="lg"
            >
              {loading ? 'Signing in...' : `Sign in as ${roleTitle}`}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAuth}
              className="w-full py-3 text-lg font-medium flex items-center justify-center gap-3"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google as {roleTitle}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Want to switch roles?{' '}
              <button
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'login', returnTo } })}
                className="text-primary font-medium hover:underline"
              >
                Choose different role
              </button>
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'signup' } })}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 