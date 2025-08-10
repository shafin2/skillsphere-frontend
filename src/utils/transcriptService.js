// Simple Speech Recognition Service for Transcripts
class TranscriptService {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.sessionId = null;
    this.onTranscriptEntry = null;
  }

  // Initialize speech recognition
  init(sessionId, onTranscriptEntry) {
    this.sessionId = sessionId;
    this.onTranscriptEntry = onTranscriptEntry;

    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
    } else {
      console.warn('Speech recognition not supported');
      return false;
    }

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && this.onTranscriptEntry) {
        this.onTranscriptEntry(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isRecording) {
        // Restart recognition if it stops unexpectedly
        this.recognition.start();
      }
    };

    return true;
  }

  // Start recording
  async startRecording(speakerName) {
    if (!this.recognition || this.isRecording) return false;

    try {
      // Start backend transcript session
      const response = await fetch(`http://localhost:5000/transcript/${this.sessionId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to start transcript');

      this.isRecording = true;
      this.currentSpeaker = speakerName;
      this.recognition.start();
      
      return true;
    } catch (error) {
      console.error('Failed to start transcript recording:', error);
      return false;
    }
  }

  // Stop recording
  async stopRecording() {
    if (!this.isRecording) return;

    try {
      this.isRecording = false;
      if (this.recognition) {
        this.recognition.stop();
      }

      // Stop backend transcript session
      const response = await fetch(`http://localhost:5000/transcript/${this.sessionId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to stop transcript');
      
      return true;
    } catch (error) {
      console.error('Failed to stop transcript recording:', error);
      return false;
    }
  }

  // Add transcript entry to backend
  async addEntry(text) {
    if (!this.sessionId || !this.currentSpeaker) return;

    try {
      const response = await fetch(`http://localhost:5000/transcript/${this.sessionId}/entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          speakerName: this.currentSpeaker,
          text: text,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to add transcript entry');
      
      return await response.json();
    } catch (error) {
      console.error('Failed to add transcript entry:', error);
    }
  }

  // Get transcript
  async getTranscript() {
    if (!this.sessionId) return null;

    try {
      const response = await fetch(`http://localhost:5000/transcript/${this.sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to get transcript');
      
      const data = await response.json();
      return data.transcript;
    } catch (error) {
      console.error('Failed to get transcript:', error);
      return null;
    }
  }

  // Check if speech recognition is supported
  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
}

export default new TranscriptService();
