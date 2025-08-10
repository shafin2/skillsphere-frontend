import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import AuthLayout from '../../components/AuthLayout.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import http from '../../lib/http.js'

export default function Signup() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  
  // Get role from navigation state or redirect to role selection
  const selectedRole = location.state?.role
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If no role selected, redirect to role selection
    if (!selectedRole) {
      navigate('/auth/role-selection', { state: { mode: 'signup' } })
    }
  }, [selectedRole, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Password must contain at least 1 uppercase letter'
    if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least 1 number'
    if (!/(?=.*[!@#$%^&*])/.test(formData.password)) newErrors.password = 'Password must contain at least 1 symbol'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await http.post('/auth/signup', {
        ...formData,
        role: selectedRole
      })
      
      // For both learners and mentors, redirect to email verification first
      navigate('/verify-email-required', { 
        state: { 
          email: formData.email,
          role: selectedRole,
          message: selectedRole === 'mentor' 
            ? 'Please verify your email. After verification, your mentor application will be reviewed.'
            : 'Please verify your email to complete your account setup.'
        }
      })
      
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${selectedRole}`
  }

  if (!selectedRole) {
    return null // Will redirect to role selection
  }

  const roleTitle = selectedRole === 'mentor' ? 'Mentor' : 'Learner'

  return (
    <AuthLayout
      title={`Join as ${roleTitle}`}
      subtitle="Start your learning journey with SkillSphere"
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter your full name"
            />

            <FormField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="Enter your email"
            />

            <FormField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="Create a password"
              helpText="Must be 8+ characters with uppercase, number, and symbol"
            />

            <FormField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              placeholder="Confirm your password"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-medium"
              size="lg"
            >
              {loading ? 'Creating Account...' : `Create ${roleTitle} Account`}
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
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'signup' } })}
                className="text-primary font-medium hover:underline"
              >
                Choose different role
              </button>
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'login' } })}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 