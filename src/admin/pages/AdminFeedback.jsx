import { useState, useEffect } from 'react'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [ratingFilter, setRatingFilter] = useState('')
  const [moderationModal, setModerationModal] = useState(null)

  useEffect(() => {
    fetchFeedback()
  }, [pagination.page, ratingFilter])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(ratingFilter && { rating: ratingFilter })
      })
      
      const { data } = await http.get(`/admin/feedback?${params}`)
      
      if (data.success) {
        setFeedback(data.feedback)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  const moderateFeedback = async (feedbackId, action, reason = '') => {
    try {
      const { data } = await http.put(`/admin/feedback/${feedbackId}/moderate`, {
        action,
        reason
      })
      
      if (data.success) {
        if (action === 'delete') {
          setFeedback(prev => prev.filter(f => f._id !== feedbackId))
        } else {
          setFeedback(prev => prev.map(f => 
            f._id === feedbackId ? { ...f, isHidden: action === 'hide', moderationReason: reason } : f
          ))
        }
        setModerationModal(null)
      }
    } catch (err) {
      console.error('Failed to moderate feedback:', err)
      alert('Failed to moderate feedback. Please try again.')
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'}>
        ⭐
      </span>
    ))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400'
    if (rating >= 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading && feedback.length === 0) {
    return (
      <AdminLayout title="Feedback Moderation">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading feedback...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Feedback Moderation">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rating Filter</label>
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Cards */}
      <div className="space-y-6">
        {feedback.map((item) => (
          <div key={item._id} className={`bg-gray-800/50 rounded-xl p-4 sm:p-6 border ${item.isHidden ? 'border-red-500/50 bg-red-500/10' : 'border-gray-700'}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <div className="flex items-center">
                    {renderStars(item.rating)}
                    <span className={`ml-2 font-semibold ${getRatingColor(item.rating)}`}>
                      {item.rating}/5
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  {item.isHidden && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full w-fit">
                      Hidden
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Mentor</div>
                    <div className="text-white font-medium">{item.mentorId?.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Learner</div>
                    <div className="text-white font-medium">{item.learnerId?.name || 'Anonymous'}</div>
                  </div>
                </div>

                {item.comment && (
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-400 mb-2">Comment</div>
                    <div className="text-white">{item.comment}</div>
                  </div>
                )}

                {item.isHidden && item.moderationReason && (
                  <div className="bg-red-500/20 rounded-lg p-3 mb-4">
                    <div className="text-sm text-red-300 mb-1">Moderation Reason</div>
                    <div className="text-red-200 text-sm">{item.moderationReason}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-4">
                {!item.isHidden ? (
                  <>
                    <button
                      onClick={() => setModerationModal({ feedback: item, action: 'hide' })}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => setModerationModal({ feedback: item, action: 'delete' })}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => moderateFeedback(item._id, 'show')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Show
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-400 text-center sm:text-left">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} feedback
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
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

      {/* Moderation Modal */}
      {moderationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
              {moderationModal.action === 'delete' ? 'Delete Feedback' : 'Hide Feedback'}
            </h3>
            
            <div className="mb-4">
              <div className="text-gray-300 mb-2">
                Are you sure you want to {moderationModal.action} this feedback?
              </div>
              <div className="bg-gray-700/50 rounded p-3">
                <div className="flex items-center mb-2">
                  {renderStars(moderationModal.feedback.rating)}
                  <span className="ml-2 text-yellow-400">{moderationModal.feedback.rating}/5</span>
                </div>
                {moderationModal.feedback.comment && (
                  <div className="text-gray-300 text-sm">{moderationModal.feedback.comment}</div>
                )}
              </div>
            </div>

            {moderationModal.action === 'hide' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for hiding (optional)
                </label>
                <textarea
                  value={moderationModal.reason || ''}
                  onChange={(e) => setModerationModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for moderation..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setModerationModal(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => moderateFeedback(
                  moderationModal.feedback._id, 
                  moderationModal.action, 
                  moderationModal.reason
                )}
                className={`flex-1 px-4 py-2 ${
                  moderationModal.action === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } text-white rounded-lg transition-colors`}
              >
                {moderationModal.action === 'delete' ? 'Delete' : 'Hide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
