import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Calendar, TrendingUp, Users, BookOpen, Star } from 'lucide-react'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    users: { total: 0, mentors: 0, learners: 0, newThisMonth: 0 },
    sessions: { total: 0, completed: 0, thisMonth: 0 },
    feedback: { total: 0, averageRating: 0, ratingDistribution: [] },
    charts: { weeklyUserGrowth: [], weeklySessionBookings: [] }
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('lastMonth')
  const [selectedMetric, setSelectedMetric] = useState('users')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const { data } = await http.get('/admin/analytics', {
        params: { timeRange }
      })
      
      if (data.success && data.analytics) {
        setAnalytics(data.analytics)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async (type) => {
    try {
      let endpoint = ''
      let filename = ''
      
      switch (type) {
        case 'users':
          endpoint = '/admin/export/users'
          filename = 'users_export.csv'
          break
        case 'sessions':
          endpoint = '/admin/export/sessions'
          filename = 'sessions_export.csv'
          break
        case 'analytics':
          // Create analytics summary CSV
          const csvData = [
            ['Metric', 'Value'],
            ['Total Users', analytics.users.total],
            ['Total Mentors', analytics.users.mentors],
            ['Total Learners', analytics.users.learners],
            ['Total Sessions', analytics.sessions.total],
            ['Completed Sessions', analytics.sessions.completed],
            ['Average Rating', analytics.feedback.averageRating],
            ['Total Feedback', analytics.feedback.total]
          ]
          
          const csv = csvData.map(row => row.join(',')).join('\n')
          const blob = new Blob([csv], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'analytics_summary.csv'
          a.click()
          window.URL.revokeObjectURL(url)
          return
      }

      const response = await http.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const getTopMentors = () => {
    // Mock data - in real app, this would come from API
    return [
      { name: 'Dr. Sarah Johnson', sessions: 45, rating: 4.9, students: 32 },
      { name: 'Prof. Michael Chen', sessions: 38, rating: 4.8, students: 28 },
      { name: 'Emma Rodriguez', sessions: 33, rating: 4.7, students: 25 },
      { name: 'David Kim', sessions: 29, rating: 4.6, students: 22 },
      { name: 'Lisa Thompson', sessions: 26, rating: 4.5, students: 19 }
    ]
  }

  const getTrendingSkills = () => {
    // Mock data - in real app, this would come from API
    return [
      { skill: 'React Development', sessions: 67, growth: '+24%' },
      { skill: 'Data Science', sessions: 54, growth: '+18%' },
      { skill: 'UI/UX Design', sessions: 43, growth: '+15%' },
      { skill: 'Python Programming', sessions: 39, growth: '+12%' },
      { skill: 'Machine Learning', sessions: 35, growth: '+8%' }
    ]
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
            <p className="text-gray-400 mt-2">Comprehensive insights and data visualization</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="lastWeek">Last Week</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="lastYear">Last Year</option>
            </select>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => exportData('analytics')}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Summary</span>
                <span className="sm:hidden">Summary</span>
              </button>
              <button
                onClick={() => exportData('users')}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Users</span>
                <span className="sm:hidden">Users</span>
              </button>
              <button
                onClick={() => exportData('sessions')}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export Sessions</span>
                <span className="sm:hidden">Sessions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Users</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{analytics.users.total}</p>
                <p className="text-blue-200 text-xs mt-1">+{analytics.users.newThisMonth} this month</p>
              </div>
              <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Sessions</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{analytics.sessions.total}</p>
                <p className="text-green-200 text-xs mt-1">+{analytics.sessions.thisMonth} this month</p>
              </div>
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {analytics.sessions.total > 0 ? Math.round((analytics.sessions.completed / analytics.sessions.total) * 100) : 0}%
                </p>
                <p className="text-purple-200 text-xs mt-1">Session completion</p>
              </div>
              <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Avg Rating</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{analytics.feedback.averageRating}</p>
                <p className="text-yellow-200 text-xs mt-1">Out of 5 stars</p>
              </div>
              <Star className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.charts.weeklyUserGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Session Bookings Chart */}
          <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Session Bookings</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.charts.weeklySessionBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="week" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
                />
                <Bar dataKey="sessions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution and Top Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.feedback.ratingDistribution.map(item => ({
                    name: `${item._id} Star${item._id !== 1 ? 's' : ''}`,
                    value: item.count,
                    rating: item._id
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.feedback.ratingDistribution.map((entry, index) => {
                    const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#059669'];
                    return <Cell key={`cell-${index}`} fill={colors[entry._id - 1] || '#6B7280'} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Mentors */}
          <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Top Performing Mentors</h3>
            <div className="space-y-3 sm:space-y-4">
              {getTopMentors().map((mentor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium text-sm sm:text-base truncate">{mentor.name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">{mentor.sessions} sessions • {mentor.students} students</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-yellow-400 font-semibold text-sm">⭐ {mentor.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Skills */}
        <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Trending Skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTrendingSkills().map((skill, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gray-600/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm sm:text-base truncate pr-2">{skill.skill}</h4>
                  <span className="text-green-400 text-xs sm:text-sm font-semibold flex-shrink-0">{skill.growth}</span>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">{skill.sessions} sessions booked</p>
                <div className="mt-2 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(skill.sessions / 67) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
