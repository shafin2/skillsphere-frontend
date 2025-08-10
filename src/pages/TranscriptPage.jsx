import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../lib/http';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';
import Button from '../components/ui/Button';

export default function TranscriptPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTranscript();
  }, [bookingId]);

  const fetchTranscript = async () => {
    try {
      const { data } = await http.get(`/transcript/booking/${bookingId}`);
      setTranscript(data.transcript);
    } catch (err) {
      console.error('Failed to fetch transcript:', err);
      setError(err.response?.data?.error || 'Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSpeakerName = (speaker) => {
    if (!transcript) return speaker;
    
    switch (speaker) {
      case 'learner':
        return transcript.participants.learner.name;
      case 'mentor':
        return transcript.participants.mentor.name;
      default:
        return 'Unknown Speaker';
    }
  };

  const getSpeakerColor = (speaker) => {
    switch (speaker) {
      case 'learner':
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-600';
      case 'mentor':
        return 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-600';
      default:
        return 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Error Loading Transcript</h1>
            <p className="text-muted mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-sm hover:text-primary">
              ← Back
            </button>
            <div className="h-6 w-px bg-border mx-2" />
            <a href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary" />
              <span className="font-semibold text-lg">SkillSphere</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:bg-background transition-colors text-sm">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isDark ? 'rgb(var(--color-accent))' : 'rgb(var(--color-primary))' }} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {transcript && (
          <>
            {/* Header Info */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Session Transcript</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Session Details */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Session Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted">Date:</span> {' '}
                      {new Date(transcript.metadata.sessionStartTime).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="text-muted">Duration:</span> {' '}
                      {transcript.formattedDuration || '0:00'}
                    </div>
                    <div>
                      <span className="text-muted">Status:</span> {' '}
                      <span className={`capitalize px-2 py-1 rounded text-xs ${
                        transcript.assemblyAI.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        transcript.assemblyAI.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {transcript.assemblyAI.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-surface border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Participants</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <img 
                        src={transcript.participants.learner.userId?.avatar || '/vite.svg'} 
                        alt="Learner"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{transcript.participants.learner.name}</div>
                        <div className="text-xs text-muted">Learner</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <img 
                        src={transcript.participants.mentor.userId?.avatar || '/vite.svg'} 
                        alt="Mentor"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-medium text-sm">{transcript.participants.mentor.name}</div>
                        <div className="text-xs text-muted">Mentor</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {transcript.summary && transcript.summary.keyPoints?.length > 0 && (
                <div className="bg-surface border border-border rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {transcript.summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                  
                  {transcript.summary.topics?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-sm">Topics Discussed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {transcript.summary.topics.slice(0, 8).map((topic, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transcript Content */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Full Transcript</h3>
              
              {transcript.assemblyAI.status !== 'completed' ? (
                <div className="text-center py-8">
                  <div className="text-muted mb-2">
                    {transcript.assemblyAI.status === 'processing' ? 'Transcript is being generated...' : 'Transcript not available'}
                  </div>
                  {transcript.assemblyAI.status === 'processing' && (
                    <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  )}
                </div>
              ) : transcript.transcript.segments.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  No transcript segments available
                </div>
              ) : (
                <div className="space-y-4">
                  {transcript.transcript.segments.map((segment, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getSpeakerColor(segment.speaker)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-sm">
                          {getSpeakerName(segment.speaker)}
                        </div>
                        <div className="text-xs text-muted">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </div>
                      </div>
                      <div className="text-sm leading-relaxed">
                        {segment.text}
                      </div>
                      {segment.confidence && (
                        <div className="text-xs text-muted mt-2">
                          Confidence: {Math.round(segment.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
