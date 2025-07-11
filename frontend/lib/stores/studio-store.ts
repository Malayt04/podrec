"use client";

import { create } from "zustand";
import io, { Socket } from "socket.io-client";
import { addNotification } from "./notification-store";
import { useAuthStore } from "./auth-store";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export interface Participant {
  id: string; // socket.id
  name: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  stream: MediaStream | null;
}

let mediaRecorder: MediaRecorder | null = null;
let chunkCounter = 0;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const uploadChunk = async (chunk: Blob, sessionId: string, participantId: string) => {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.error("No auth token found");
    return;
  }

  const formData = new FormData();
  formData.append("video-chunk", chunk, `chunk-${chunkCounter}.webm`);
  formData.append("participantId", participantId);
  formData.append("chunkNumber", String(chunkCounter));
  // A more accurate duration could be calculated if needed
  formData.append("durationMs", "5000");

  try {
    const response = await fetch(`${API_URL}/sessions/${sessionId}/chunks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Chunk upload failed with status: ${response.status}`);
    }

    console.log(`Chunk ${chunkCounter} uploaded successfully`);
    chunkCounter++;
  } catch (error) {
    console.error("Error uploading chunk:", error);
    // Optionally, implement retry logic or notify the user
  }
};

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
  toggleAudio: () => void;
  toggleVideo: () => void;
  startRecording: (sessionId: string) => void;
  stopRecording: () => void;
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
    if (get().localStream) return;
    set({ mediaError: null });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream, mediaPermissionGranted: true });
      // Create a temporary participant for the lobby preview
      set({
        participants: [{
          id: "local-preview",
          name: "You",
          isLocal: true,
          audioEnabled: true,
          videoEnabled: true,
          stream: stream,
        }],
      });
    } catch (error: any) {
      // ... (error handling remains the same)
      let errorMessage = "Could not access camera/microphone.";
      if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Your camera or microphone is already in use by another application.";
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Permission to use the camera and microphone was denied.";
      }
      set({ mediaError: errorMessage, mediaPermissionGranted: false });
    }
  },

  connectToSession: async (sessionId, displayName) => {
    const { localStream, participants } = get();

    if (!localStream) {
        addNotification({ message: "Cannot connect without access to your camera and microphone.", type: "error" });
        return;
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL)
    set({ socket, isConnected: true });

    const addParticipant = (participant: Participant) => set(state => ({ participants: [...state.participants, participant] }));
    const removeParticipant = (participantId: string) => set(state => ({ participants: state.participants.filter(p => p.id !== participantId) }));
    const updateParticipant = (participantId: string, updates: Partial<Participant>) => set(state => ({
        participants: state.participants.map(p => p.id === participantId ? { ...p, ...updates } : p)
    }));

    const createPeerConnection = (targetSocketId: string): RTCPeerConnection => {
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pc.onicecandidate = (event) => event.candidate && socket.emit("ice-candidate", { target: targetSocketId, candidate: event.candidate });
        pc.ontrack = (event) => updateParticipant(targetSocketId, { stream: event.streams[0] });
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        return pc;
    };
    
    socket.on("connect", () => {
        // Update the temporary local participant with the real socket ID and name
        set(state => ({
            participants: state.participants.map(p => p.id === 'local-preview' ? { ...p, id: socket.id!, name: `${displayName} (You)` } : p)
        }));
        socket.emit("join-room", { roomId: sessionId, displayName });
    });

    socket.on("existing-users", (users: { id: string; name: string }[]) => {
      const pcs: Record<string, RTCPeerConnection> = {};
      users.forEach(user => {
        const pc = createPeerConnection(user.id);
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => socket.emit("offer", { target: user.id, sdp: pc.localDescription }));
        pcs[user.id] = pc;
        addParticipant({ id: user.id, name: user.name, isLocal: false, audioEnabled: true, videoEnabled: true, stream: null });
      });
      set(state => ({ peerConnections: { ...state.peerConnections, ...pcs } }));
    });
    
    // ... (rest of socket event handlers are the same)
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

  toggleAudio: () => {
    const { localStream, participants } = get();
    const localParticipant = participants.find(p => p.isLocal);
    if (localStream && localParticipant) {
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
    const { localStream, participants } = get();
    const localParticipant = participants.find(p => p.isLocal);
    if (localStream && localParticipant) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        set(state => ({
          participants: state.participants.map(p => p.isLocal ? { ...p, videoEnabled: videoTrack.enabled } : p)
        }));
      }
    }
  },
  startRecording: (sessionId: string) => {
    const { localStream, participants } = get();
    const localParticipant = participants.find((p) => p.isLocal);

    if (mediaRecorder || !localStream || !localParticipant) {
      return;
    }

    const options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(localStream, options);
    chunkCounter = 0;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        uploadChunk(event.data, sessionId, localParticipant.id);
      }
    };

    mediaRecorder.start(5000); // 5-second chunks
    set({ isRecording: true });
    addNotification({ message: "Recording started!", type: "info" });
  },

  stopRecording: () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder = null;
      set({ isRecording: false });
      addNotification({ message: "Recording stopped.", type: "info" });
    }
  },
}));