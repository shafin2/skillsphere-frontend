import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../lib/http';
import AgoraRTC from 'agora-rtc-sdk-ng';
import CallRecorder from '../components/CallRecorder';
import FeedbackModal from '../components/FeedbackModal';
import { useAuth } from '../context/AuthContext';

export default function VideoCallPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const [joined, setJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [booking, setBooking] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchBookingDetails = async () => {
      try {
        const { data } = await http.get('/bookings');
        const currentBooking = data.bookings.find(b => b._id === bookingId);
        if (currentBooking) {
          setBooking(currentBooking);
        }
      } catch (error) {
        console.error('Failed to fetch booking details:', error);
      }
    };

    fetchBookingDetails();

    const startCall = async () => {
      if (joined || !active) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Generate Agora token
        const { data } = await http.post('/call/generate-token', { bookingId });

        if (!active) return; // Component unmounted

        // Create Agora client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Set up event listeners
        client.on('user-published', async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
            
            if (mediaType === 'video' && remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
            }
            if (mediaType === 'audio') {
              user.audioTrack.play();
            }

            // Update remote users list
            setRemoteUsers(prev => {
              const existing = prev.find(u => u.uid === user.uid);
              if (!existing) {
                return [...prev, user];
              }
              return prev;
            });
          } catch (err) {
            console.error('Error subscribing to user:', err);
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          console.log('User unpublished:', user.uid, mediaType);
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        client.on('user-left', (user) => {
          console.log('User left:', user.uid);
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        });

        // Join channel
        await client.join(data.appId, data.channelName, data.token, data.uid);

        if (!active) return; // Component unmounted

        // Create local tracks
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = tracks;

        // Play local video
        if (localVideoRef.current) {
          tracks[1].play(localVideoRef.current); // camera track
        }

        // Publish tracks
        await client.publish(tracks);

        setJoined(true);
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to start call:', err);
        setError(err.message || 'Failed to start video call');
        setIsLoading(false);
        
        // Navigate back on error after a short delay
        setTimeout(() => {
          if (active) navigate(-1);
        }, 3000);
      }
    };

    startCall();

    // Cleanup function
    return () => {
      active = false;
      cleanup();
    };
  }, [bookingId, navigate]);

  const cleanup = async () => {
    try {
      // Stop and close local tracks
      if (localTracksRef.current.length > 0) {
        localTracksRef.current.forEach(track => {
          track.stop();
          track.close();
        });
        localTracksRef.current = [];
      }

      // Leave channel and remove listeners
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
    
    setJoined(false);
    setRemoteUsers([]);
  };

  const toggleMic = () => {
    const micTrack = localTracksRef.current[0]; // microphone track
    if (micTrack) {
      const newState = !micTrack.enabled;
      micTrack.setEnabled(newState);
      setMicEnabled(newState);
    }
  };

  const toggleCamera = () => {
    const cameraTrack = localTracksRef.current[1]; // camera track
    if (cameraTrack) {
      const newState = !cameraTrack.enabled;
      cameraTrack.setEnabled(newState);
      setCameraEnabled(newState);
    }
  };

  const leaveCall = async () => {
    try {
      // Mark booking as completed when call ends
      await http.put(`/bookings/${bookingId}/complete`);
    } catch (error) {
      console.error('Error marking booking as completed:', error);
    }

    await cleanup();
    
    // Show feedback modal for learners only
    if (user?.roles?.includes('learner') && booking) {
      setShowFeedbackModal(true);
    } else {
      navigate(-1);
    }
  };

  const handleFeedbackComplete = () => {
    setShowFeedbackModal(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Call Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Video container */}
      <div className="flex flex-1 relative">
        {/* Remote video (main) */}
        <div className="flex-1 relative bg-black">
          <div 
            ref={remoteVideoRef} 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
          {remoteUsers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-4xl mb-2">👤</div>
                <p>Waiting for other participant...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-gray-600">
          <div 
            ref={localVideoRef} 
            className="w-full h-full"
          />
          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800">
              <div className="text-2xl">📷</div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${
            micEnabled 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
          title={micEnabled ? 'Mute' : 'Unmute'}
        >
          {micEnabled ? '🎤' : '🔇'}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${
            cameraEnabled 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
          title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraEnabled ? '📹' : '📷'}
        </button>

        <button
          onClick={leaveCall}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors"
        >
          Leave Call
        </button>
      </div>

      {/* Call info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
        <p className="text-sm">
          Booking ID: {bookingId} | 
          Participants: {remoteUsers.length + 1}
        </p>
      </div>

      {/* Call Recorder */}
      <CallRecorder 
        bookingId={bookingId}
        isCallActive={joined}
        onTranscriptReady={(sessionId) => {
          console.log('Transcript ready for session:', sessionId);
        }}
      />

      {/* Feedback Modal for Learners */}
      {showFeedbackModal && booking && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          bookingId={bookingId}
          mentorName={booking.mentorId?.fullName}
          onSubmitSuccess={handleFeedbackComplete}
        />
      )}
    </div>
  );
}
