import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import http from '../lib/http.js'
import Button from '../components/ui/Button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Transcript() {
  const { bookingId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    fetchTranscript()
  }, [bookingId])

  const fetchTranscript = async () => {
    try {
      // Get session details (using booking ID)
      const sessionResponse = await http.get(`/sessions/${bookingId}`)
      setSession(sessionResponse.data.session)

      // Try to get transcript
      try {
        const transcriptResponse = await http.get(`/sessions/${sessionResponse.data.session._id}/transcript`)
        setTranscript(transcriptResponse.data.transcript)
      } catch (transcriptError) {
        // Transcript doesn't exist or not accessible
        console.log('No transcript available for this session:', transcriptError.response?.data?.message || transcriptError.message)
        setTranscript(null)
      }

      // Load existing notes
      setNotes(sessionResponse.data.session.notes || '')
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveNotes = async () => {
    try {
      setSavingNotes(true)
      await http.put(`/sessions/${session._id}/notes`, { notes })
      alert('Notes saved successfully!')
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  const downloadTranscript = () => {
    if (!transcript) return

    const content = [
      `Session Transcript`,
      `Date: ${new Date(session.bookingId.date).toLocaleDateString()}`,
      `Time: ${session.bookingId.time}`,
      `Participants: ${session.mentorId.fullName}, ${session.learnerId.fullName}`,
      `Duration: ${transcript.transcript?.duration ? Math.floor(transcript.transcript.duration / 60) + ' minutes' : 'N/A'}`,
      ``,
      `Transcript:`,
      `${transcript.transcript?.fullText || transcript.content || 'No transcript content available'}`,
      ``,
      `Notes:`,
      `${notes || 'No notes added'}`
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${session.bookingId.date}-${session.mentorId.fullName.replace(/\s+/g, '-')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
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

  const otherUser = session.mentorId._id === user.id 
    ? session.learnerId 
    : session.mentorId

  // Check if current user is the mentor (can edit notes)
  const isMentor = session.mentorId._id === user.id

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Session Transcript</h1>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Session with:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{otherUser.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Date & Time:</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(session.bookingId.date).toLocaleDateString()} at {session.bookingId.time}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Duration:</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {session.duration ? `${session.duration} minutes` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status:</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {session.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Transcript
            </CardTitle>
            {transcript && (
              <Button
                onClick={downloadTranscript}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {transcript ? (
            <div className="prose max-w-none dark:prose-invert">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                  {transcript.transcript?.fullText || transcript.content || 'Transcript content will appear here once available.'}
                </pre>
              </div>
              {transcript.metadata?.recordingQuality && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Recording quality: {transcript.metadata.recordingQuality}
                </p>
              )}
              {transcript.transcript?.duration && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Duration: {Math.floor(transcript.transcript.duration / 60)} minutes
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No transcript available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Transcripts are generated during video calls when the transcript feature is used
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Session Notes
            {!isMentor && (
              <span className="text-sm text-gray-500 font-normal">(Read-only)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isMentor ? (
              // Mentor can edit notes
              <>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this session..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="flex items-center gap-2"
                  >
                    {savingNotes ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                        </svg>
                        Save Notes
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              // Learner can only view notes
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                {notes ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                    {notes}
                  </pre>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No notes have been added by the mentor yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => navigate('/messages')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Back to Messages
        </Button>
      </div>
    </div>
  )
}
