import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'
import FeedbackModal from '../components/FeedbackModal.jsx'

export default function MyBookings() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState({})
  const [feedbackStatus, setFeedbackStatus] = useState({}) // Track feedback status per booking
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    bookingId: null,
    mentorName: ''
  })

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await http.get('/bookings')
        setBookings(data.bookings)
        
        // Check feedback status for completed bookings
        const completedBookings = data.bookings.filter(b => b.status === 'completed')
        const feedbackChecks = {}
        
        for (const booking of completedBookings) {
          try {
            const response = await http.get(`/feedback/can-review/${booking._id}`)
            feedbackChecks[booking._id] = response.data.canReview
          } catch (error) {
            console.error(`Error checking feedback status for booking ${booking._id}:`, error)
            feedbackChecks[booking._id] = false
          }
        }
        
        setFeedbackStatus(feedbackChecks)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await http.delete(`/bookings/${bookingId}`)
      setBookings(prev => prev.map(b => 
        b._id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    } catch (error) {
      alert('Failed to cancel booking')
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

  const handleOpenFeedback = (bookingId, mentorName) => {
    setFeedbackModal({
      isOpen: true,
      bookingId,
      mentorName
    })
  }

  const handleCloseFeedback = () => {
    setFeedbackModal({
      isOpen: false,
      bookingId: null,
      mentorName: ''
    })
  }

  const handleFeedbackSuccess = (feedback) => {
    console.log('Feedback submitted successfully:', feedback)
    // Update feedback status to hide the button
    setFeedbackStatus(prev => ({
      ...prev,
      [feedbackModal.bookingId]: false
    }))
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
            <a href="/bookings" className="text-sm font-medium">My Bookings</a>
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
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted mb-4">You haven't booked any sessions yet.</p>
              <a href="/mentors">
                <Button>Browse Mentors</Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map(booking => (
              <Card key={booking._id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Mobile-first responsive layout */}
                  <div className="flex flex-col lg:flex-row">
                    {/* Mentor info section */}
                    <div className="flex items-start gap-4 p-6 flex-1">
                      <img 
                        src={booking.mentorId?.avatar || '/vite.svg'} 
                        alt={booking.mentorId?.fullName} 
                        className="h-16 w-16 lg:h-12 lg:w-12 rounded-full object-cover border border-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg lg:text-base truncate">{booking.mentorId?.fullName}</h3>
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
                          <p className="text-sm text-foreground/80 mt-3 lg:mt-2 line-clamp-2">
                            <strong>Message:</strong> {booking.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions section */}
                    <div className="border-t lg:border-t-0 lg:border-l border-border p-4 lg:p-6 bg-gray-50/50">
                      <div className="flex flex-col gap-3 lg:min-w-[300px]">
                        {/* Primary actions row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                          <a href={`/mentors/${booking.mentorId?._id}`} className="col-span-1">
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                              View Profile
                            </Button>
                          </a>
                          
                          {booking.status === 'confirmed' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleJoinCall(booking._id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs w-full"
                              >
                                📹 Join Call
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleOpenChat(booking._id)}
                                disabled={chatLoading[booking._id]}
                                className="col-span-1 text-xs w-full"
                              >
                                {chatLoading[booking._id] ? '...' : '💬 Chat'}
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Secondary actions row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(booking.status === 'completed' || booking.status === 'confirmed') && (
                            <Button 
                              size="sm"
                              onClick={() => handleViewTranscript(booking._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                              📄 Transcript
                            </Button>
                          )}
                          
                          {booking.status === 'completed' && feedbackStatus[booking._id] && (
                            <Button 
                              size="sm"
                              onClick={() => handleOpenFeedback(booking._id, booking.mentorId?.fullName)}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                            >
                              ⭐ Rate Mentor
                            </Button>
                          )}
                          
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancel(booking._id)}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={handleCloseFeedback}
        bookingId={feedbackModal.bookingId}
        mentorName={feedbackModal.mentorName}
        onSubmitSuccess={handleFeedbackSuccess}
      />
    </div>
  )
} 