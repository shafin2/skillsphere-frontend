import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import http from '../../lib/http.js'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        await http.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
        setStatus('success')
        setMessage('Email verified successfully! You can now sign in.')
      } catch (error) {
        setStatus('error')
        if (error.response?.data?.message) {
          setMessage(error.response.data.message)
        } else {
          setMessage('Verification failed. The link may be expired or invalid.')
        }
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            {status === 'verifying' && (
              <>
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted">Verifying your email...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="text-success text-4xl mb-4">✓</div>
                <p className="text-success mb-4">{message}</p>
                <Button asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="text-destructive text-4xl mb-4">✗</div>
                <p className="text-destructive mb-4">{message}</p>
                <div className="space-y-2">
                  <Button asChild>
                    <Link to="/auth/login">Back to Login</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/auth/role-selection">Create New Account</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 