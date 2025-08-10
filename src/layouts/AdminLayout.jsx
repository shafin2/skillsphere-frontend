import { Link, useNavigate } from 'react-router-dom'

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate()

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
              <div>
                <h1 className="text-xl font-bold text-white">SkillSphere Admin</h1>
                <p className="text-sm text-gray-400">Administration Portal</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/mentors" className="text-gray-300 hover:text-white transition-colors">
                Mentors
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
