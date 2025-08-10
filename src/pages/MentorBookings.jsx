import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'

export default function MentorBookings() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState({})

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await http.get('/bookings')
        setBookings(data.bookings)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const handleConfirm = async (bookingId) => {
    try {
      await http.put(`/bookings/${bookingId}/confirm`)
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'confirmed' } : b
      ))
    } catch (error) {
      alert('Failed to confirm booking')
    }
  }

  const handleReject = async (bookingId) => {
    if (!confirm('Are you sure you want to reject this booking?')) return
    
    try {
      await http.put(`/bookings/${bookingId}/reject`)
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    } catch (error) {
      alert('Failed to reject booking')
    }
  }

  const handleOpenChat = async (bookingId) => {
    setChatLoading(prev => ({ ...prev, [bookingId]: true }))
    
    try {
      const { data } = await http.post('/chat/create-channel', { bookingId })
      navigate(`/chat/${data.channelId}`)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to open chat')
    } finally {
      setChatLoading(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const handleJoinCall = (bookingId) => {
    navigate(`/call/${bookingId}`)
  }

  const handleViewTranscript = (bookingId) => {
    navigate(`/transcript/${bookingId}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning'
      case 'confirmed': return 'text-success'
      case 'completed': return 'text-muted'
      case 'cancelled': return 'text-destructive'
      default: return 'text-muted'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

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
            <a href="/mentor-bookings" className="text-sm font-medium">Booking Requests</a>
            <a href="/profile" className="text-sm">Profile</a>
            <button onClick={toggleTheme} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Booking Requests</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted">No booking requests yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <Card key={booking._id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Mobile-first responsive layout */}
                  <div className="flex flex-col lg:flex-row">
                    {/* Learner info section */}
                    <div className="flex items-start gap-4 p-6 flex-1">
                      <img 
                        src={booking.learnerId?.avatar || '/vite.svg'} 
                        alt={booking.learnerId?.fullName} 
                        className="h-16 w-16 lg:h-12 lg:w-12 rounded-full object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg lg:text-base truncate">{booking.learnerId?.fullName}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted mt-1">
                          <span className="flex items-center gap-1">
                            📅 {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            🕐 {formatTime(booking.time)}
                          </span>
                          <span className={`font-medium capitalize ${getStatusColor(booking.status)} inline-flex items-center px-2 py-1 rounded-full text-xs bg-opacity-10`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.message && (
                          <div className="mt-4 p-3 bg-surface rounded-md border border-border">
                            <p className="text-sm text-foreground/80 font-medium">
                              Message from learner:
                            </p>
                            <p className="text-sm mt-1">{booking.message}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions section */}
                    <div className="border-t lg:border-t-0 lg:border-l border-border p-4 lg:p-6 bg-gray-50/50">
                      <div className="flex flex-col gap-3 lg:min-w-[320px]">
                        {booking.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="secondary"
                              size="sm"
                              onClick={() => handleConfirm(booking._id)}
                              className="text-xs"
                            >
                              ✓ Confirm
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleReject(booking._id)}
                              className="text-xs"
                            >
                              ✗ Reject
                            </Button>
                          </div>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleJoinCall(booking._id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                              📹 Join Call
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleOpenChat(booking._id)}
                                disabled={chatLoading[booking._id]}
                                className="text-xs"
                              >
                                {chatLoading[booking._id] ? '...' : '💬 Chat'}
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleViewTranscript(booking._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              >
                                📄 Transcript
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {booking.status === 'completed' && (
                          <div className="flex items-center justify-center">
                            <span className="text-sm text-green-600 font-medium px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                              ✓ Session Completed
                            </span>
                          </div>
                        )}
                        
                        {booking.status === 'cancelled' && (
                          <div className="flex items-center justify-center">
                            <span className="text-sm text-red-600 font-medium px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                              ✗ Cancelled
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 