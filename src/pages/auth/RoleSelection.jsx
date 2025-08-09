import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card.jsx'

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState('')
  const navigate = useNavigate()

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/auth/signup', { state: { role: selectedRole } })
    }
  }

  const roles = [
    {
      id: 'learner',
      title: 'I want to learn',
      description: 'Browse mentors, book sessions, and track your learning progress',
      icon: '🎓'
    },
    {
      id: 'mentor',
      title: 'I want to teach',
      description: 'Share your expertise, set your availability, and help others grow',
      icon: '👨‍🏫'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-md bg-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Welcome to SkillSphere</h1>
          <p className="text-muted mt-2">Choose how you'd like to get started</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <Card 
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-base">{role.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {role.description}
                    </CardDescription>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedRole === role.id 
                      ? 'border-primary bg-primary' 
                      : 'border-border'
                  }`}>
                    {selectedRole === role.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full"
          >
            Continue
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth/login')}
            className="w-full"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </div>
  )
} 