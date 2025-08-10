import { createContext, useContext, useState, useEffect } from 'react'
import http from '../lib/http.js'

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  loading: true,
  showProfileModal: false,
  setShowProfileModal: () => {},
  updateUserProfile: () => {}
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const { data } = await http.get('/profile/me')
          setUser(data.user)
          
          // Check if profile is incomplete and user is authenticated (but not admin)
          if (data.user && !data.user.isProfileComplete && !data.user.roles?.includes('admin')) {
            setShowProfileModal(true)
          }
        } catch (error) {
          // Fallback to auth/me if profile endpoint fails
          try {
            const { data: authData } = await http.get('/auth/me')
            setUser(authData.user)
            if (authData.user && !authData.user.isProfileComplete && !authData.user.roles?.includes('admin')) {
              setShowProfileModal(true)
            }
          } catch (authError) {
            localStorage.removeItem('accessToken')
          }
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const { data } = await http.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    
    // Get full user profile after login
    try {
      const { data: profileData } = await http.get('/profile/me')
      setUser(profileData.user)
      
      // Check if profile is incomplete (but not for admin users)
      if (profileData.user && !profileData.user.isProfileComplete && !profileData.user.roles?.includes('admin')) {
        setShowProfileModal(true)
      }
    } catch (error) {
      // Fallback to auth/me
      const { data: userData } = await http.get('/auth/me')
      setUser(userData.user)
      if (userData.user && !userData.user.isProfileComplete) {
        setShowProfileModal(true)
      }
    }
    
    return data
  }

  const logout = async () => {
    try {
      await http.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if request fails
    }
    localStorage.removeItem('accessToken')
    setUser(null)
    setShowProfileModal(false)
  }

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser)
    setShowProfileModal(false)
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    showProfileModal,
    setShowProfileModal,
    updateUserProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 