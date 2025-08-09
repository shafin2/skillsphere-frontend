import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import http from '../../lib/http.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
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
    
    if (!token) {
      setErrors({ general: 'Invalid reset link' })
      return
    }

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await http.post('/auth/reset-password', {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      
      setSuccess(true)
      setTimeout(() => navigate('/auth/login'), 3000)
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Reset failed. The link may be expired or invalid.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-destructive text-4xl mb-4">✗</div>
              <p className="text-destructive mb-4">Invalid reset link</p>
              <Button asChild>
                <Link to="/auth/forgot-password">Request New Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Create New Password</h1>
          <p className="text-muted mt-2">Enter your new password below</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {success ? (
              <div className="text-center">
                <div className="text-success text-4xl mb-4">✓</div>
                <p className="text-success mb-2">Password reset successfully!</p>
                <p className="text-muted text-sm mb-4">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                    {errors.general}
                  </div>
                )}

                <FormField
                  label="New Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  placeholder="Enter new password"
                />

                <FormField
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  placeholder="Confirm new password"
                />

                <Button 
                  type="submit" 
                  loading={loading}
                  className="w-full"
                >
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link to="/auth/login" className="text-sm text-muted hover:text-foreground">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
} 