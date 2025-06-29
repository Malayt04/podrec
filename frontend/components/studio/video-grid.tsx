"use client"

import { useStudioStore } from "@/lib/stores/studio-store"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, User } from "lucide-react"
import { useEffect, useRef } from "react"

export function VideoGrid() {
  const { participants, localStream } = useStudioStore()
  const localVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  const allParticipants = [
    {
      id: "local",
      name: "You",
      stream: localStream,
      isLocal: true,
      audioEnabled: true,
      videoEnabled: true,
    },
    ...participants,
  ]

  const getGridCols = (count: number) => {
    if (count <= 1) return "grid-cols-1"
    if (count <= 2) return "grid-cols-1 lg:grid-cols-2"
    if (count <= 4) return "grid-cols-2"
    return "grid-cols-2 lg:grid-cols-3"
  }

  return (
    <div className="h-full flex flex-col">
      <div className={`grid gap-4 h-full ${getGridCols(allParticipants.length)}`}>
        {allParticipants.map((participant) => (
          <VideoTile key={participant.id} participant={participant} isMainView={allParticipants.length === 1} />
        ))}
      </div>
    </div>
  )
}

interface VideoTileProps {
  participant: {
    id: string
    name: string
    stream?: MediaStream
    isLocal?: boolean
    audioEnabled: boolean
    videoEnabled: boolean
  }
  isMainView?: boolean
}

function VideoTile({ participant, isMainView }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream
    }
  }, [participant.stream])

  return (
    <Card className="relative bg-card/50 border-border overflow-hidden group">
      <div className="aspect-video relative">
        {participant.videoEnabled && participant.stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.isLocal}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Participant Info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium text-sm bg-black/40 px-2 py-1 rounded">{participant.name}</span>
            {participant.isLocal && <span className="text-xs text-white/80 bg-primary/80 px-2 py-1 rounded">You</span>}
          </div>

          <div className="flex items-center space-x-1">
            {participant.audioEnabled ? (
              <Mic className="h-4 w-4 text-white" />
            ) : (
              <MicOff className="h-4 w-4 text-red-400" />
            )}
            {participant.videoEnabled ? (
              <Video className="h-4 w-4 text-white" />
            ) : (
              <VideoOff className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
