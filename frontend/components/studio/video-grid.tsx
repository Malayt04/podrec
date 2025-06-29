"use client";

import { useStudioStore, Participant } from "@/lib/stores/studio-store";
import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VideoPlayer = ({ participant }: { participant: Participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="relative aspect-video bg-card rounded-lg overflow-hidden shadow-lg border border-border">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={participant.isLocal}
        className="w-full h-full object-cover"
      />
      {/* Name and status overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white truncate">{participant.name}</span>
          <div className="flex items-center space-x-2">
            {participant.audioEnabled ? <Mic className="h-4 w-4 text-green-400" /> : <MicOff className="h-4 w-4 text-destructive" />}
            {participant.videoEnabled ? <Video className="h-4 w-4 text-green-400" /> : <VideoOff className="h-4 w-4 text-destructive" />}
          </div>
        </div>
      </div>
      {/* Placeholder when video is off */}
      {!participant.videoEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-foreground text-3xl font-bold">
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      {/* Loading indicator for remote streams */}
      {!participant.isLocal && !participant.stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin"/>
        </div>
      )}
    </div>
  );
};

export function VideoGrid() {
  const { participants } = useStudioStore();

  const gridLayoutClasses: { [key: number]: string } = {
    1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2",
    5: "grid-cols-3", 6: "grid-cols-3",
  };
  const numParticipants = participants.length;
  const gridLayout = numParticipants > 6 ? `grid-cols-4` : (gridLayoutClasses[numParticipants] || 'grid-cols-1');

  if (numParticipants === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
          <p>Connecting to the studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 w-full h-full", gridLayout)}>
      {participants.map((participant) => (
        <VideoPlayer key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
