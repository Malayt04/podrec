"use client"

import { useEffect } from "react"
import { useStudioStore } from "@/lib/stores/studio-store"
import  useNotificationStore  from "@/lib/stores/notification-store"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

export function UploadManager() {
  const { uploadQueue, uploadProgress } = useStudioStore()
  const { showNotification } = useNotificationStore()

  useEffect(() => {
    // Listen for upload completion events
    const handleUploadComplete = () => {
      showNotification("Upload completed successfully", "success")
    }

    const handleUploadError = () => {
      showNotification("Upload failed. Please try again.", "error")
    }

    // In a real app, these would be WebSocket event listeners
    // window.addEventListener('upload:complete', handleUploadComplete)
    // window.addEventListener('upload:error', handleUploadError)

    return () => {
      // window.removeEventListener('upload:complete', handleUploadComplete)
      // window.removeEventListener('upload:error', handleUploadError)
    }
  }, [showNotification])

  if (uploadQueue.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-6 w-80 z-50">
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-lg">
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Uploading chunks ({uploadQueue.length} remaining)
            </span>
          </div>

          <Progress value={uploadProgress} className="h-2" />

          <div className="space-y-2">
            {uploadQueue.slice(0, 3).map((chunk, index) => (
              <div key={index} className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{chunk.fileName}</span>
                <div className="flex items-center space-x-1">
                  {chunk.status === "uploading" && (
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                  {chunk.status === "completed" && <CheckCircle className="h-3 w-3 text-green-500" />}
                  {chunk.status === "error" && <AlertCircle className="h-3 w-3 text-red-500" />}
                </div>
              </div>
            ))}
            {uploadQueue.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">+{uploadQueue.length - 3} more...</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
