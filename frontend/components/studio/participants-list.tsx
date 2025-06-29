"use client";

import { useStudioStore, Participant } from "@/lib/stores/studio-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, User } from "lucide-react";

const ParticipantItem = ({ participant }: { participant: Participant }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3 overflow-hidden">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-foreground truncate">{participant.name}</span>
      </div>
      <div>
        {participant.audioEnabled ? (
          <Mic className="h-4 w-4 text-green-400" />
        ) : (
          <MicOff className="h-4 w-4 text-destructive" />
        )}
      </div>
    </div>
  );
};

export function ParticipantsList() {
  const { participants } = useStudioStore();

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold text-foreground px-3">Participants ({participants.length})</h3>
      {participants.length > 0 ? (
        <div className="space-y-1">
          {participants.map((p) => (
            <ParticipantItem key={p.id} participant={p} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          <User className="h-8 w-8 mx-auto mb-2" />
          <p>No one else is here yet.</p>
        </div>
      )}
    </div>
  );
}
