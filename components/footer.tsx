import { Github, Mail } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
        <div className="text-center text-sm text-muted-foreground md:text-left">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Upgraded Points. All rights reserved.</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Data refreshed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
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

