import type { Metadata } from "next"
import Dashboard from "@/components/dashboard"

export const metadata: Metadata = {
  title: "Google Discover Performance Dashboard",
  description: "Track and analyze your Google Discover performance metrics",
}

export default function Home() {
  return <Dashboard />
}

