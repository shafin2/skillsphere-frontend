import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card.jsx'
import http from '../../lib/http.js'

export default function Signup() {
  const location = useLocation()
  const navigate = useNavigate()
  const role = location.state?.role || 'learner'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

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
        role
      })
      
      if (role === 'learner') {
        setSuccess('Account created successfully. Please verify your email.')
      } else {
        setSuccess('Account created. Mentor application pending approval.')
      }
      
      setTimeout(() => navigate('/auth/login'), 3000)
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
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${role}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">
            Create your {role === 'mentor' ? 'mentor' : 'learner'} account
          </h1>
          <p className="text-muted mt-2">Join SkillSphere and start your journey</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="text-center">
                <div className="text-success mb-2">✓</div>
                <p className="text-success">{success}</p>
                <p className="text-muted text-sm mt-2">Redirecting to login...</p>
              </div>
            ) : (
              <>
                <Button 
                  variant="secondary" 
                  onClick={handleGoogleAuth}
                  className="w-full mb-4"
                  disabled={loading}
                >
                  Continue with Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-surface px-2 text-muted">or</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                      {errors.general}
                    </div>
                  )}

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
                    loading={loading}
                    className="w-full"
                  >
                    Create Account
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link to="/auth/login" className="text-sm text-muted hover:text-foreground">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 