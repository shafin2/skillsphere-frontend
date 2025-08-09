import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({
  isDark: false,
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {}
})

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const persisted = localStorage.getItem('theme')
  if (persisted === 'dark' || persisted === 'light') return persisted
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const persisted = localStorage.getItem('theme')
      if (!persisted) setTheme(e.matches ? 'dark' : 'light')
    }
    media.addEventListener?.('change', handleChange)
    return () => media.removeEventListener?.('change', handleChange)
  }, [])

  const value = useMemo(() => ({
    isDark: theme === 'dark',
    theme,
    setTheme,
    toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
} 