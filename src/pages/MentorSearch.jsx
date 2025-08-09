import { useEffect, useMemo, useState } from 'react'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent } from '../components/ui/Card.jsx'
import FormField from '../components/ui/FormField.jsx'

const TIMEZONES = [
  'UTC-12:00','UTC-11:00','UTC-10:00','UTC-09:00','UTC-08:00','UTC-07:00','UTC-06:00','UTC-05:00','UTC-04:00','UTC-03:00','UTC-02:00','UTC-01:00','UTC+00:00','UTC+01:00','UTC+02:00','UTC+03:00','UTC+04:00','UTC+05:00','UTC+06:00','UTC+07:00','UTC+08:00','UTC+09:00','UTC+10:00','UTC+11:00','UTC+12:00'
]

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeProvider.jsx'

export default function MentorSearch() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filters, setFilters] = useState({
    skill: '',
    expertise: '',
    timezone: '',
    rateMin: '',
    rateMax: ''
  })

  const debouncedFilters = {
    skill: useDebouncedValue(filters.skill, 400),
    expertise: useDebouncedValue(filters.expertise, 400),
    timezone: filters.timezone,
    rateMin: useDebouncedValue(filters.rateMin, 400),
    rateMax: useDebouncedValue(filters.rateMax, 400)
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '9')
    if (debouncedFilters.skill) params.set('skill', debouncedFilters.skill)
    if (debouncedFilters.expertise) params.set('expertise', debouncedFilters.expertise)
    if (debouncedFilters.timezone) params.set('timezone', debouncedFilters.timezone)
    if (debouncedFilters.rateMin) params.set('rateMin', debouncedFilters.rateMin)
    if (debouncedFilters.rateMax) params.set('rateMax', debouncedFilters.rateMax)
    return params.toString()
  }, [page, debouncedFilters])

  const fetchMentors = async () => {
    setLoading(true)
    try {
      const { data } = await http.get(`/mentors?${queryString}`)
      setMentors(data.mentors)
      setTotalPages(data.totalPages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMentors() }, [queryString])

  const updateFilter = (name, value) => {
    setPage(1)
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Mentor</h1>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <FormField label="Skill" name="skill" value={filters.skill} onChange={(e) => updateFilter('skill', e.target.value)} placeholder="e.g., React" />
              <FormField label="Expertise" name="expertise" value={filters.expertise} onChange={(e) => updateFilter('expertise', e.target.value)} placeholder="e.g., Web Development" />

              <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-surface text-foreground"
                  value={filters.timezone}
                  onChange={(e) => updateFilter('timezone', e.target.value)}
                >
                  <option value="">Any</option>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>

              <FormField label="Min Rate" name="rateMin" type="number" value={filters.rateMin} onChange={(e) => updateFilter('rateMin', e.target.value)} placeholder="0" />
              <FormField label="Max Rate" name="rateMax" type="number" value={filters.rateMax} onChange={(e) => updateFilter('rateMax', e.target.value)} placeholder="100" />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map(m => (
                <Card key={m._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={m.avatar || '/vite.svg'} alt={m.fullName} className="h-14 w-14 rounded-full object-cover border border-border" />
                      <div>
                        <h3 className="font-semibold">{m.fullName || 'Mentor'}</h3>
                        <p className="text-sm text-muted">{m.expertise}</p>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm line-clamp-3 text-foreground/80">{m.bio}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(m.skills || []).slice(0, 5).map(s => (
                        <span key={s} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{s}</span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-muted">
                      <span>Timezone: {m.timezone || 'N/A'}</span>
                      {m.hourlyRate !== undefined && m.hourlyRate !== null && (
                        <span>${m.hourlyRate}/hr</span>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a href={`/mentors/${m._id}`} className="flex-1">
                        <Button className="w-full" variant="secondary">View Profile</Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!loading && mentors.length === 0 && (
                <div className="col-span-full text-center text-muted py-12">No mentors found. Try adjusting filters.</div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </main>
    </div>
  )
} 