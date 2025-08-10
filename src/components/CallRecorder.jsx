import { useState, useRef, useEffect } from 'react';
import http from '../lib/http';

export default function CallRecorder({ bookingId, isCallActive, onTranscriptReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState('idle'); // idle, recording, uploading, processing, completed, error
  const [sessionId, setSessionId] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Initialize recording session when call becomes active
  useEffect(() => {
    if (isCallActive && !sessionId) {
      initializeSession();
    }
  }, [isCallActive, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const initializeSession = async () => {
    try {
      const { data } = await http.post('/transcript/start-session', { bookingId });
      setSessionId(data.sessionId);
      console.log('Transcript session initialized:', data.sessionId);
    } catch (err) {
      console.error('Failed to initialize transcript session:', err);
      setError('Failed to initialize recording session');
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Get user media (audio only for transcription)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000 // Optimal for speech recognition
        }
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setTranscriptStatus('recording');
      setRecordingDuration(0);

      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTranscriptStatus('uploading');
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const uploadAudio = async (audioBlob) => {
    try {
      if (!sessionId) {
        throw new Error('No session ID available');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, `recording_${sessionId}.webm`);

      const { data } = await http.post(`/transcript/upload-audio/${sessionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setTranscriptStatus('processing');
      console.log('Audio uploaded successfully:', data);

      // Poll for completion
      pollTranscriptStatus();

    } catch (err) {
      console.error('Failed to upload audio:', err);
      setError('Failed to upload recording for transcription');
      setTranscriptStatus('error');
    }
  };

  const pollTranscriptStatus = async () => {
    if (!sessionId) return;

    try {
      const { data } = await http.get(`/transcript/status/${sessionId}`);
      
      if (data.status === 'completed') {
        setTranscriptStatus('completed');
        if (onTranscriptReady) {
          onTranscriptReady(sessionId);
        }
      } else if (data.status === 'error') {
        setTranscriptStatus('error');
        setError('Transcription failed');
      } else {
        // Continue polling
        setTimeout(pollTranscriptStatus, 5000); // Poll every 5 seconds
      }
    } catch (err) {
      console.error('Failed to check transcript status:', err);
      setTimeout(pollTranscriptStatus, 10000); // Retry in 10 seconds
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = () => {
    switch (transcriptStatus) {
      case 'idle':
        return 'Ready to record';
      case 'recording':
        return `Recording... ${formatDuration(recordingDuration)}`;
      case 'uploading':
        return 'Uploading recording...';
      case 'processing':
        return 'Generating transcript...';
      case 'completed':
        return 'Transcript ready!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (transcriptStatus) {
      case 'recording':
        return 'text-red-500';
      case 'uploading':
      case 'processing':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  if (!isCallActive) {
    return null; // Don't show recorder if call is not active
  }

  return (
    <div className="absolute bottom-20 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg min-w-64">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">Call Recording</h3>
        {isRecording && (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className={`text-xs ${getStatusColor()}`}>
          {getStatusMessage()}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs mb-2">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {!isRecording && transcriptStatus === 'idle' && (
          <button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
            disabled={!sessionId}
          >
            🎙️ Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
          >
            ⏹️ Stop Recording
          </button>
        )}

        {transcriptStatus === 'completed' && (
          <button
            onClick={() => window.open(`/transcript/${bookingId}`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            📄 View Transcript
          </button>
        )}
      </div>

      {(transcriptStatus === 'uploading' || transcriptStatus === 'processing') && (
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      )}
    </div>
  );
}
