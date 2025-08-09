import { createContext, useContext, useState, useEffect } from 'react'
import http from '../lib/http.js'

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
  loading: true
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const { data } = await http.get('/auth/me')
          setUser(data.user)
        } catch (error) {
          localStorage.removeItem('accessToken')
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const { data } = await http.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    const { data: userData } = await http.get('/auth/me')
    setUser(userData.user)
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
  }

  const value = {
    user,
    setUser,
    login,
    logout,
    loading
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