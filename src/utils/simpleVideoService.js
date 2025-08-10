// Simple WebRTC fallback for video calling
class SimpleVideoService {
  constructor() {
    this.localStream = null
    this.isJoined = false
    this.isMuted = false
    this.isVideoOff = false
  }

  async joinChannel(channelName, uid, token) {
    try {
      console.log('📱 Using fallback video service (simple WebRTC)')
      
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      })

      this.isJoined = true
      console.log('✅ Local media acquired successfully')
      
      return {
        localVideoTrack: this.localStream,
        localAudioTrack: this.localStream
      }
    } catch (error) {
      console.error('❌ Error in fallback video service:', error)
      throw error
    }
  }

  async leaveChannel() {
    try {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop()
        })
        this.localStream = null
      }
      this.isJoined = false
      console.log('✅ Left video call')
    } catch (error) {
      console.error('Error leaving channel:', error)
    }
  }

  async toggleMute() {
    try {
      if (this.localStream) {
        const audioTracks = this.localStream.getAudioTracks()
        audioTracks.forEach(track => {
          track.enabled = !track.enabled
        })
        this.isMuted = !audioTracks[0]?.enabled
        return this.isMuted
      }
      return false
    } catch (error) {
      console.error('Error toggling mute:', error)
      return false
    }
  }

  async toggleVideo() {
    try {
      if (this.localStream) {
        const videoTracks = this.localStream.getVideoTracks()
        videoTracks.forEach(track => {
          track.enabled = !track.enabled
        })
        this.isVideoOff = !videoTracks[0]?.enabled
        return this.isVideoOff
      }
      return false
    } catch (error) {
      console.error('Error toggling video:', error)
      return false
    }
  }

  playLocalVideo(elementId) {
    try {
      const videoElement = document.getElementById(elementId)
      if (videoElement && this.localStream) {
        videoElement.srcObject = this.localStream
        videoElement.muted = true // Prevent feedback
        videoElement.autoplay = true
        videoElement.playsInline = true
        console.log('✅ Local video playing in element:', elementId)
      }
    } catch (error) {
      console.error('Error playing local video:', error)
    }
  }

  setCallbacks() {
    // No-op for simple implementation
  }

  getRemoteUsers() {
    return []
  }
}

export default SimpleVideoService
