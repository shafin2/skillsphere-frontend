import { useEffect, useState } from 'react'
import ProfileForm from '../components/ProfileForm.jsx'
import http from '../lib/http.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user, updateUserProfile } = useAuth()
  const [profile, setProfile] = useState(user)
  const [loading, setLoading] = useState(!user)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return
      try {
        const { data } = await http.get('/profile/me')
        setProfile(data.user)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <ProfileForm user={profile} onSubmitSuccess={(u) => { setProfile(u); updateUserProfile(u) }} />
      </div>
    </div>
  )
} 