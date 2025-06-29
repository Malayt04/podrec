"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, FileAudio, Calendar, Clock } from "lucide-react"
import { NotificationToast } from "@/components/ui/notification-toast"

interface Recording {
  id: string
  participantName: string
  fileName: string
  fileSize: number
  downloadUrl: string
  createdAt: string
}

interface SessionDetails {
  id: string
  title: string
  createdAt: string
  recordings: Recording[]
}

export default function RecordingsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { isAuthenticated } = useAuthStore()
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    fetchRecordings()
  }, [isAuthenticated, sessionId, router])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      // Mock API call - replace with actual API
      const mockSession: SessionDetails = {
        id: sessionId,
        title: "Sample Podcast Recording",
        createdAt: new Date().toISOString(),
        recordings: [
          {
            id: "1",
            participantName: "Host",
            fileName: "host-audio-track.wav",
            fileSize: 45600000, // ~45MB
            downloadUrl: "#",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            participantName: "Guest 1",
            fileName: "guest1-audio-track.wav",
            fileSize: 42300000, // ~42MB
            downloadUrl: "#",
            createdAt: new Date().toISOString(),
          },
        ],
      }
      setSession(mockSession)
    } catch (error) {
      console.error("Failed to fetch recordings:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleDownload = (recording: Recording) => {
    // In a real app, this would use the pre-signed S3 URL
    const link = document.createElement("a")
    link.href = recording.downloadUrl
    link.download = recording.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading recordings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-foreground">Session Recordings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {session && (
          <div className="space-y-8">
            {/* Session Info */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{session.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(session.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Recordings List */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Available Recordings</h2>

              {session.recordings.length === 0 ? (
                <Card className="bg-card/50 border-border">
                  <CardContent className="py-12 text-center">
                    <FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recordings available yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recordings will appear here once processing is complete
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {session.recordings.map((recording) => (
                    <Card key={recording.id} className="bg-card/50 border-border hover:bg-card/70 transition-colors">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg flex items-center">
                          <FileAudio className="h-5 w-5 mr-2 text-primary" />
                          {recording.participantName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p className="font-mono">{recording.fileName}</p>
                          <p>{formatFileSize(recording.fileSize)}</p>
                        </div>
                        <Button
                          onClick={() => handleDownload(recording)}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <NotificationToast />
    </div>
  )
}
