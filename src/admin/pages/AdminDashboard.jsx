import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState({
    users: {
      total: 0,
      mentors: 0,
      learners: 0,
      pendingMentors: 0,
      newThisMonth: 0,
      newThisWeek: 0
    },
    sessions: {
      total: 0,
      completed: 0,
      active: 0,
      upcoming: 0,
      cancelled: 0,
      thisMonth: 0
    },
    feedback: {
      total: 0,
      averageRating: 0,
      ratingDistribution: []
    },
    charts: {
      weeklyUserGrowth: [],
      weeklySessionBookings: []
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const { data } = await http.get('/admin/analytics')
      console.log('[AdminDashboard] Analytics response:', data)
      
      if (data.success && data.analytics) {
        setAnalytics(data.analytics)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading analytics...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      {/* User Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{analytics.users.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
              <span className="text-blue-300 text-xl">👥</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-200">
            +{analytics.users.newThisWeek} this week
          </div>
        </div>

        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Active Mentors</p>
              <p className="text-3xl font-bold text-white">{analytics.users.mentors}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
              <span className="text-green-300 text-xl">👨‍🏫</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-300 text-sm font-medium">Pending Mentors</p>
              <p className="text-3xl font-bold text-white">{analytics.users.pendingMentors}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/30 rounded-lg flex items-center justify-center">
              <span className="text-amber-300 text-xl">⏳</span>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/mentors" 
              className="text-amber-300 hover:text-amber-200 text-sm font-medium"
            >
              Review applications →
            </Link>
          </div>
        </div>

        <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Learners</p>
              <p className="text-3xl font-bold text-white">{analytics.users.learners}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
              <span className="text-purple-300 text-xl">🎓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold text-white">{analytics.sessions.total}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/30 rounded-lg flex items-center justify-center">
              <span className="text-cyan-300 text-xl">📊</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-cyan-200">
            {analytics.sessions.thisMonth} this month
          </div>
        </div>

        <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-white">{analytics.sessions.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/30 rounded-lg flex items-center justify-center">
              <span className="text-emerald-300 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-500/20 border border-orange-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-white">{analytics.sessions.active}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/30 rounded-lg flex items-center justify-center">
              <span className="text-orange-300 text-xl">🟢</span>
            </div>
          </div>
        </div>

        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Cancelled</p>
              <p className="text-3xl font-bold text-white">{analytics.sessions.cancelled}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/30 rounded-lg flex items-center justify-center">
              <span className="text-red-300 text-xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">Feedback Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Feedback</span>
              <span className="text-white font-semibold">{analytics.feedback.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Average Rating</span>
              <span className="text-yellow-400 font-semibold">
                ⭐ {analytics.feedback.averageRating}/5
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Sessions Today</span>
              <span className="text-white font-semibold">{analytics.sessions.today || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Sessions This Week</span>
              <span className="text-white font-semibold">{analytics.sessions.thisWeek || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">New Users This Week</span>
              <span className="text-white font-semibold">{analytics.users.newThisWeek}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Pending Approvals</span>
              <span className="text-amber-400 font-semibold">{analytics.users.pendingMentors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth Chart */}
        <div className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">User Growth (Last 8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.charts.weeklyUserGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Session Bookings Chart */}
        <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">Session Bookings (Last 8 Weeks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.charts.weeklySessionBookings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F9FAFB'
                }}
              />
              <Bar dataKey="sessions" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Satisfaction Ratings Distribution</h3>
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
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
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 lg:pl-8">
            <div className="space-y-3">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-white">
                  {analytics.feedback.averageRating}/5
                </p>
                <p className="text-gray-300">Average Rating</p>
              </div>
              <div className="space-y-2">
                {analytics.feedback.ratingDistribution.map((item) => (
                  <div key={item._id} className="flex items-center space-x-2">
                    <span className="text-yellow-400">{'★'.repeat(item._id)}</span>
                    <span className="text-gray-300 text-sm">({item.count} reviews)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              to="/admin/mentors"
              className="block w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Review Mentor Applications
            </Link>
            <Link 
              to="/admin/users"
              className="block w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Manage Users
            </Link>
            <Link 
              to="/admin/sessions"
              className="block w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              View Sessions
            </Link>
            <Link 
              to="/admin/feedback"
              className="block w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-center font-medium"
            >
              Moderate Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
        <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">System Status</span>
            <span className="text-green-400 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Database</span>
            <span className="text-green-400 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Authentication</span>
            <span className="text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
