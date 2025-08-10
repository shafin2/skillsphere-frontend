import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import RoleSelector from '../../components/RoleSelector.jsx'
import AuthLayout from '../../components/AuthLayout.jsx'

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if this is for login or signup
  const mode = location.state?.mode || 'signup'
  const returnTo = location.state?.returnTo || '/dashboard'

  const handleContinue = () => {
    if (selectedRole) {
      if (mode === 'signup') {
        navigate('/auth/signup', { state: { role: selectedRole } })
      } else {
        navigate('/auth/login', { state: { role: selectedRole, returnTo } })
      }
    }
  }

  return (
    <AuthLayout
      title="Welcome to SkillSphere"
      subtitle={mode === 'signup' ? "Choose how you'd like to get started" : "How would you like to continue?"}
    >
      <div className="space-y-6">
        <RoleSelector 
          selectedRole={selectedRole}
          onRoleSelect={setSelectedRole}
          mode={mode}
        />

        <Button
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          {mode === 'signup' ? 'Create Account' : 'Continue to Login'}
        </Button>

        <div className="text-center">
          {mode === 'signup' ? (
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'login' } })}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/auth/role-selection', { state: { mode: 'signup' } })}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </AuthLayout>
  )
} 