"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStudioStore } from "@/lib/stores/studio-store";
import { VideoGrid } from "@/components/studio/video-grid";
import { RecordingControls } from "@/components/studio/recording-controls";
import { ParticipantsList } from "@/components/studio/participants-list";
import { UploadManager } from "@/components/studio/upload-manager";
import { NotificationToast } from "@/components/ui/notification-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw, Settings, Users } from "lucide-react";
import { JoinForm } from "@/components/studio/join-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const {
    isConnected,
    participants,
    isRecording,
    connectToSession,
    disconnect,
    initializeMedia,
    mediaError,
    mediaPermissionGranted,
  } = useStudioStore();

  const [showParticipants, setShowParticipants] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // Disconnect from the session when the component unmounts
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const handleJoin = async (displayName: string) => {
    setIsJoining(true);
    await initializeMedia();
    const state = useStudioStore.getState();

    if (state.mediaPermissionGranted) {
      await connectToSession(sessionId, displayName);
      setHasJoined(true);
    }
    setIsJoining(false);
  };

  if (mediaError && !isJoining) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex flex-col items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-destructive mb-3" />
              Media Device Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{mediaError}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasJoined) {
    return <JoinForm onSubmit={handleJoin} isJoining={isJoining} />;
  }

  if (!mediaPermissionGranted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Settings className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Setting up your studio...</h2>
          <p className="text-muted-foreground">Please allow camera and microphone access to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">Recording Studio</h1>
            {isRecording && (
              <div className="flex items-center space-x-2 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="h-4 w-4 mr-2" />
              {participants.length} Participants
            </Button>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <VideoGrid />
        </div>
        {showParticipants && (
          <div className="w-80 border-l border-border bg-card/30 backdrop-blur-sm overflow-y-auto">
            <ParticipantsList />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm">
        <RecordingControls />
      </div>

      <UploadManager />
      <NotificationToast />
    </div>
  );
}
