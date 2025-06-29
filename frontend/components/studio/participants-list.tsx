"use client"

import { useStudioStore } from "@/lib/stores/studio-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Video, VideoOff, User, Crown } from "lucide-react"

export function ParticipantsList() {
  const { participants } = useStudioStore()

  const allParticipants = [
    {
      id: "local",
      name: "You",
      isLocal: true,
      audioEnabled: true,
      videoEnabled: true,
      isHost: true,
    },
    ...participants,
  ]

  return (
    <Card className="h-full bg-transparent border-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground flex items-center">
          <User className="h-5 w-5 mr-2" />
          Participants ({allParticipants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted/40 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground">{participant.name}</span>
                  {participant.isHost && <Crown className="h-3 w-3 text-yellow-500" />}
                  {participant.isLocal && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {participant.audioEnabled ? (
                <Mic className="h-4 w-4 text-green-500" />
              ) : (
                <MicOff className="h-4 w-4 text-red-500" />
              )}
              {participant.videoEnabled ? (
                <Video className="h-4 w-4 text-green-500" />
              ) : (
                <VideoOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        ))}

        {allParticipants.length === 1 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Waiting for participants to join...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
