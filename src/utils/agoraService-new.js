import AgoraRTC from 'agora-rtc-sdk-ng'

// Agora configuration
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "YOUR_AGORA_APP_ID"

console.log('Agora App ID:', AGORA_APP_ID)

class AgoraService {
  constructor() {
    this.client = null
    this.localVideoTrack = null
    this.localAudioTrack = null
    this.remoteUsers = new Map()
    this.isJoined = false
  }

  async initializeClient() {
    try {
      console.log('Initializing Agora client...')
      
      // Check if App ID is configured
      if (!AGORA_APP_ID || AGORA_APP_ID === "YOUR_AGORA_APP_ID") {
        throw new Error('Agora App ID is not configured. Please set VITE_AGORA_APP_ID in your .env file')
      }

      this.client = AgoraRTC.createClient({ 
        mode: "rtc", 
        codec: "vp8" 
      })

      // Set up event listeners
      this.client.on("user-published", this.handleUserPublished.bind(this))
      this.client.on("user-unpublished", this.handleUserUnpublished.bind(this))
      this.client.on("user-joined", this.handleUserJoined.bind(this))
      this.client.on("user-left", this.handleUserLeft.bind(this))

      console.log("✅ Agora client initialized successfully")
      return true
    } catch (error) {
      console.error("❌ Error initializing Agora client:", error)
      return false
    }
  }

  async joinChannel(channelName, uid = null, token = null) {
    try {
      console.log('Joining Agora channel:', channelName, 'with UID:', uid)
      
      if (!this.client) {
        const success = await this.initializeClient()
        if (!success) {
          throw new Error('Failed to initialize Agora client')
        }
      }

      // Join the channel
      console.log('Joining channel with App ID:', AGORA_APP_ID)
      await this.client.join(AGORA_APP_ID, channelName, token, uid)
      console.log('✅ Successfully joined Agora channel')
      
      // Create local tracks with error handling
      console.log('Creating local audio track...')
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: "music_standard"
      })
      console.log('✅ Audio track created')

      console.log('Creating local video track...')
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: "720p_1"
      })
      console.log('✅ Video track created')

      // Publish local tracks
      console.log('Publishing local tracks...')
      await this.client.publish([this.localAudioTrack, this.localVideoTrack])
      console.log('✅ Local tracks published successfully')

      this.isJoined = true
      console.log("✅ Successfully joined channel:", channelName)
      
      return {
        localVideoTrack: this.localVideoTrack,
        localAudioTrack: this.localAudioTrack
      }
    } catch (error) {
      console.error("❌ Error joining channel:", error)
      
      // Clean up on error
      if (this.localVideoTrack) {
        this.localVideoTrack.close()
        this.localVideoTrack = null
      }
      if (this.localAudioTrack) {
        this.localAudioTrack.close()
        this.localAudioTrack = null
      }
      
      throw error
    }
  }

  async leaveChannel() {
    try {
      console.log('Leaving Agora channel...')
      
      // Stop local tracks
      if (this.localVideoTrack) {
        this.localVideoTrack.stop()
        this.localVideoTrack.close()
        this.localVideoTrack = null
      }

      if (this.localAudioTrack) {
        this.localAudioTrack.stop()
        this.localAudioTrack.close()
        this.localAudioTrack = null
      }

      // Leave the channel
      if (this.client && this.isJoined) {
        await this.client.leave()
        this.isJoined = false
      }

      // Clear remote users
      this.remoteUsers.clear()

      console.log("✅ Successfully left channel")
    } catch (error) {
      console.error("❌ Error leaving channel:", error)
    }
  }

  async toggleMute() {
    try {
      if (this.localAudioTrack) {
        await this.localAudioTrack.setMuted(!this.localAudioTrack.muted)
        return this.localAudioTrack.muted
      }
      return false
    } catch (error) {
      console.error("Error toggling mute:", error)
      return false
    }
  }

  async toggleVideo() {
    try {
      if (this.localVideoTrack) {
        await this.localVideoTrack.setMuted(!this.localVideoTrack.muted)
        return this.localVideoTrack.muted
      }
      return false
    } catch (error) {
      console.error("Error toggling video:", error)
      return false
    }
  }

  playLocalVideo(elementId) {
    try {
      if (this.localVideoTrack) {
        this.localVideoTrack.play(elementId)
        console.log('✅ Local video playing in element:', elementId)
      }
    } catch (error) {
      console.error("Error playing local video:", error)
    }
  }

  playRemoteVideo(user, elementId) {
    try {
      if (user.videoTrack) {
        user.videoTrack.play(elementId)
        console.log('✅ Remote video playing in element:', elementId)
      }
    } catch (error) {
      console.error("Error playing remote video:", error)
    }
  }

  // Event handlers
  handleUserPublished(user, mediaType) {
    console.log("User published:", user.uid, mediaType)
    
    // Subscribe to the remote user
    this.client.subscribe(user, mediaType).then(() => {
      if (mediaType === "video") {
        // Store the remote user
        this.remoteUsers.set(user.uid, user)
        
        // Trigger callback for UI update
        if (this.onRemoteUserPublished) {
          this.onRemoteUserPublished(user, mediaType)
        }
      }
      
      if (mediaType === "audio") {
        // Play remote audio
        user.audioTrack?.play()
      }
    }).catch(console.error)
  }

  handleUserUnpublished(user, mediaType) {
    console.log("User unpublished:", user.uid, mediaType)
    
    if (mediaType === "video") {
      this.remoteUsers.delete(user.uid)
      
      // Trigger callback for UI update
      if (this.onRemoteUserUnpublished) {
        this.onRemoteUserUnpublished(user, mediaType)
      }
    }
  }

  handleUserJoined(user) {
    console.log("User joined:", user.uid)
  }

  handleUserLeft(user) {
    console.log("User left:", user.uid)
    this.remoteUsers.delete(user.uid)
    
    // Trigger callback for UI update
    if (this.onRemoteUserLeft) {
      this.onRemoteUserLeft(user)
    }
  }

  // Set callback functions
  setCallbacks({ onRemoteUserPublished, onRemoteUserUnpublished, onRemoteUserLeft }) {
    this.onRemoteUserPublished = onRemoteUserPublished
    this.onRemoteUserUnpublished = onRemoteUserUnpublished
    this.onRemoteUserLeft = onRemoteUserLeft
  }

  getRemoteUsers() {
    return Array.from(this.remoteUsers.values())
  }
}

// Export singleton instance
export default new AgoraService()
