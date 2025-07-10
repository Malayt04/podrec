"use client";

import { useEffect, useRef, useState } from "react";
import { useStudioStore } from "@/lib/stores/studio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, MicOff, User, Video, VideoOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LobbyProps {
  onJoin: (displayName: string) => void;
  isJoining: boolean;
}

export function Lobby({ onJoin, isJoining }: LobbyProps) {
  const [displayName, setDisplayName] = useState("");
  const { 
    localStream, 
    initializeMedia,
    mediaError,
    toggleAudio,
    toggleVideo,
  } = useStudioStore(state => ({
      localStream: state.localStream,
      initializeMedia: state.initializeMedia,
      mediaError: state.mediaError,
      toggleAudio: state.toggleAudio,
      toggleVideo: state.toggleVideo,
  }));

  // Get the local participant's state for UI updates
  const localParticipant = useStudioStore(state => state.participants.find(p => p.isLocal));
  const isAudioEnabled = localParticipant?.audioEnabled ?? true;
  const isVideoEnabled = localParticipant?.videoEnabled ?? true;
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize media devices when the lobby is shown
  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);

  // Attach the media stream to the video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim() && !isJoining) {
      onJoin(displayName.trim());
    }
  };

  // Handle cases where media devices can't be accessed
  if (mediaError) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex flex-col items-center justify-center">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
                        Media Device Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{mediaError}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center">Ready to join?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video bg-card rounded-lg overflow-hidden relative border border-border">
            {localStream ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            )}
            {!isVideoEnabled && (
                <div className="absolute inset-0 bg-card flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-foreground text-3xl font-bold">
                        <User className="h-12 w-12"/>
                    </div>
                </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Button variant="outline" size="icon" onClick={toggleAudio} className={cn(!isAudioEnabled && "bg-destructive text-destructive-foreground")}>
                {isAudioEnabled ? <Mic className="h-5 w-5"/> : <MicOff className="h-5 w-5"/>}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleVideo} className={cn(!isVideoEnabled && "bg-destructive text-destructive-foreground")}>
                {isVideoEnabled ? <Video className="h-5 w-5"/> : <VideoOff className="h-5 w-5"/>}
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isJoining}
            />
            <Button type="submit" className="w-full" disabled={isJoining || !displayName.trim() || !localStream}>
              {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isJoining ? "Joining..." : "Join Session"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
