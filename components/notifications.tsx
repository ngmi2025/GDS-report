"use client"

import React, { useEffect } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export interface Notification {
  id: string
  type: 'content-milestone' | 'content-ranking' | 'author-achievement' | 'content-health'
  title: string
  message: string
  timestamp: Date
  read: boolean
  data: {
    metric?: number
    articleTitle?: string
    authorName?: string
    rank?: number
    url?: string
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      setNotifications(prev => [event.detail, ...prev])
    }

    window.addEventListener('addNotification', handleNewNotification as EventListener)
    
    return () => {
      window.removeEventListener('addNotification', handleNewNotification as EventListener)
    }
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h4 className="font-medium">Notifications</h4>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className={`${notifications.length > 3 ? 'h-[300px]' : 'max-h-fit'}`}>
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-[60px] text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-2 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => {
                  setNotifications(prev =>
                    prev.map(n =>
                      n.id === notification.id ? { ...n, read: true } : n
                    )
                  )
                }}
              >
                <div>
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-muted-foreground">{notification.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.timestamp).toLocaleDateString()} {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 