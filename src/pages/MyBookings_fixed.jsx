import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import FeedbackModal from '../components/FeedbackModal.jsx'
import { 
  generateGoogleCalendarLink, 
  generateICSFile, 
  downloadICSFile, 
  generateBookingCalendarEvent 
} from '../utils/calendarUtils.js'

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

  const handleAddToGoogleCalendar = (booking) => {
    const eventData = generateBookingCalendarEvent(booking, booking.status === 'confirmed')
    const googleCalendarLink = generateGoogleCalendarLink(eventData)
    window.open(googleCalendarLink, '_blank')
  }

  const handleDownloadICS = (booking) => {
    const eventData = generateBookingCalendarEvent(booking, booking.status === 'confirmed')
    const icsContent = generateICSFile(eventData)
    const filename = `mentoring-session-${booking.mentorId?.fullName?.replace(/\s+/g, '-').toLowerCase()}-${formatDate(booking.date)}.ics`
    downloadICSFile(icsContent, filename)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 dark:text-yellow-400'
      case 'confirmed': return 'text-green-700 dark:text-green-400'
      case 'completed': return 'text-blue-700 dark:text-blue-400'
      case 'cancelled': return 'text-red-700 dark:text-red-400'
      default: return 'text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/20'
      case 'confirmed': return 'bg-green-100 dark:bg-green-900/20'
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/20'
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/20'
      default: return 'bg-gray-100 dark:bg-gray-900/20'
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your mentoring sessions and appointments</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't booked any sessions yet.</p>
            <a href="/mentors">
              <Button>Browse Mentors</Button>
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:gap-8">
          {bookings.map(booking => (
            <Card key={booking._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Header with mentor info and status */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <img 
                        src={booking.mentorId?.avatar || '/vite.svg'} 
                        alt={booking.mentorId?.fullName} 
                        className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900 dark:text-white">
                          {booking.mentorId?.fullName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(booking.date)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {formatTime(booking.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} ${getStatusBgColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Message section */}
                  {booking.message && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-gray-900 dark:text-white">Session Focus:</span> {booking.message}
                      </p>
                    </div>
                  )}

                  {/* Actions section */}
                  <div className="p-6">
                    <div className="flex flex-col gap-4">
                      {/* Main action buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center justify-center gap-2 h-10"
                          onClick={() => window.open(`/mentors/${booking.mentorId?._id}`, '_blank')}
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          View Profile
                        </Button>
                        
                        {booking.status === 'confirmed' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleJoinCall(booking._id)}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 h-10"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                              Join Call
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => createChatChannel(booking._id)}
                              disabled={chatLoading[booking._id]}
                              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-10"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              {chatLoading[booking._id] ? 'Loading...' : 'Chat'}
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Secondary action buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {booking.status === 'confirmed' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleAddToGoogleCalendar(booking)}
                              variant="ghost"
                              className="flex items-center justify-center gap-1 text-xs border border-gray-200 dark:border-gray-600 h-9"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Google
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleDownloadICS(booking)}
                              variant="ghost"
                              className="flex items-center justify-center gap-1 text-xs border border-gray-200 dark:border-gray-600 h-9"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              .ics
                            </Button>
                          </>
                        )}
                        
                        {(booking.status === 'completed' || booking.status === 'confirmed') && (
                          <Button 
                            size="sm"
                            onClick={() => handleViewTranscript(booking._id)}
                            variant="ghost"
                            className="flex items-center justify-center gap-1 text-xs border border-gray-200 dark:border-gray-600 h-9"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            Notes
                          </Button>
                        )}
                        
                        {booking.status === 'completed' && feedbackStatus[booking._id] && (
                          <Button 
                            size="sm"
                            onClick={() => handleOpenFeedback(booking._id, booking.mentorId?.fullName)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-1 text-xs h-9"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Rate
                          </Button>
                        )}
                        
                        {booking.status === 'pending' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancel(booking._id)}
                            className="flex items-center justify-center gap-1 text-xs col-span-2 h-9"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Cancel Booking
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
