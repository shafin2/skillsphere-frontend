import AgoraRTC from 'agora-rtc-sdk-ng'

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID
console.log('Using Agora App ID:', AGORA_APP_ID)

let client = null
let localVideoTrack = null
let localAudioTrack = null

const agoraService = {
  async joinChannel(channelName, uid) {
    try {
      console.log('Starting Agora join process...')
      console.log('App ID:', AGORA_APP_ID)
      console.log('Channel:', channelName)
      console.log('UID:', uid)
      
      // Check if App ID is valid
      if (!AGORA_APP_ID || AGORA_APP_ID.length < 10) {
        throw new Error('Invalid Agora App ID. Please check your .env file.')
      }
      
      // Create client
      client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
      console.log('Client created')
      
      // For testing, let's try a simple channel name
      const testChannel = `test_${channelName}`
      console.log('Using test channel:', testChannel)
      
      // Join channel with a simple UID
      const simpleUID = Math.floor(Math.random() * 100000)
      console.log('Using simple UID:', simpleUID)
      
      await client.join(AGORA_APP_ID, testChannel, null, simpleUID)
      console.log('✅ Joined channel successfully')
      
      // Create and publish local tracks
      console.log('Creating audio track...')
      localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      console.log('✅ Audio track created')
      
      console.log('Creating video track...')
      localVideoTrack = await AgoraRTC.createCameraVideoTrack()
      console.log('✅ Video track created')
      
      console.log('Publishing tracks...')
      await client.publish([localAudioTrack, localVideoTrack])
      console.log('✅ Published local tracks')
      
      // Play local video
      localVideoTrack.play('local-video')
      console.log('✅ Local video playing')
      
      // Listen for remote users
      client.on("user-published", async (user, mediaType) => {
        console.log('🎉 Remote user published:', mediaType)
        await client.subscribe(user, mediaType)
        
        if (mediaType === "video") {
          user.videoTrack.play('remote-video')
          console.log('✅ Remote video playing')
        }
        if (mediaType === "audio") {
          user.audioTrack.play()
          console.log('✅ Remote audio playing')
        }
      })
      
    } catch (error) {
      console.error('❌ Error joining channel:', error)
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        name: error.name
      })
      throw error
    }
  },

  async leaveChannel() {
    try {
      if (localVideoTrack) {
        localVideoTrack.stop()
        localVideoTrack.close()
        localVideoTrack = null
      }
      if (localAudioTrack) {
        localAudioTrack.stop() 
        localAudioTrack.close()
        localAudioTrack = null
      }
      if (client) {
        await client.leave()
        client = null
      }
      console.log('✅ Left channel successfully')
    } catch (error) {
      console.error('Error leaving channel:', error)
    }
  },

  async toggleMute() {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!localAudioTrack.muted)
      return localAudioTrack.muted
    }
    return false
  },

  async toggleVideo() {
    if (localVideoTrack) {
      await localVideoTrack.setMuted(!localVideoTrack.muted)
      return localVideoTrack.muted
    }
    return false
  }
}

export default agoraService