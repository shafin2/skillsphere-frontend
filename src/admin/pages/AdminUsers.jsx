import { useState, useEffect } from 'react'
import { Eye, Ban, X, User, Mail, Calendar, Shield } from 'lucide-react'
import http from '../../lib/http.js'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      })
      
      const { data } = await http.get(`/admin/users?${params}`)
      
      if (data.success) {
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const exportUsers = async (format = 'csv') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/export/users?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'users.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to export users:', err)
    }
  }

  const viewUserDetails = async (userId) => {
    try {
      const { data } = await http.get(`/admin/users/${userId}`)
      if (data.success) {
        setSelectedUser(data.user)
        setShowUserModal(true)
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err)
    }
  }

  const suspendUser = async (userId) => {
    const user = users.find(u => u._id === userId)
    const action = (user.isActive !== false) ? 'suspend' : 'activate'
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return
    
    try {
      const { data } = await http.patch(`/admin/users/${userId}/toggle-status`)
      if (data.success) {
        fetchUsers() // Refresh the list
      }
    } catch (err) {
      console.error(`Failed to ${action} user:`, err)
    }
  }

  if (loading && users.length === 0) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading users...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="User Management">
      {/* Filters */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="learner">Learner</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => exportUsers('csv')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-700/30">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span
                          key={role}
                          className={`px-2 py-1 text-xs rounded-full ${
                            role === 'admin' ? 'bg-red-500/20 text-red-300' :
                            role === 'mentor' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full text-center ${
                        user.isEmailVerified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {user.isEmailVerified ? 'Verified' : 'Pending'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full text-center ${
                        (user.isActive !== false) ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {(user.isActive !== false) ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button 
                        onClick={() => viewUserDetails(user._id)}
                        className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button 
                        onClick={() => suspendUser(user._id)}
                        className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1 rounded-lg transition-colors text-xs sm:text-sm ${
                          (user.isActive !== false)
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Ban size={14} />
                        <span className="hidden sm:inline">{(user.isActive !== false) ? 'Suspend' : 'Activate'}</span>
                      </button>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Full Name</label>
                    <p className="text-white font-medium break-words">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white font-medium break-all">{selectedUser.email}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-gray-400 text-sm">User ID</label>
                    <p className="text-white font-medium break-all">{selectedUser._id}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Joined Date</label>
                    <p className="text-white font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Role</label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedUser.roles?.map((role, index) => (
                        <span key={index} className={`inline-block px-2 py-1 rounded-full text-xs ${
                          role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                          role === 'mentor' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedUser.isEmailVerified 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {selectedUser.isEmailVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Approval Status</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        selectedUser.isApproved 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {selectedUser.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Account Active</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (selectedUser.isActive !== false)
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {(selectedUser.isActive !== false) ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              {selectedUser.profile && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Profile Information</h3>
                  <div className="space-y-3">
                    {selectedUser.profile.bio && (
                      <div>
                        <label className="text-gray-400 text-sm">Bio</label>
                        <p className="text-white">{selectedUser.profile.bio}</p>
                      </div>
                    )}
                    {selectedUser.profile.skills && selectedUser.profile.skills.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-sm">Skills</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedUser.profile.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    suspendUser(selectedUser._id)
                    setShowUserModal(false)
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                    (selectedUser.isActive !== false)
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {(selectedUser.isActive !== false) ? 'Suspend User' : 'Activate User'}
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm sm:text-base"
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
