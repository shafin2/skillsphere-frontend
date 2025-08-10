import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import FormField from './ui/FormField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import http from '../lib/http.js'

export default function BookingModal({ mentor, onClose, onSuccess }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Safety check for mentor
  if (!mentor) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // If date changes, fetch available slots for that date
    if (name === 'date' && value) {
      fetchAvailableSlots(value)
    }
  }

  const fetchAvailableSlots = async (date) => {
    setLoadingSlots(true)
    try {
      const { data } = await http.get(`/bookings/available-slots/${mentor._id}?date=${date}`)
      setAvailableSlots(data.availableSlots || [])
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate <= today) {
        newErrors.date = 'Please select a future date'
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required'
    }

    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'Message must be 500 characters or less'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      await http.post('/bookings', {
        mentorId: mentor._id,
        date: formData.date,
        time: formData.time,
        message: formData.message
      })
      
      onSuccess({ 
        message: 'Booking request sent successfully! The mentor will review your request.',
        type: 'success'
      })
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Failed to create booking. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // Generate time options based on available slots or default slots
  const getTimeOptions = () => {
    if (formData.date && availableSlots.length > 0) {
      return availableSlots.map(slot => ({
        value: slot,
        label: formatTime(slot)
      }))
    }
    
    // Default time options (9 AM to 9 PM)
    const defaultSlots = []
    for (let hour = 9; hour <= 21; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`
      defaultSlots.push({
        value: time24,
        label: formatTime(time24)
      })
    }
    return defaultSlots
  }

  const formatTime = (time24) => {
    const [hour] = time24.split(':')
    const hourNum = parseInt(hour)
    return hourNum > 12 ? `${hourNum - 12}:00 PM` : hourNum === 12 ? '12:00 PM' : `${hourNum}:00 AM`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-md my-8 max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Book Session with {mentor?.fullName || mentor?.name || 'Mentor'}
            </CardTitle>
            <p className="text-center text-muted text-sm">
              Schedule your mentoring session
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Mentor Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img 
                src={mentor.avatar || '/vite.svg'} 
                alt={mentor.fullName || mentor.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-lg">{mentor.fullName || mentor.name}</h3>
                <p className="text-sm text-muted">{mentor.expertise || 'General Mentoring'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {mentor.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Session Rate</p>
                  <p className="text-2xl font-bold text-blue-600">${mentor.hourlyRate || 50}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-lg font-semibold">1 Hour</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded">
                  {errors.general}
                </div>
              )}

              <FormField
                label="Date *"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                error={errors.date}
                min={new Date().toISOString().split('T')[0]}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Time *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!formData.date}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                    errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } ${!formData.date ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {!formData.date ? 'Select date first' : loadingSlots ? 'Loading slots...' : 'Select time'}
                  </option>
                  {getTimeOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.time && <span className="text-red-500 text-xs">{errors.time}</span>}
                {formData.date && availableSlots.length === 0 && !loadingSlots && (
                  <p className="text-sm text-amber-600 mt-1">No available slots for this date. Please try another date.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What do you want to focus on? (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe what you'd like to learn or focus on during this session..."
                  className={`w-full px-3 py-2 border rounded-md resize-none h-20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 ${
                    errors.message ? 'border-red-500' : ''
                  }`}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{errors.message || ''}</span>
                  <span>{formData.message.length}/500</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                  disabled={!formData.date || !formData.time}
                >
                  Book Session
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 