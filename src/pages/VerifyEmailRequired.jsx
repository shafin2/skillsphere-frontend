import { Card, CardContent } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeProvider.jsx'

export default function VerifyEmailRequired() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  
  // Get data from navigation state
  const email = location.state?.email
  const role = location.state?.role
  const customMessage = location.state?.message
  
  const defaultMessage = role === 'mentor' 
    ? 'After email verification, your mentor application will be reviewed and you\'ll be notified of the approval status.'
    : 'Check your inbox for a verification link. Once verified, you can sign in to your account.'

  const handleBackToLogin = () => {
    navigate('/auth/role-selection', { state: { mode: 'login' } })
  }

  const handleResendEmail = async () => {
    // TODO: Implement resend email functionality
    console.log('Resend email functionality to be implemented')
  }

  return (
    <AuthLayout
      title="Email Verification Required"
      subtitle="We've sent you a verification link"
    >
      <Card className={`shadow-xl border-0 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Please verify your email
          </h1>
          
          {email && (
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              We sent a verification link to <strong>{email}</strong>
            </p>
          )}
          
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {customMessage || defaultMessage}
          </p>

          {role === 'mentor' && (
            <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Next Steps for Mentors
                </h3>
              </div>
              <ol className={`text-sm text-left space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                <li>1. Verify your email address</li>
                <li>2. Wait for admin approval</li>
                <li>3. Complete your mentor profile</li>
                <li>4. Start mentoring students!</li>
              </ol>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleBackToLogin}
              className="w-full"
              size="lg"
            >
              Back to Sign In
            </Button>
            
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Resend Verification Email
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Didn't receive the email? Check your spam folder or contact support if you continue to have issues.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 