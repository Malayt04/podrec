import { create } from "zustand"

interface Notification {
  id: string
  message: string
  description?: string
  type: "success" | "error" | "info"
  duration?: number
  autoHide?: boolean
}

interface NotificationState {
  notifications: Notification[]
  showNotification: (message: string, type?: "success" | "error" | "info", options?: Partial<Notification>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  showNotification: (message, type = "info", options = {}) => {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration: 5000,
      autoHide: true,
      ...options,
    }

    set((state) => ({
      notifications: [...state.notifications, notification],
    }))
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },
}))
