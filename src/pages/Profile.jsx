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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ProfileForm user={profile} onSubmitSuccess={(u) => { setProfile(u); updateUserProfile(u) }} />
    </div>
  )
} 