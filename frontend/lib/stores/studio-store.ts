"use client";

import { create } from "zustand";
import io, { Socket } from "socket.io-client";
import { addNotification } from "./notification-store";

// Configuration for ICE servers. Using Google's public STUN servers.
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface Participant {
  id: string; // socket.id
  name: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  stream: MediaStream | null;
}

interface StudioState {
  isConnected: boolean;
  isRecording: boolean;
  localStream: MediaStream | null;
  participants: Participant[];
  peerConnections: Record<string, RTCPeerConnection>;
  socket: Socket | null;
  mediaPermissionGranted: boolean;
  mediaError: string | null;

  initializeMedia: () => Promise<void>;
  connectToSession: (sessionId: string, displayName: string) => Promise<void>;
  disconnect: () => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  isConnected: false,
  isRecording: false,
  localStream: null,
  participants: [],
  peerConnections: {},
  socket: null,
  mediaPermissionGranted: false,
  mediaError: null,

  initializeMedia: async () => {
    set({ mediaError: null });
    try {
      if (get().localStream) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream, mediaPermissionGranted: true });
    } catch (error: any) {
      console.error("Error accessing media devices.", error);
      let errorMessage = "Could not access camera/microphone. Please grant permission and ensure they are not in use.";
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Your camera or microphone is already in use by another browser or application.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No camera or microphone found.";
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Permission to use the camera and microphone was denied. Please update your browser settings.";
      }
      set({ mediaError: errorMessage, mediaPermissionGranted: false });
    }
  },

  connectToSession: async (sessionId, displayName) => {
    const { localStream, addParticipant, removeParticipant, updateParticipant } = get();

    if (!localStream) {
      addNotification({ id: "stream-error", message: "Cannot connect without camera/mic access.", type: "error" });
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080");
    set({ socket, isConnected: true });

    const createPeerConnection = (targetSocketId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { target: targetSocketId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        updateParticipant(targetSocketId, { stream: event.streams[0] });
      };
      
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      return pc;
    };

    socket.on("connect", () => {
      const localParticipant: Participant = {
        id: socket.id!,
        name: `${displayName} (You)`,
        isLocal: true,
        audioEnabled: true,
        videoEnabled: true,
        stream: localStream,
      };
      set({ participants: [localParticipant] });
      socket.emit("join-room", { roomId: sessionId, displayName });
    });

    socket.on("existing-users", (users: { id: string; name: string }[]) => {
      const pcs: Record<string, RTCPeerConnection> = {};
      users.forEach(user => {
        const pc = createPeerConnection(user.id);
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .then(() => socket.emit("offer", { target: user.id, sdp: pc.localDescription }))
          .catch(e => console.error("Error creating offer:", e));
        
        pcs[user.id] = pc;
        addParticipant({ id: user.id, name: user.name, isLocal: false, audioEnabled: true, videoEnabled: true, stream: null });
      });
      set(state => ({ peerConnections: { ...state.peerConnections, ...pcs } }));
    });

    socket.on("user-joined", ({ id, name }: { id: string; name: string }) => {
      addNotification({ id: `join-${id}`, message: `${name} has joined the session.`, type: "info" });
      addParticipant({ id, name, isLocal: false, audioEnabled: true, videoEnabled: true, stream: null });
    });
    
    socket.on("offer", ({ sdp, sender }: { sdp: RTCSessionDescriptionInit, sender: string }) => {
      const pc = createPeerConnection(sender);
      pc.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => pc.createAnswer())
        .then(answer => pc.setLocalDescription(answer))
        .then(() => socket.emit("answer", { target: sender, sdp: pc.localDescription }))
        .catch(e => console.error("Error handling offer:", e));

      set(state => ({ peerConnections: { ...state.peerConnections, [sender]: pc } }));
    });

    socket.on("answer", ({ sdp, sender }: { sdp: RTCSessionDescriptionInit, sender: string }) => {
      const pc = get().peerConnections[sender];
      if(pc) {
          pc.setRemoteDescription(new RTCSessionDescription(sdp)).catch(e => console.error("Error setting answer:", e));
      }
    });

    socket.on("ice-candidate", ({ candidate, sender }: { candidate: RTCIceCandidateInit, sender: string }) => {
      const pc = get().peerConnections[sender];
      if (pc) {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
      }
    });

    socket.on("user-left", (socketId: string) => {
      const { peerConnections } = get();
      if(peerConnections[socketId]) {
          peerConnections[socketId].close();
          delete peerConnections[socketId];
          set({ peerConnections });
      }
      removeParticipant(socketId);
    });

    socket.on("disconnect", () => get().disconnect());
  },

  disconnect: () => {
    const { socket, localStream, peerConnections } = get();
    if (socket) socket.disconnect();
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    Object.values(peerConnections).forEach(pc => pc.close());
    set({
      isConnected: false,
      socket: null,
      participants: [],
      localStream: null,
      peerConnections: {},
      mediaPermissionGranted: false,
      mediaError: null,
    });
  },

  addParticipant: (participant) => set(state => ({ participants: [...state.participants, participant] })),
  removeParticipant: (participantId) => set(state => ({ participants: state.participants.filter(p => p.id !== participantId) })),
  updateParticipant: (participantId, updates) => set(state => ({
    participants: state.participants.map(p => p.id === participantId ? { ...p, ...updates } : p)
  })),

  toggleAudio: () => {
    const { localStream } = get();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        set(state => ({
          participants: state.participants.map(p => p.isLocal ? { ...p, audioEnabled: audioTrack.enabled } : p)
        }));
      }
    }
  },

  toggleVideo: () => {
    const { localStream } = get();
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        set(state => ({
          participants: state.participants.map(p => p.isLocal ? { ...p, videoEnabled: videoTrack.enabled } : p)
        }));
      }
    }
  },
}));
