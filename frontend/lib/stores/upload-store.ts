"use client";

import { create } from "zustand";
import { addNotification } from "./notification-store";

// Defines the structure of a single item in the upload queue.
export interface UploadItem {
  id: string; // A unique ID for the item, e.g., timestamp + filename
  file: File;
  progress: number; // Progress from 0 to 100
  status: "queued" | "uploading" | "completed" | "error";
}

// Defines the state and actions for the upload store.
interface UploadState {
  queue: UploadItem[];
  isUploading: boolean;
  addToQueue: (files: File[]) => void;
  processQueue: () => Promise<void>; // This will simulate the upload process
  updateProgress: (id: string, progress: number) => void;
  setItemStatus: (id: string, status: UploadItem['status']) => void;
  clearCompleted: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  queue: [],
  isUploading: false,
  addToQueue: (files) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: `${file.name}-${new Date().getTime()}`,
      file,
      progress: 0,
      status: "queued",
    }));
    set(state => ({ queue: [...state.queue, ...newItems] }));
    addNotification({ message: `${newItems.length} file(s) added to upload queue.`, type: 'info' });
  },

  // This is a placeholder for the actual upload logic.
  // In a real app, this would make API calls to your backend.
  processQueue: async () => {
    const { queue, setItemStatus, updateProgress } = get();
    const itemsToUpload = queue.filter(item => item.status === 'queued');

    if (itemsToUpload.length === 0) return;

    set({ isUploading: true });

    for (const item of itemsToUpload) {
      setItemStatus(item.id, 'uploading');
      addNotification({ id: `upload-start-${item.id}`, message: `Starting upload for ${item.file.name}`, type: 'info' });

      // --- Simulate upload progress ---
      // Replace this simulation with your actual fetch/axios call to the backend
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          updateProgress(item.id, progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 200);
      });
      // --- End Simulation ---

      setItemStatus(item.id, 'completed');
      addNotification({ id: `upload-complete-${item.id}`, message: `${item.file.name} uploaded successfully!`, type: 'success' });
    }

    set({ isUploading: false });
  },

  updateProgress: (id, progress) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id ? { ...item, progress } : item
      ),
    }));
  },

  setItemStatus: (id, status) => {
    set(state => ({
      queue: state.queue.map(item =>
        item.id === id ? { ...item, status } : item
      ),
    }));
  },

  clearCompleted: () => {
    set(state => ({ queue: state.queue.filter(item => item.status !== 'completed') }));
  },
}));

