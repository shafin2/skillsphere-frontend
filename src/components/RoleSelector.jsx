import { useState } from 'react'
import Button from './ui/Button.jsx'
import { Card, CardContent } from './ui/Card.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'

export default function RoleSelector({ onRoleSelect, selectedRole, mode = 'signup' }) {
  const { isDark } = useTheme()
  const [hoveredRole, setHoveredRole] = useState(null)

  const roles = [
    {
      id: 'learner',
      title: mode === 'signup' ? 'I want to learn' : 'Continue as Learner',
      description: mode === 'signup' 
        ? 'Browse mentors, book sessions, and track your learning progress'
        : 'Access your learning dashboard and mentoring sessions',
      icon: '🎓',
      color: 'blue'
    },
    {
      id: 'mentor',
      title: mode === 'signup' ? 'I want to teach' : 'Continue as Mentor',
      description: mode === 'signup'
        ? 'Share your expertise, set your availability, and help others grow'
        : 'Manage your mentoring sessions and help students learn',
      icon: '👨‍🏫',
      color: 'purple'
    }
  ]

  const getCardClasses = (role) => {
    const baseClasses = `cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
      isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
    }`
    
    if (selectedRole === role.id) {
      return `${baseClasses} border-${role.color}-500 ring-2 ring-${role.color}-500/20 shadow-lg transform scale-105`
    }
    
    if (hoveredRole === role.id) {
      return `${baseClasses} border-${role.color}-300 shadow-md transform scale-102`
    }
    
    return `${baseClasses} border-gray-200 ${isDark ? 'border-gray-600' : ''}`
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card 
          key={role.id}
          className={getCardClasses(role)}
          onClick={() => onRoleSelect(role.id)}
          onMouseEnter={() => setHoveredRole(role.id)}
          onMouseLeave={() => setHoveredRole(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`text-3xl p-3 rounded-full ${
                selectedRole === role.id 
                  ? `bg-${role.color}-100 ${isDark ? 'bg-' + role.color + '-900' : ''}` 
                  : isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold mb-2 ${
                  selectedRole === role.id 
                    ? `text-${role.color}-700 ${isDark ? 'text-' + role.color + '-300' : ''}` 
                    : isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {role.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {role.description}
                </p>
              </div>
              {selectedRole === role.id && (
                <div className={`text-${role.color}-500 flex-shrink-0`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
