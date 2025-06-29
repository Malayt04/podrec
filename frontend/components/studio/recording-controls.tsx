"use client"

import { useState } from "react"
import { useStudioStore } from "@/lib/stores/studio-store"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Square, Circle, Settings, Monitor } from "lucide-react"

export function RecordingControls() {
  const {
    isRecording,
    audioEnabled,
    videoEnabled,
    startRecording,
    stopRecording,
    toggleAudio,
    toggleVideo,
    recordingDuration,
  } = useStudioStore()

  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center space-x-3">
          <Button
            variant={audioEnabled ? "default" : "destructive"}
            size="sm"
            onClick={toggleAudio}
            className={audioEnabled ? "bg-muted hover:bg-muted/80 text-foreground" : ""}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            variant={videoEnabled ? "default" : "destructive"}
            size="sm"
            onClick={toggleVideo}
            className={videoEnabled ? "bg-muted hover:bg-muted/80 text-foreground" : ""}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Recording Control */}
        <div className="flex items-center space-x-4">
          {isRecording && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="font-mono">{formatDuration(recordingDuration)}</span>
            </div>
          )}

          <Button
            onClick={handleRecordingToggle}
            size="lg"
            className={
              isRecording
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8"
                : "bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            }
          >
            {isRecording ? (
              <>
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Circle className="h-5 w-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
