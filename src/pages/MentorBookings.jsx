import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function MentorBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState({})

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await http.get('/bookings/mentor')
        setBookings(data.bookings)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleBookingAction = async (bookingId, action) => {
    try {
      await http.patch(`/bookings/${bookingId}/${action}`)
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: action === 'accept' ? 'confirmed' : 'cancelled' }
          : booking
      ))
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error)
    }
  }

  const createChatChannel = async (bookingId) => {
    try {
      setChatLoading(prev => ({ ...prev, [bookingId]: true }))
      const { data } = await http.post(`/chat/channel/${bookingId}`)
      navigate(`/chat/${data.channelId}`)
    } catch (error) {
      console.error('Error creating chat channel:', error)
    } finally {
      setChatLoading(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour12 = hours % 12 || 12
    const ampm = hours < 12 ? 'AM' : 'PM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success'
      case 'pending': return 'text-warning'
      case 'cancelled': return 'text-error'
      case 'completed': return 'text-info'
      default: return 'text-muted'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Booking Requests</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted mb-4">No booking requests yet</p>
            <p className="text-sm text-muted">
              Students will be able to book sessions with you once your profile is complete.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Session with {booking.learner.name}
                  </CardTitle>
                  <span className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium mb-1">Date & Time</p>
                      <p className="text-muted">
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Duration</p>
                      <p className="text-muted">{booking.duration} minutes</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Student Email</p>
                      <p className="text-muted">{booking.learner.email}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Subject</p>
                      <p className="text-muted">{booking.subject || 'General mentoring'}</p>
                    </div>
                  </div>

                  {booking.message && (
                    <div>
                      <p className="font-medium mb-1 text-sm">Message from student</p>
                      <p className="text-sm text-muted bg-surface p-3 rounded-md">
                        {booking.message}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'accept')}
                          size="sm"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'reject')}
                          variant="outline"
                          size="sm"
                        >
                          Decline
                        </Button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <>
                        <Button
                          onClick={() => createChatChannel(booking._id)}
                          disabled={chatLoading[booking._id]}
                          size="sm"
                        >
                          {chatLoading[booking._id] ? 'Creating...' : 'Start Chat'}
                        </Button>
                        <Button
                          onClick={() => navigate(`/call/${booking._id}`)}
                          variant="outline"
                          size="sm"
                        >
                          Join Video Call
                        </Button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <Button
                        onClick={() => navigate(`/transcript/${booking._id}`)}
                        variant="outline"
                        size="sm"
                      >
                        View Transcript
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
