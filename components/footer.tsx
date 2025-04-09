"use client"

import { Github, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function Footer() {
  const [timestamp, setTimestamp] = useState<string>("")
  const [year, setYear] = useState<number>(0)

  useEffect(() => {
    const now = new Date()
    setYear(now.getFullYear())
    setTimestamp(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)

    // Update timestamp every minute
    const interval = setInterval(() => {
      const now = new Date()
      setTimestamp(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="text-center text-sm text-muted-foreground md:text-left">
          <div className="flex items-center gap-1">
            <span>© {year || ""} Upgraded Points. All rights reserved.</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Data refreshed: {timestamp}
          </p>
          <div className="flex items-center gap-2">
            <Link href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-4 w-4" />
              <span className="sr-only">Email</span>
            </Link>
            <Link href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

