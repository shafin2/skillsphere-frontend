import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import AuthLayout from '../../components/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeProvider.jsx'
import http from '../../lib/http.js'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { isDark } = useTheme()
  const [status, setStatus] = useState('processing') // processing, error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      
      if (error) {
        setErrorMessage(decodeURIComponent(error))
        setStatus('error')
        return
      }

      if (!token) {
        setErrorMessage('Authentication token not received')
        setStatus('error')
        return
      }

      try {
        // Store the token
        localStorage.setItem('accessToken', token)
        
        // Get user profile
        const { data } = await http.get('/profile/me')
        setUser(data.user)
        
        // Redirect based on user status and role
        if (!data.user.isEmailVerified) {
          navigate('/verify-email-required', {
            state: {
              email: data.user.email,
              role: data.user.roles?.includes('mentor') ? 'mentor' : 'learner'
            }
          })
          return
        }
        
        if (data.user.roles?.includes('mentor') && !data.user.isApproved) {
          navigate('/pending-approval')
          return
        }
        
        // Profile completion will be handled by the modal in App.jsx
        navigate(returnTo)
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Authentication failed')
        setStatus('error')
        localStorage.removeItem('accessToken')
      }
    }

    handleOAuthSuccess()
  }, [searchParams, navigate, setUser])

  if (status === 'error') {
    return (
      <AuthLayout
        title="Authentication Failed"
        subtitle="There was a problem signing you in"
      >
        <Card className={`shadow-xl border-0 ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Sign In Failed
            </h2>
            
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {errorMessage || 'Authentication failed. Please try again.'}
            </p>

            <Button
              onClick={() => navigate('/auth/role-selection')}
              className="w-full"
              size="lg"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Completing Sign In"
      subtitle="Please wait while we finalize your authentication"
    >
      <Card className={`shadow-xl border-0 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
          
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Completing Sign In
          </h2>
          
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Please wait while we set up your account...
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 