import { Card, CardContent } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import AuthLayout from '../components/AuthLayout.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'

export default function PendingApproval() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isDark } = useTheme()

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/auth/role-selection')
  }

  return (
    <AuthLayout
      title="Application Under Review"
      subtitle="Your mentor application is being processed"
    >
      <Card className={`shadow-xl border-0 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Mentor Application Under Review
          </h1>
          
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Thank you for applying to become a mentor! Our admin team is reviewing your application. 
            You'll receive an email notification once your application is approved.
          </p>

          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
            <h3 className={`font-medium mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
              What happens next?
            </h3>
            <ul className={`text-sm text-left space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-700'}`}>
              <li>• Admin reviews your application</li>
              <li>• You receive email notification of approval</li>
              <li>• Complete your mentor profile setup</li>
              <li>• Start accepting mentoring sessions</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGoToDashboard}
              className="w-full"
              size="lg"
            >
              Continue to Dashboard
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Sign Out
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Questions about your application? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  )
} 