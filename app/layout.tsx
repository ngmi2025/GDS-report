import { Inter } from "next/font/google"
import "./globals.css"
import { RootLayoutClient } from "@/components/root-layout"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { NextAuthProvider } from "@/components/session-provider"

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

async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextAuthProvider session={session}>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </NextAuthProvider>
      </body>
    </html>
  )
}

export default RootLayout
