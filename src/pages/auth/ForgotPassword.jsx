import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import http from '../../lib/http.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted mt-2">
            {sent ? 'Check your email' : 'Enter your email to reset your password'}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            {sent ? (
              <div className="text-center">
                <div className="text-success text-4xl mb-4">✓</div>
                <p className="text-muted mb-4">
                  If an account with that email exists, we've sent you a password reset link.
                </p>
                <Button asChild>
                  <Link to="/auth/login">Back to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                    {error}
                  </div>
                )}

                <FormField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error && !email.trim() ? error : ''}
                  required
                  placeholder="Enter your email"
                />

                <Button 
                  type="submit" 
                  loading={loading}
                  className="w-full"
                >
                  Send Reset Link
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