import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import FormField from '../components/ui/FormField.jsx'
import http from '../lib/http.js'

export default function MentorSearch() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    skill: '',
    expertise: '',
    timezone: '',
    availability: '',
    rating: ''
  })

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams()
        
        // Add non-empty filters to query
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.set(key, value)
        })
        queryParams.set('page', page)
        queryParams.set('limit', 6)

        const { data } = await http.get(`/mentors?${queryParams}`)
        setMentors(data.mentors)
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error('Error fetching mentors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMentors()
  }, [filters, page])

  const updateFilter = (name, value) => {
    setPage(1)
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setPage(1)
    setFilters({
      skill: '',
      expertise: '',
      timezone: '',
      availability: '',
      rating: ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Find a Mentor</h1>
        <p className="text-gray-600 text-lg">Discover expert mentors to guide your learning journey</p>
      </div>
      
      {/* Filters */}
      <Card className="mb-8 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormField 
              label="Skill" 
              name="skill" 
              value={filters.skill} 
              onChange={(e) => updateFilter('skill', e.target.value)} 
              placeholder="e.g., React" 
            />
            <FormField 
              label="Expertise" 
              name="expertise" 
              value={filters.expertise} 
              onChange={(e) => updateFilter('expertise', e.target.value)} 
              placeholder="e.g., Web Development" 
            />

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Timezone</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filters.timezone}
                onChange={(e) => updateFilter('timezone', e.target.value)}
              >
                <option value="">All Timezones</option>
                <option value="UTC-8">Pacific (UTC-8)</option>
                <option value="UTC-5">Eastern (UTC-5)</option>
                <option value="UTC+0">GMT (UTC+0)</option>
                <option value="UTC+5:30">IST (UTC+5:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
              <select
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filters.rating}
                onChange={(e) => updateFilter('rating', e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full hover:bg-gray-50"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : mentors.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600 mb-6">No mentors match your current search criteria. Try adjusting your filters.</p>
            <Button onClick={clearFilters} variant="outline" className="mx-auto">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {mentors.map((mentor) => (
              <Card key={mentor._id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900 mb-1">
                        {mentor.name}
                      </CardTitle>
                      <p className="text-blue-600 font-medium text-sm">
                        {mentor.expertise || 'General Mentoring'}
                      </p>
                    </div>
                    {mentor.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          {mentor.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {mentor.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {mentor.bio}
                      </p>
                    )}
                    
                    {mentor.skills && mentor.skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {mentor.skills.length > 3 && (
                            <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">
                              +{mentor.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="text-2xl font-bold text-gray-900">
                          ${mentor.hourlyRate || 50}
                        </span>
                        <span className="text-gray-500 ml-1">/hour</span>
                      </div>
                      <a 
                        href={`/mentors/${mentor._id}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        View Profile
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
              
              <div className="flex items-center gap-2 px-4">
                <span className="text-sm text-gray-600">
                  Page <span className="font-medium text-gray-900">{page}</span> of{' '}
                  <span className="font-medium text-gray-900">{totalPages}</span>
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 disabled:opacity-50"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}