import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Card, CardContent } from '../components/ui/Card.jsx'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState(null)

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await http.get('/sessions/conversations/my')
        setConversations(data.conversations)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        // If sessions endpoint doesn't exist yet, show empty state
        if (error.response?.status === 404) {
          setConversations([])
        }
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleOpenChat = (conversation) => {
    navigate(`/chat/${conversation.chatRoomId}`)
  }

  const handleJoinCall = (conversation) => {
    navigate(`/call/${conversation.sessionId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200'
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">Chat with your {user?.roles?.includes('mentor') ? 'learners' : 'mentors'}</p>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.906-1.451c-.188-.172-.418-.272-.653-.366L6 19l1.453-1.441c-.094-.235-.194-.465-.366-.653A8.955 8.955 0 016 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No conversations yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Conversations will appear here once you have confirmed bookings</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conversation) => (
            <Card key={conversation.sessionId} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-0 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <img 
                        src={conversation.otherUser.avatar || '/vite.svg'} 
                        alt={conversation.otherUser.name} 
                        className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {conversation.otherUser.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {formatDate(conversation.booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatTime(conversation.booking.time)}
                        </span>
                      </div>
                      {conversation.booking.message && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          "{conversation.booking.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(conversation.booking.status)}`}>
                      {conversation.booking.status.charAt(0).toUpperCase() + conversation.booking.status.slice(1)}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenChat(conversation)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Chat
                      </button>
                      
                      {conversation.booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleJoinCall(conversation)}
                          className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Conversations are created automatically when bookings are confirmed
        </p>
      </div>
    </div>
  )
}
