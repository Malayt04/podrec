import { create } from "zustand";
import { useAuthStore } from "./auth-store";

interface Session {
  id: string;
  title: string;
  createdAt: string;
  participantCount?: number;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  createSession: (title: string) => Promise<Session>;
  fetchSessions: () => Promise<void>;
  setCurrentSession: (session: Session) => void;
}

const API_URL = "http://localhost:8080/api";

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,

  createSession: async (title: string) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const sessionId = await response.json();
      
      const newSession: Session = {
        id: sessionId,
        title,
        createdAt: new Date().toISOString(),
        participantCount: 1,
      };

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        isLoading: false,
      }));

      return newSession;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true });
    // This is a placeholder as we don't have a GET /api/sessions endpoint yet.
    // In a real app, this would fetch the user's sessions from the backend.
    set({ sessions: [], isLoading: false });
  },

  setCurrentSession: (session: Session) => {
    set({ currentSession: session });
  },
}));