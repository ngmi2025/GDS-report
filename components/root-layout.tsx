"use client"

import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { Toaster } from "sonner"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications"
import { Button } from "@/components/ui/button"
import { RefreshCw, Share2, Mail, Copy } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useEffect } from "react"

const sampleNotifications = [
  {
    id: 'milestone-1',
    type: 'content-milestone',
    title: '🎉 Content Milestone Achieved!',
    message: '"10 Best Credit Cards for Travel" has reached 100,000 visits!',
    timestamp: new Date(),
    read: false,
    data: {
      metric: 100000,
      articleTitle: '10 Best Credit Cards for Travel'
    }
  },
  {
    id: 'ranking-1',
    type: 'content-ranking',
    title: '👑 New #1 Content!',
    message: '"Chase Sapphire Preferred Review" is now the best performing content!',
    timestamp: new Date(),
    read: false,
    data: {
      articleTitle: 'Chase Sapphire Preferred Review',
      rank: 1
    }
  },
  {
    id: 'achievement-1',
    type: 'author-achievement',
    title: '⚡ Viral Content Achievement!',
    message: 'John Smith has achieved an impressive 8.5% CTR!',
    timestamp: new Date(),
    read: false,
    data: {
      authorName: 'John Smith',
      metric: 8.5
    }
  },
  {
    id: 'achievement-2',
    type: 'author-achievement',
    title: '🚀 High Impact Achievement!',
    message: 'Sarah Johnson is averaging 2,500 clicks per article!',
    timestamp: new Date(),
    read: false,
    data: {
      authorName: 'Sarah Johnson',
      metric: 2500
    }
  },
  {
    id: 'achievement-3',
    type: 'author-achievement',
    title: '✍️ Prolific Author Milestone!',
    message: 'Mike Wilson has published 75 articles!',
    timestamp: new Date(),
    read: false,
    data: {
      authorName: 'Mike Wilson',
      metric: 75
    }
  }
];

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Google Discover Performance Dashboard");
    const body = encodeURIComponent(`Check out these Google Discover stats: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    // Get a random notification
    const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
    // Update timestamp to current time
    randomNotification.timestamp = new Date();
    // Add to notifications
    const event = new CustomEvent('addNotification', { detail: randomNotification });
    window.dispatchEvent(event);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-16 py-4 border-b">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                <span className="text-primary">UPGRADED</span>
                <span className="text-orange-500">POINTS</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEmailShare}>
                    <Mail className="mr-2 h-4 w-4" />
                    Share via email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </div>
          <main className="flex-1 px-8 py-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 