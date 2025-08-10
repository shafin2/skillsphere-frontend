import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import AuthLayout from '../../components/AuthLayout.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import http from '../../lib/http.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { isDark } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      await http.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (error) {
      // Backend always returns success for security, but handle any network errors
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={sent ? "Check Your Email" : "Reset Password"}
      subtitle={sent ? "We've sent you a password reset link" : "Enter your email to reset your password"}
    >
      <Card className={`shadow-xl border-0 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CardContent className="p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Reset Link Sent
              </h2>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                If an account with <strong>{email}</strong> exists, we've sent you a password reset link. 
                Please check your email and follow the instructions.
              </p>
              <Button
                onClick={() => window.location.href = '/auth/role-selection'}
                className="w-full"
                size="lg"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <FormField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                error={error && !email.trim() ? error : ''}
                required
                placeholder="Enter your email address"
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 text-lg font-medium"
                size="lg"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <div className="text-center">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remember your password?{' '}
                  <Link
                    to="/auth/role-selection"
                    className="text-primary font-medium hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 