"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useSessionStore } from "@/lib/stores/session-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Plus, Video, Calendar, Users, Share2 } from "lucide-react"
import { NotificationToast } from "@/components/ui/notification-toast"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { sessions, createSession, fetchSessions } = useSessionStore()
  const [sessionTitle, setSessionTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    fetchSessions()
  }, [isAuthenticated, router, fetchSessions])

  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) return

    setIsCreating(true)
    try {
      const session = await createSession(sessionTitle.trim())
      setShowCreateModal(false)
      setSessionTitle("")
      router.push(`/studio/${session.id}`)
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleShare = (sessionId: string) => {
    const shareLink = `${window.location.origin}/studio/${sessionId}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link Copied!",
      description: "Session link copied to clipboard.",
    });
  };

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Video className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Podrec</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Create Session Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Your Recording Studio</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create professional-quality podcast recordings with multiple participants. Each person's audio and video
              is recorded locally for the highest quality output.
            </p>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Session
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-md border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Recording Session</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-title" className="text-foreground">
                      Session Title
                    </Label>
                    <Input
                      id="session-title"
                      placeholder="Enter session title..."
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="bg-background border-border text-foreground"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateSession()}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                      className="border-border text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateSession}
                      disabled={!sessionTitle.trim() || isCreating}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isCreating ? "Creating..." : "Create Session"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Sessions List */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Recent Sessions</h3>

            {sessions.length === 0 ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recording sessions yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Create your first session to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="bg-card/50 border-border hover:bg-card/70 transition-colors"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground text-lg">{session.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        {session.participantCount || 0} participants
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <Button
                          size="sm"
                          className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                          variant="outline"
                          onClick={() => router.push(`/studio/${session.id}`)}
                        >
                          Enter Studio
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShare(session.id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <NotificationToast />
    </div>
  )
}