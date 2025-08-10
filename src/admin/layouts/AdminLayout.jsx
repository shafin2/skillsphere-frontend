import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">SkillSphere Admin</h1>
                <p className="text-sm text-gray-400">Administration Portal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">Admin</h1>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/mentors" className="text-gray-300 hover:text-white transition-colors">
                Mentors
              </Link>
              <Link to="/admin/users" className="text-gray-300 hover:text-white transition-colors">
                Users
              </Link>
              <Link to="/admin/sessions" className="text-gray-300 hover:text-white transition-colors">
                Sessions
              </Link>
              <Link to="/admin/feedback" className="text-gray-300 hover:text-white transition-colors">
                Feedback
              </Link>
              <Link to="/admin/analytics" className="text-gray-300 hover:text-white transition-colors">
                Analytics
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-700 bg-gray-800/80 backdrop-blur">
              <div className="px-4 py-4 space-y-2">
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/mentors" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mentors
                </Link>
                <Link 
                  to="/admin/users" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  to="/admin/sessions" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sessions
                </Link>
                <Link 
                  to="/admin/feedback" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feedback
                </Link>
                <Link 
                  to="/admin/analytics" 
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics
                </Link>
                <button 
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h2>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
