"use client"

import { useStudioStore } from "@/lib/stores/studio-store"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Disc, Square, PhoneOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RecordingControls({ onEndSession }: { onEndSession: () => void }) {
  const { isRecording, toggleAudio, toggleVideo, participants } = useStudioStore()
  const localParticipant = participants.find(p => p.isLocal);

  if (!localParticipant) return null;

  const handleStartRecording = () => console.log("Start recording...");
  const handleStopRecording = () => console.log("Stop recording...");

  return (
    <TooltipProvider>
      <div className="flex items-center justify-center space-x-4 p-4">
        {/* Media Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              onClick={toggleAudio}
              className={!localParticipant.audioEnabled ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {localParticipant.audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{localParticipant.audioEnabled ? "Mute" : "Unmute"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              onClick={toggleVideo}
              className={!localParticipant.videoEnabled ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {localParticipant.videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{localParticipant.videoEnabled ? "Stop Video" : "Start Video"}</TooltipContent>
        </Tooltip>

        <div className="h-8 w-px bg-border mx-4" />

        {/* Recording Controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            {isRecording ? (
              <Button onClick={handleStopRecording} size="lg" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            ) : (
              <Button onClick={handleStartRecording} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Disc className="h-5 w-5 mr-2 animate-pulse" />
                Start Recording
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>{isRecording ? "End the recording session" : "Begin recording all participants"}</TooltipContent>
        </Tooltip>

        <div className="h-8 w-px bg-border mx-4" />
        
        {/* End Call Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndSession}
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Leave
            </Button>
          </TooltipTrigger>
          <TooltipContent>Leave the session</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
