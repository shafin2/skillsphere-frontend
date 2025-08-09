import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // needed for refresh/logout cookie
})

// Attach access token from localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401
let isRefreshing = false
let pending = []

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
          )
          localStorage.setItem('accessToken', data.accessToken)
          pending.forEach((fn) => fn(data.accessToken))
          pending = []
          return http(original)
        } catch (e) {
          pending.forEach((fn) => fn(null))
          pending = []
          localStorage.removeItem('accessToken')
          // Redirect to login or handle auth failure
          window.location.href = '/login'
          throw e
        } finally {
          isRefreshing = false
        }
      }
      return new Promise((resolve, reject) => {
        pending.push((token) => {
          if (!token) return reject(error)
          original.headers.Authorization = `Bearer ${token}`
          resolve(http(original))
        })
      })
    }
    return Promise.reject(error)
  }
)

export default http 