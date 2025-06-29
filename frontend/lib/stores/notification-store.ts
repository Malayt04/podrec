"use client";

import { create } from "zustand";

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  duration?: number; // duration in ms
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'> & { id?: string }) => void;
  removeNotification: (id:string) => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = notification.id || `notif_${new Date().getTime()}`;
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    setTimeout(() => {
      get().removeNotification(id);
    }, notification.duration || 5000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

export const addNotification = (notification: Omit<Notification, 'id'> & { id?: string }) => {
  useNotificationStore.getState().addNotification(notification);
};

export default useNotificationStore;
