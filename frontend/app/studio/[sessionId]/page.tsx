"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useStudioStore } from "@/lib/stores/studio-store"
import { VideoGrid } from "@/components/studio/video-grid"
import { RecordingControls } from "@/components/studio/recording-controls"
import { ParticipantsList } from "@/components/studio/participants-list"
import { UploadManager } from "@/components/studio/upload-manager"
import { NotificationToast } from "@/components/ui/notification-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Users } from "lucide-react"

export default function StudioPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { isAuthenticated } = useAuthStore()
  const { isConnected, participants, localStream, isRecording, connectToSession, disconnect, initializeMedia } =
    useStudioStore()

  const [showParticipants, setShowParticipants] = useState(false)
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    const initStudio = async () => {
      try {
        await initializeMedia()
        setMediaPermissionGranted(true)
        await connectToSession(sessionId)
      } catch (error) {
        console.error("Failed to initialize studio:", error)
      }
    }

    initStudio()

    return () => {
      disconnect()
    }
  }, [isAuthenticated, sessionId, router, connectToSession, disconnect, initializeMedia])

  if (!isAuthenticated) {
    return null
  }

  if (!mediaPermissionGranted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Settings className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Setting up your studio...</h2>
          <p className="text-muted-foreground">
            Please allow camera and microphone access to join the recording session.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold text-foreground">Recording Studio</h1>
            {isRecording && (
              <div className="flex items-center space-x-2 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              {participants.length} Participants
            </Button>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-6">
          <VideoGrid />
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm">
            <ParticipantsList />
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <RecordingControls />
      </div>

      {/* Background Components */}
      <UploadManager />
      <NotificationToast />
    </div>
  )
}
