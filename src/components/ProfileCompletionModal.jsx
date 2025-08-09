import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import FormField from './ui/FormField.jsx'
import http from '../lib/http.js'

const COMMON_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'HTML/CSS',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Machine Learning', 'Data Science',
  'UI/UX Design', 'Project Management', 'Agile', 'DevOps', 'Mobile Development'
]

const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00',
  'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00',
  'UTC+00:00', 'UTC+01:00', 'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00',
  'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
]

export default function ProfileCompletionModal({ user, onComplete, onClose }) {
  const isMentor = user?.roles?.includes('mentor')
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    skills: user?.skills || [],
    timezone: user?.timezone || '',
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      github: user?.socialLinks?.github || ''
    },
    // Mentor-only fields
    expertise: user?.expertise || '',
    availability: user?.availability || '',
    hourlyRate: user?.hourlyRate || '',
    experience: user?.experience || ''
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
    setSkillInput('')
    setShowSkillSuggestions(false)
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value)
    setShowSkillSuggestions(true)
  }

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (skillInput.trim()) {
        addSkill(skillInput.trim())
      }
    }
  }

  const filteredSkills = COMMON_SKILLS.filter(skill => 
    skill.toLowerCase().includes(skillInput.toLowerCase()) && 
    !formData.skills.includes(skill)
  )

  const validateForm = () => {
    const newErrors = {}

    // Required fields for all users
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required'
    if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required'
    if (!formData.timezone) newErrors.timezone = 'Timezone is required'

    // Bio length check
    if (formData.bio.length > 500) newErrors.bio = 'Bio must be 500 characters or less'

    // Mentor-specific validation
    if (isMentor) {
      if (!formData.expertise.trim()) newErrors.expertise = 'Expertise is required for mentors'
      if (!formData.availability.trim()) newErrors.availability = 'Availability is required for mentors'
      if (!formData.experience.trim()) newErrors.experience = 'Experience is required for mentors'
      
      if (formData.hourlyRate && (isNaN(formData.hourlyRate) || formData.hourlyRate < 0)) {
        newErrors.hourlyRate = 'Hourly rate must be a positive number'
      }
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
      const submitData = { ...formData }
      
      // Convert hourlyRate to number if provided
      if (submitData.hourlyRate) {
        submitData.hourlyRate = parseFloat(submitData.hourlyRate)
      }

      const { data } = await http.put('/profile/me', submitData)
      
      onComplete(data.user)
    } catch (error) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Complete Your {isMentor ? 'Mentor' : 'Learner'} Profile
            </CardTitle>
            <p className="text-center text-muted text-sm">
              Please fill in the required information to continue using SkillSphere
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded">
                  {errors.general}
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                
                <FormField
                  label="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  placeholder="Enter your full name"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Bio *</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-3 py-2 border rounded-md resize-none h-24 ${
                      errors.bio ? 'border-destructive' : 'border-border'
                    }`}
                    maxLength={500}
                  />
                  <div className="flex justify-between text-xs text-muted mt-1">
                    <span>{errors.bio || ''}</span>
                    <span>{formData.bio.length}/500</span>
                  </div>
                </div>

                <FormField
                  label="Avatar URL"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Timezone *</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.timezone ? 'border-destructive' : 'border-border'
                    }`}
                  >
                    <option value="">Select your timezone</option>
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  {errors.timezone && <span className="text-destructive text-xs">{errors.timezone}</span>}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Skills *</h3>
                
                <div className="relative">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    onKeyDown={handleSkillInputKeyDown}
                    placeholder="Type to add skills..."
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                  
                  {showSkillSuggestions && skillInput && filteredSkills.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-md mt-1 max-h-40 overflow-y-auto z-10">
                      {filteredSkills.slice(0, 5).map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addSkill(skill)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {errors.skills && <span className="text-destructive text-xs">{errors.skills}</span>}
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Social Links</h3>
                
                <FormField
                  label="LinkedIn"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />

                <FormField
                  label="Twitter"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                />

                <FormField
                  label="GitHub"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              {/* Mentor-specific fields */}
              {isMentor && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Mentor Information</h3>
                  
                  <FormField
                    label="Expertise *"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    error={errors.expertise}
                    placeholder="e.g., Full-stack Development, Data Science, UI/UX Design"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2">Availability *</label>
                    <textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      placeholder="Describe your availability (e.g., Weekdays 6-9 PM EST, Weekends flexible)"
                      className={`w-full px-3 py-2 border rounded-md resize-none h-20 ${
                        errors.availability ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.availability && <span className="text-destructive text-xs">{errors.availability}</span>}
                  </div>

                  <FormField
                    label="Hourly Rate (USD)"
                    name="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    error={errors.hourlyRate}
                    placeholder="50"
                    min="0"
                    step="0.01"
                  />

                  <FormField
                    label="Experience *"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    error={errors.experience}
                    placeholder="e.g., 5+ years in software development, worked at Google and startups"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Complete Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 