import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import FormField from './ui/FormField.jsx'
import http from '../lib/http.js'

export default function BookingModal({ mentor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    message: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
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
      
      onSuccess()
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

  // Generate time options (9 AM to 9 PM)
  const timeOptions = []
  for (let hour = 9; hour <= 21; hour++) {
    const time12 = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`
    const time24 = `${hour.toString().padStart(2, '0')}:00`
    timeOptions.push({ value: time24, label: time12 })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Book Session with {mentor.fullName}
            </CardTitle>
            <p className="text-center text-muted text-sm">
              Schedule your mentoring session
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
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
                  className={`w-full px-3 py-2 border rounded-md bg-surface text-foreground ${
                    errors.time ? 'border-destructive' : 'border-border'
                  }`}
                >
                  <option value="">Select time</option>
                  {timeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.time && <span className="text-destructive text-xs">{errors.time}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="What would you like to discuss? Any specific topics or questions?"
                  className={`w-full px-3 py-2 border rounded-md resize-none h-20 bg-surface text-foreground placeholder:text-muted ${
                    errors.message ? 'border-destructive' : 'border-border'
                  }`}
                  maxLength={500}
                />
                <div className="flex justify-between text-xs text-muted mt-1">
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