import { useState, useEffect } from 'react'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminMentors() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchPendingMentors()
  }, [])

  const fetchPendingMentors = async () => {
    try {
      console.log('[AdminMentors] Fetching pending mentors...')
      const { data } = await http.get('/admin/mentors/pending')
      console.log('[AdminMentors] Pending mentors response:', data)
      
      // Handle different response structures
      const mentors = data.mentors || data || []
      console.log('[AdminMentors] Extracted mentors:', mentors)
      
      setMentors(mentors)
    } catch (err) {
      console.error('[AdminMentors] Failed to fetch pending mentors:', err)
      console.error('[AdminMentors] Error details:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (mentorId) => {
    if (!confirm('Are you sure you want to approve this mentor application?')) return
    
    // Ensure we have a valid mentor ID
    if (!mentorId || mentorId === 'undefined') {
      alert('Error: Invalid mentor ID. Please refresh the page and try again.')
      return
    }
    
    setActionLoading(mentorId)
    try {
      console.log('[AdminMentors] Approving mentor:', mentorId)
      const response = await http.post(`/admin/mentors/${mentorId}/approve`)
      console.log('[AdminMentors] Approve response:', response.data)
      
      setMentors(prev => prev.filter(m => (m.id || m._id) !== mentorId))
      alert('Mentor approved successfully!')
    } catch (err) {
      console.error('[AdminMentors] Failed to approve mentor:', err)
      console.error('[AdminMentors] Error details:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to approve mentor. Please try again.'
      
      alert(`Failed to approve mentor: ${errorMessage}`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (mentorId) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    if (reason === null) return // User cancelled
    
    // Ensure we have a valid mentor ID
    if (!mentorId || mentorId === 'undefined') {
      alert('Error: Invalid mentor ID. Please refresh the page and try again.')
      return
    }
    
    setActionLoading(mentorId)
    try {
      console.log('[AdminMentors] Rejecting mentor:', mentorId, 'with reason:', reason)
      const response = await http.post(`/admin/mentors/${mentorId}/reject`, { reason })
      console.log('[AdminMentors] Reject response:', response.data)
      
      setMentors(prev => prev.filter(m => (m.id || m._id) !== mentorId))
      alert('Mentor rejected successfully!')
    } catch (err) {
      console.error('[AdminMentors] Failed to reject mentor:', err)
      console.error('[AdminMentors] Error details:', err.response?.data)
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to reject mentor. Please try again.'
      
      alert(`Failed to reject mentor: ${errorMessage}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Mentor Applications">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading mentor applications...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Mentor Applications">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Pending Mentor Applications</h2>
        <p className="text-gray-400 mt-2">
          {mentors.length} application{mentors.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {mentors.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
          <div className="text-gray-400 text-lg">No pending mentor applications</div>
          <p className="text-gray-500 mt-2">All applications have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mentors.map((mentor) => {
            const mentorId = mentor.id || mentor._id
            console.log('[AdminMentors] Rendering mentor:', { 
              name: mentor.name, 
              id: mentor.id, 
              _id: mentor._id, 
              mentorId: mentorId 
            })
            
            return (
              <div key={mentorId} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mentor Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{mentor.name}</h3>
                        <p className="text-gray-400">{mentor.email}</p>
                        <p className="text-blue-400 font-medium">{mentor.expertise}</p>
                        <p className="text-xs text-gray-500">ID: {mentorId}</p>
                        <p className="text-xs text-gray-500">
                          Raw: id={mentor.id}, _id={mentor._id}
                        </p>
                      </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">
                      Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-300 font-medium">Experience: </span>
                      <span className="text-gray-400">{mentor.experience || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-300 font-medium">Bio: </span>
                      <p className="text-gray-400 mt-1">{mentor.bio || 'No bio provided'}</p>
                    </div>
                    {mentor.linkedinUrl && (
                      <div>
                        <span className="text-gray-300 font-medium">LinkedIn: </span>
                        <a 
                          href={mentor.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-300 font-medium">Applied: </span>
                      <span className="text-gray-400">
                        {new Date(mentor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleApprove(mentorId)}
                      disabled={actionLoading === mentorId}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                    >
                      {actionLoading === mentorId ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(mentorId)}
                      disabled={actionLoading === mentorId}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
                    >
                      {actionLoading === mentorId ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
