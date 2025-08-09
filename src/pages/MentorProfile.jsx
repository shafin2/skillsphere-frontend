import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'
import BookingModal from '../components/BookingModal.jsx'

export default function MentorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const { data } = await http.get(`/mentors/${id}`)
        setMentor(data.mentor)
      } catch (error) {
        if (error.response?.status === 404) {
          navigate('/mentors')
        }
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchMentor()
  }, [id, navigate])

  const handleBookSession = () => {
    if (!user) {
      // Store current path and redirect to login
      localStorage.setItem('redirectAfterLogin', `/mentors/${id}`)
      navigate('/auth/login')
      return
    }
    
    if (!user.roles?.includes('learner')) {
      return // Button should be disabled but just in case
    }
    
    setShowBookingModal(true)
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    // Could show a success toast here
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Mentor not found</p>
        </div>
      </div>
    )
  }

  const canBook = user?.roles?.includes('learner')
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary" />
              <span className="font-semibold text-lg">SkillSphere</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/mentors" className="text-sm">Mentors</a>
            {user ? (
              <>
                <a href="/profile" className="text-sm">Profile</a>
                <button onClick={toggleTheme} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
                  {isDark ? 'Light' : 'Dark'}
                </button>
                <Button variant="ghost" onClick={logout}>Logout</Button>
              </>
            ) : (
              <a href="/auth/login" className="text-sm">Login</a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <img 
                    src={mentor.avatar || '/vite.svg'} 
                    alt={mentor.fullName} 
                    className="h-24 w-24 rounded-full object-cover border border-border"
                  />
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold">{mentor.fullName}</h1>
                    <p className="text-xl text-muted mt-1">{mentor.expertise}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                      <span>📍 {mentor.timezone}</span>
                      {mentor.hourlyRate && <span>💰 ${mentor.hourlyRate}/hr</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-foreground/80 leading-relaxed">{mentor.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {(mentor.skills || []).map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Experience</h2>
                <p className="text-foreground/80">{mentor.experience}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Availability</h2>
                <p className="text-foreground/80">{mentor.availability}</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Links */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Book a Session</h3>
                {!isLoggedIn ? (
                  <div>
                    <Button onClick={handleBookSession} className="w-full mb-2">
                      Book Session
                    </Button>
                    <p className="text-xs text-muted">Login required to book</p>
                  </div>
                ) : canBook ? (
                  <Button onClick={handleBookSession} className="w-full">
                    Book Session
                  </Button>
                ) : (
                  <div>
                    <Button disabled className="w-full mb-2">
                      Book Session
                    </Button>
                    <p className="text-xs text-muted">Only learners can book sessions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {mentor.socialLinks && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Connect</h3>
                  <div className="space-y-2">
                    {mentor.socialLinks.linkedin && (
                      <a 
                        href={mentor.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {mentor.socialLinks.github && (
                      <a 
                        href={mentor.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        🔗 GitHub
                      </a>
                    )}
                    {mentor.socialLinks.twitter && (
                      <a 
                        href={mentor.socialLinks.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        🔗 Twitter
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {showBookingModal && (
        <BookingModal 
          mentor={mentor}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
} 