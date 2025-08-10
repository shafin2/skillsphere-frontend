import io from 'socket.io-client'

class VideoCallService {
  constructor() {
    this.socket = null
    this.localStream = null
    this.remoteStream = null
    this.peerConnection = null
    this.roomId = null
    this.isConnected = false
  }

  async initialize(roomId) {
    this.roomId = roomId
    
    // Connect to Socket.IO server
    this.socket = io('http://localhost:5000')
    
    // Setup Socket.IO events
    this.socket.on('user-joined', () => {
      console.log('Other user joined, creating offer')
      this.createOffer()
    })

    this.socket.on('offer', async (data) => {
      console.log('Received offer')
      await this.handleOffer(data.offer)
    })

    this.socket.on('answer', async (data) => {
      console.log('Received answer')
      await this.handleAnswer(data.answer)
    })

    this.socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate')
      await this.handleIceCandidate(data.candidate)
    })

    // Join room
    this.socket.emit('join-room', roomId)
  }

  async setupLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      // Display local video
      const localVideo = document.getElementById('local-video')
      if (localVideo) {
        localVideo.srcObject = this.localStream
        localVideo.muted = true
        localVideo.autoplay = true
        localVideo.playsInline = true
      }

      this.setupPeerConnection()
      return this.localStream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      throw error
    }
  }

  setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })

    // Add local stream to peer connection
    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream)
    })

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote stream')
      this.remoteStream = event.streams[0]
      
      const remoteVideo = document.getElementById('remote-video')
      if (remoteVideo) {
        remoteVideo.srcObject = this.remoteStream
        remoteVideo.autoplay = true
        remoteVideo.playsInline = true
      }

      // Hide waiting message
      const waitingDiv = document.getElementById('waiting-message')
      if (waitingDiv) {
        waitingDiv.style.display = 'none'
      }
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', {
          roomId: this.roomId,
          candidate: event.candidate
        })
      }
    }
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      
      this.socket.emit('offer', {
        roomId: this.roomId,
        offer: offer
      })
    } catch (error) {
      console.error('Error creating offer:', error)
    }
  }

  async handleOffer(offer) {
    try {
      await this.peerConnection.setRemoteDescription(offer)
      
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      
      this.socket.emit('answer', {
        roomId: this.roomId,
        answer: answer
      })
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(answer)
    } catch (error) {
      console.error('Error handling answer:', error)
    }
  }

  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      return !audioTracks[0]?.enabled
    }
    return false
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      return !videoTracks[0]?.enabled
    }
    return false
  }

  disconnect() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
    }
    
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}

export default VideoCallService
