import { useTheme } from '../../context/ThemeProvider.jsx'

export default function Logo({ size = 'md', showText = true, className = '' }) {
  const { isDark } = useTheme()
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  }
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-10 h-10', 
    xl: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      } shadow-lg`}>
        <svg className={`${iconSizes[size]} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          SkillSphere
        </span>
      )}
    </div>
  )
}
