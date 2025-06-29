import { create } from "zustand"

interface Session {
  id: string
  title: string
  createdAt: string
  participantCount?: number
}

interface SessionState {
  sessions: Session[]
  currentSession: Session | null
  isLoading: boolean
  createSession: (title: string) => Promise<Session>
  fetchSessions: () => Promise<void>
  setCurrentSession: (session: Session) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,

  createSession: async (title: string) => {
    set({ isLoading: true })
    try {
      // Mock API call - replace with actual API
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      // Mock successful creation
      const newSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        createdAt: new Date().toISOString(),
        participantCount: 0,
      }

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        isLoading: false,
      }))

      return newSession
    } catch (error) {
      // For demo purposes, create mock session
      const newSession: Session = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        createdAt: new Date().toISOString(),
        participantCount: 0,
      }

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        isLoading: false,
      }))

      return newSession
    }
  },

  fetchSessions: async () => {
    set({ isLoading: true })
    try {
      // Mock API call - replace with actual API
      const response = await fetch("/api/sessions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch sessions")
      }

      // Mock sessions data
      const mockSessions: Session[] = [
        {
          id: "1",
          title: "Weekly Podcast Episode #42",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          participantCount: 3,
        },
        {
          id: "2",
          title: "Interview with Tech Expert",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          participantCount: 2,
        },
      ]

      set({ sessions: mockSessions, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  setCurrentSession: (session: Session) => {
    set({ currentSession: session })
  },
}))
