import { create } from "zustand"

interface Participant {
  id: string
  name: string
  stream?: MediaStream
  audioEnabled: boolean
  videoEnabled: boolean
}

interface UploadChunk {
  id: string
  fileName: string
  status: "pending" | "uploading" | "completed" | "error"
  progress: number
}

interface StudioState {
  // Connection state
  isConnected: boolean
  sessionId: string | null

  // Media state
  localStream: MediaStream | null
  audioEnabled: boolean
  videoEnabled: boolean

  // Participants
  participants: Participant[]

  // Recording state
  isRecording: boolean
  recordingDuration: number
  mediaRecorders: MediaRecorder[]

  // Upload state
  uploadQueue: UploadChunk[]
  uploadProgress: number

  // Actions
  connectToSession: (sessionId: string) => Promise<void>
  disconnect: () => void
  initializeMedia: () => Promise<void>
  toggleAudio: () => void
  toggleVideo: () => void
  startRecording: () => void
  stopRecording: () => void
  addParticipant: (participant: Participant) => void
  removeParticipant: (participantId: string) => void
}

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial state
  isConnected: false,
  sessionId: null,
  localStream: null,
  audioEnabled: true,
  videoEnabled: true,
  participants: [],
  isRecording: false,
  recordingDuration: 0,
  mediaRecorders: [],
  uploadQueue: [],
  uploadProgress: 0,

  connectToSession: async (sessionId: string) => {
    try {
      // Mock WebSocket connection - replace with actual Socket.io
      set({ sessionId, isConnected: true })

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log(`Connected to session: ${sessionId}`)
    } catch (error) {
      console.error("Failed to connect to session:", error)
    }
  },

  disconnect: () => {
    const { localStream, mediaRecorders } = get()

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    // Stop all recordings
    mediaRecorders.forEach((recorder) => {
      if (recorder.state !== "inactive") {
        recorder.stop()
      }
    })

    set({
      isConnected: false,
      sessionId: null,
      localStream: null,
      participants: [],
      isRecording: false,
      recordingDuration: 0,
      mediaRecorders: [],
    })
  },

  initializeMedia: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      set({ localStream: stream })
    } catch (error) {
      console.error("Failed to get user media:", error)
      throw error
    }
  },

  toggleAudio: () => {
    const { localStream, audioEnabled } = get()
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled
        set({ audioEnabled: !audioEnabled })
      }
    }
  },

  toggleVideo: () => {
    const { localStream, videoEnabled } = get()
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled
        set({ videoEnabled: !videoEnabled })
      }
    }
  },

  startRecording: () => {
    const { localStream, participants } = get()
    const mediaRecorders: MediaRecorder[] = []

    // Record local stream
    if (localStream) {
      const recorder = new MediaRecorder(localStream, {
        mimeType: "video/webm;codecs=vp9",
      })

      const chunks: Blob[] = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)

          // Add to upload queue
          const chunk: UploadChunk = {
            id: Math.random().toString(36).substr(2, 9),
            fileName: `local-${Date.now()}.webm`,
            status: "pending",
            progress: 0,
          }

          set((state) => ({
            uploadQueue: [...state.uploadQueue, chunk],
          }))

          // Simulate upload
          setTimeout(() => {
            set((state) => ({
              uploadQueue: state.uploadQueue.map((c) =>
                c.id === chunk.id ? { ...c, status: "completed" as const } : c,
              ),
            }))
          }, 2000)
        }
      }

      recorder.start(10000) // 10 second chunks
      mediaRecorders.push(recorder)
    }

    // Start recording timer
    const timer = setInterval(() => {
      set((state) => ({ recordingDuration: state.recordingDuration + 1 }))
    }, 1000)

    set({
      isRecording: true,
      mediaRecorders,
      recordingDuration: 0,
    })

    // Store timer reference for cleanup
    ;(get() as any).recordingTimer = timer
  },

  stopRecording: () => {
    const { mediaRecorders } = get()

    // Stop all recorders
    mediaRecorders.forEach((recorder) => {
      if (recorder.state !== "inactive") {
        recorder.stop()
      }
    })

    // Clear timer
    const timer = (get() as any).recordingTimer
    if (timer) {
      clearInterval(timer)
    }

    set({
      isRecording: false,
      mediaRecorders: [],
      recordingDuration: 0,
    })
  },

  addParticipant: (participant: Participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }))
  },

  removeParticipant: (participantId: string) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    }))
  },
}))
