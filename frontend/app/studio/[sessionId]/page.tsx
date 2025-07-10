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
import { Copy, Settings, Users } from "lucide-react";
import { Lobby } from "@/components/studio/lobby";
import { useToast } from "@/components/ui/use-toast";

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { toast } = useToast();
  const {
    isConnected,
    participants,
    isRecording,
    connectToSession,
    disconnect,
  } = useStudioStore();

  const [step, setStep] = useState<'lobby' | 'session'>('lobby');
  const [isJoining, setIsJoining] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  // Ensure disconnection on component unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Handler for joining the session from the lobby
  const handleJoinSession = async (displayName: string) => {
    setIsJoining(true);
    await connectToSession(sessionId, displayName);
    setIsJoining(false);
    setStep('session');
  };

  // Handler for ending the session
  const handleEndSession = () => {
    disconnect();
    router.push('/dashboard');
  };

  // Handler for copying the share link
  const handleShareLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Session link has been copied to your clipboard.",
    });
  };

  // Render the Lobby component first
  if (step === 'lobby') {
    return <Lobby onJoin={handleJoinSession} isJoining={isJoining} />;
  }

  // Render the main studio UI after joining
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Recording Studio</h1>
            {isRecording && (
              <div className="flex items-center space-x-2 text-destructive">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Invite
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowParticipants(!showParticipants)}>
              <Users className="h-4 w-4 mr-2" />
              {participants.length}
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
          <aside className="w-80 border-l border-border bg-card/30 backdrop-blur-sm overflow-y-auto">
            <ParticipantsList />
          </aside>
        )}
      </div>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <RecordingControls onEndSession={handleEndSession} />
      </footer>

      <UploadManager />
      <NotificationToast />
    </div>
  );
}
