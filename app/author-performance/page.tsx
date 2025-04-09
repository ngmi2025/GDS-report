"use client"

import { AuthorPerformance } from "@/components/author-performance"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AuthorPerformancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Author Performance</h1>
        </div>

        {/* Author Performance Table - pulling directly from the Google Sheet */}
        <AuthorPerformance sheetName="Author Performance" />
      </main>
      <Footer />
    </div>
  )
} 