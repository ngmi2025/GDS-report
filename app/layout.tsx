import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayoutClient } from "@/components/root-layout"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Google Discover Performance Dashboard",
  description: "Track and analyze your Google Discover performance metrics",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    shortcut: ["/icon.png"],
    apple: [
      { url: "/icon.png", type: "image/png", sizes: "180x180" }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
