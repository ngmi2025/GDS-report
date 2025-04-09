"use client"

import { useState } from "react"
import { DateRange } from "react-day-picker"
import { ContentPerformance } from "@/components/content-performance"
import { Header } from "@/components/header"
import { UnifiedDateSelector } from "@/components/unified-date-selector"
import { Footer } from "@/components/footer"
import { subMonths } from "date-fns"

export default function ContentPerformancePage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 16),
    to: new Date()
  })

  const handleDateChange = (range: DateRange) => {
    if (range.from && range.to) {
      setDateRange(range)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Content Performance</h1>
          <UnifiedDateSelector defaultValue={dateRange} onDateChange={handleDateChange} />
        </div>

        {/* Content Performance Table */}
        <ContentPerformance sheetName="Google Discover Content" />
      </main>
      <Footer />
    </div>
  )
} 