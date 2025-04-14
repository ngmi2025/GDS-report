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