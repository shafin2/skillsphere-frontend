import { useState, useEffect } from 'react'
import { Eye, Download, X, MessageSquare, FileText, Calendar, User, Star } from 'lucide-react'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminSessions() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [showSessionModal, setShowSessionModal] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [pagination.page, statusFilter])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter })
      })
      
      const { data } = await http.get(`/admin/sessions?${params}`)
      
      if (data.success) {
        setSessions(data.sessions)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportSessions = async (format = 'csv') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/export/sessions?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sessions.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to export sessions:', err)
    }
  }

  const viewSessionDetails = async (sessionId) => {
    try {
      const { data } = await http.get(`/admin/sessions/${sessionId}`)
      if (data.success) {
        setSelectedSession(data.session)
        setShowSessionModal(true)
      }
    } catch (err) {
      console.error('Failed to fetch session details:', err)
    }
  }

  const cancelSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return
    
    try {
      const { data } = await http.patch(`/admin/sessions/${sessionId}/cancel`)
      if (data.success) {
        fetchSessions() // Refresh the list
      }
    } catch (err) {
      console.error('Failed to cancel session:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300'
      case 'confirmed': return 'bg-blue-500/20 text-blue-300'
      case 'pending': return 'bg-yellow-500/20 text-yellow-300'
      case 'cancelled': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading && sessions.length === 0) {
    return (
      <AdminLayout title="Session Management">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading sessions...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Session Management">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => exportSessions('csv')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Session Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Scheduled Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sessions.map((session) => (
                <tr key={session._id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {session.topic || 'General Session'}
                      </div>
                      <div className="text-sm text-gray-400">
                        ID: {session._id.slice(-8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-white">
                        <span className="text-blue-300">Mentor:</span> {session.mentorId?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-400">
                        <span className="text-green-300">Learner:</span> {session.learnerId?.name || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(session.scheduledTime).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(session.scheduledTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {session.duration || 30} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => viewSessionDetails(session._id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        Details
                      </button>
                      {session.status === 'pending' && (
                        <button 
                          onClick={() => cancelSession(session._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <X size={14} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 bg-gray-700/50 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sessions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                {pagination.page}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Total Sessions</div>
          <div className="text-2xl font-bold text-white">{pagination.total}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">This Page</div>
          <div className="text-2xl font-bold text-white">{sessions.length}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Pages</div>
          <div className="text-2xl font-bold text-white">{pagination.pages}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Current Page</div>
          <div className="text-2xl font-bold text-white">{pagination.page}</div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Session Details</h2>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Session Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Session ID:</span>
                      <span className="text-white">{selectedSession._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Topic:</span>
                      <span className="text-white">{selectedSession.topic || 'General Session'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSession.status)}`}>
                        {selectedSession.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{selectedSession.duration || 30} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled:</span>
                      <span className="text-white">
                        {new Date(selectedSession.scheduledTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">
                          {selectedSession.mentorId?.name || 'Unknown Mentor'}
                        </p>
                        <p className="text-gray-400 text-sm">Mentor</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-400" />
                      <div>
                        <p className="text-white font-medium">
                          {selectedSession.learnerId?.name || 'Unknown Learner'}
                        </p>
                        <p className="text-gray-400 text-sm">Learner</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Notes */}
              {selectedSession.notes && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Session Notes
                  </h3>
                  <p className="text-gray-300">{selectedSession.notes}</p>
                </div>
              )}

              {/* Chat History */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat History
                </h3>
                <div className="text-gray-400 text-center py-4">
                  Chat logs would be displayed here if available
                </div>
              </div>

              {/* Feedback */}
              {selectedSession.feedback && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Feedback
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">
                        {'★'.repeat(selectedSession.feedback.rating)}
                        {'☆'.repeat(5 - selectedSession.feedback.rating)}
                      </span>
                      <span className="text-white">{selectedSession.feedback.rating}/5</span>
                    </div>
                    <p className="text-gray-300">{selectedSession.feedback.comment}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                {selectedSession.status === 'pending' && (
                  <button
                    onClick={() => {
                      cancelSession(selectedSession._id)
                      setShowSessionModal(false)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Cancel Session
                  </button>
                )}
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
