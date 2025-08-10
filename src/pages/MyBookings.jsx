import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import FeedbackModal from '../components/FeedbackModal.jsx'

export default function MyBookings() {
  const { user } = useAuth()
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'confirmed':
        return (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return null
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

  const handleFeedbackClick = (bookingId, mentorName) => {
    setFeedbackModal({
      isOpen: true,
      bookingId,
      mentorName
    })
  }

  const createChatChannel = async (bookingId) => {
    try {
      setChatLoading(prev => ({ ...prev, [bookingId]: true }))
      const { data } = await http.post(`/chat/channel/${bookingId}`)
      navigate(`/chat/${data.channelId}`)
    } catch (error) {
      console.error('Error creating chat channel:', error)
      alert(error.response?.data?.error || 'Failed to open chat')
    } finally {
      setChatLoading(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your mentoring sessions and appointments</p>
      </div>

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