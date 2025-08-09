import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
      await login(formData.email, formData.password)
      navigate('/dashboard')
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
          setErrors({ general: message || 'Forbidden' })
        } else if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message })
        } else {
          setErrors({ general: 'Login failed. Please try again.' })
        }
      } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = (role) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google?role=${role}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted mt-2">Sign in to your SkillSphere account</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-3 mb-4">
              <Button 
                variant="secondary" 
                onClick={() => handleGoogleAuth('learner')}
                className="w-full"
                disabled={loading}
              >
                Continue with Google (Learner)
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleGoogleAuth('mentor')}
                className="w-full"
                disabled={loading}
              >
                Continue with Google (Mentor)
              </Button>
            </div>

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
                placeholder="Enter your password"
              />

              <div className="text-right">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link to="/auth/role-selection" className="text-sm text-muted hover:text-foreground">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
} 