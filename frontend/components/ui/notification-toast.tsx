"use client"

import { useEffect } from "react"
import  useNotificationStore  from "@/lib/stores/notification-store"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore()

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoHide) {
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration || 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, removeNotification])

  if (notifications.length === 0) {
    return null
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="bg-card/95 backdrop-blur-md border-border shadow-lg min-w-80 animate-in slide-in-from-right-full"
        >
          <div className="p-4 flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{notification.message}</p>
              {notification.description && (
                <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeNotification(notification.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
