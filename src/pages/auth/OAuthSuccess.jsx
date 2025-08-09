import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import http from '../../lib/http.js'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [status, setStatus] = useState('processing') // processing, error

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      
      if (error) {
        setStatus('error')
        return
      }

      if (!token) {
        setStatus('error')
        return
      }

      try {
        // Store the token
        localStorage.setItem('accessToken', token)
        
        // Get user profile
        const { data } = await http.get('/auth/me')
        setUser(data.user)
        
        // Redirect based on user status
        if (data.user.roles?.includes('mentor') && !data.user.isApproved) {
          navigate('/pending-approval')
          return
        }
        if (!data.user.isEmailVerified) {
          navigate('/verify-email-required')
          return
        }
        navigate('/dashboard')
      } catch (error) {
        setStatus('error')
        localStorage.removeItem('accessToken')
      }
    }

    handleOAuthSuccess()
  }, [searchParams, navigate, setUser])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-destructive text-4xl mb-4">✗</div>
              <p className="text-destructive mb-4">
                Authentication failed. Please try again.
              </p>
              <button 
                onClick={() => navigate('/auth/login')}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted">Completing sign in...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 