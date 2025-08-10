import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import agoraService from '../utils/agoraService.js'
import transcriptService from '../utils/transcriptService.js'

export default function Meeting() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isJoined, setIsJoined] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isTranscriptRecording, setIsTranscriptRecording] = useState(false)
  const [transcriptEntries, setTranscriptEntries] = useState([])
  const [showTranscript, setShowTranscript] = useState(false)
  const durationInterval = useRef(null)

  useEffect(() => {
    fetchSession()
    
    return () => {
      agoraService.leaveChannel()
      transcriptService.stopRecording()
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }, [bookingId])

  // Initialize transcript service when session is loaded
  useEffect(() => {
    if (session?._id && transcriptService.isSupported()) {
      transcriptService.init(session._id, handleTranscriptEntry)
    }
  }, [session?._id])

  const fetchSession = async () => {
    try {
      const { data } = await http.get(`/sessions/${bookingId}`)
      setSession(data.session)
      
      // Load existing transcript if available
      if (data.session?._id) {
        await loadTranscript(data.session._id)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCall = async () => {
    try {
      console.log('Attempting to join call...')
      const { data } = await http.post(`/sessions/${session._id}/join`)
      setIsJoined(true)
      setSession(data.session)
      
      // Start duration timer
      startDurationTimer()
      
      // Join Agora channel with better error handling
      console.log('Joining Agora channel with room ID:', data.session.videoRoomId)
      await agoraService.joinChannel(data.session.videoRoomId, user.id)
      console.log('Successfully joined video call!')
      
    } catch (error) {
      console.error('Error joining call:', error)
      
      // Provide specific error messages
      let errorMessage = 'Failed to join call'
      
      if (error.message.includes('App ID')) {
        errorMessage = 'Video service configuration error. Please try again later.'
      } else if (error.message.includes('CAN_NOT_GET_GATEWAY_SERVER')) {
        errorMessage = 'Connection error. Please check your internet connection and try again.'
      } else if (error.message.includes('permission') || error.message.includes('NotAllowedError')) {
        errorMessage = 'Please allow camera and microphone access and try again.'
      }
      
      alert(errorMessage)
      
      // Reset state if failed
      setIsJoined(false)
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
    }
  }

  const handleLeaveCall = async () => {
    try {
      await http.post(`/sessions/${session._id}/leave`)
      
      // Leave Agora channel
      await agoraService.leaveChannel()
      
      // Stop duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error leaving call:', error)
    }
  }

  const startDurationTimer = () => {
    durationInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const toggleMute = async () => {
    try {
      const muted = await agoraService.toggleMute()
      setIsMuted(muted)
    } catch (error) {
      console.error('Error toggling mute:', error)
    }
  }

  const toggleVideo = async () => {
    try {
      const videoOff = await agoraService.toggleVideo()
      setIsVideoOff(videoOff)
    } catch (error) {
      console.error('Error toggling video:', error)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTranscriptEntry = (text) => {
    const entry = {
      timestamp: new Date(),
      speakerName: user.fullName,
      text
    }
    setTranscriptEntries(prev => [...prev, entry])
    transcriptService.addEntry(text)
  }

  const toggleTranscript = async () => {
    if (!transcriptService.isSupported()) {
      alert('Speech recognition is not supported in this browser')
      return
    }

    if (isTranscriptRecording) {
      await transcriptService.stopRecording()
      setIsTranscriptRecording(false)
    } else {
      const started = await transcriptService.startRecording(user.fullName)
      if (started) {
        setIsTranscriptRecording(true)
      } else {
        alert('Failed to start transcript recording')
      }
    }
  }

  const loadTranscript = async (sessionId = session?._id) => {
    if (!sessionId) return
    
    try {
      transcriptService.sessionId = sessionId
      const transcript = await transcriptService.getTranscript()
      if (transcript && transcript.entries) {
        setTranscriptEntries(transcript.entries)
      }
    } catch (error) {
      console.error('Error loading transcript:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-4">Session not found</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const otherUser = user.id === session.mentorId._id 
    ? session.learnerId 
    : session.mentorId

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              Meeting with {otherUser.fullName}
            </h1>
            {isJoined && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>Live • {formatDuration(callDuration)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isJoined && (
              <Button onClick={handleJoinCall} className="bg-green-600 hover:bg-green-700">
                Join Call
              </Button>
            )}
            {isJoined && (
              <Button 
                onClick={handleLeaveCall} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Call
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {!isJoined ? (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  Ready to join the meeting?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <img 
                    src={otherUser.avatar || '/vite.svg'} 
                    alt={otherUser.fullName} 
                    className="h-20 w-20 rounded-full mx-auto mb-4"
                  />
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {otherUser.fullName}
                  </h2>
                  <p className="text-gray-400">
                    Session scheduled for {new Date(session.bookingId.date).toLocaleDateString()} 
                    at {session.bookingId.time}
                  </p>
                </div>
                
                <Button 
                  onClick={handleJoinCall}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className={`grid gap-4 h-[calc(100vh-12rem)] ${showTranscript ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div
                  id="local-video"
                  className={`w-full h-full ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-semibold">
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400">You (Video Off)</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-2 py-1 rounded text-sm">
                  You {isMuted && '(Muted)'}
                </div>
              </div>

              {/* Remote Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div
                  id="remote-video"
                  className="w-full h-full"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-2 py-1 rounded text-sm">
                  {otherUser.fullName}
                </div>
              </div>

              {/* Transcript Panel */}
              {showTranscript && (
                <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Transcript</h3>
                    <button
                      onClick={() => setShowTranscript(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto max-h-96 space-y-2">
                    {transcriptEntries.map((entry, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-blue-400">
                            {entry.speakerName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-200 text-sm">{entry.text}</p>
                      </div>
                    ))}
                    {transcriptEntries.length === 0 && (
                      <p className="text-gray-400 text-center py-8">
                        {isTranscriptRecording ? 'Listening...' : 'No transcript available'}
                      </p>
                    )}
                  </div>

                  {transcriptService.isSupported() && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button
                        onClick={toggleTranscript}
                        className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                          isTranscriptRecording 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isTranscriptRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" />
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </button>

              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-3 rounded-full transition-colors ${
                  showTranscript ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={showTranscript ? 'Hide transcript' : 'Show transcript'}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>

              {transcriptService.isSupported() && (
                <button
                  onClick={toggleTranscript}
                  className={`p-3 rounded-full transition-colors ${
                    isTranscriptRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  title={isTranscriptRecording ? 'Stop transcript recording' : 'Start transcript recording'}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
