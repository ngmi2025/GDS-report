"use client"

import { useState } from "react"
import { ContentPerformance } from "@/components/content-performance"
import { AuthorPerformance } from "@/components/author-performance"
import { KpiCards } from "@/components/kpi-cards"
import { TrendsChart } from "@/components/trends-chart"
import { UnifiedDateSelector } from "@/components/unified-date-selector"
import { Footer } from "@/components/footer"
import { subMonths } from "date-fns"
import { DateRange } from "react-day-picker"
import { useSheetData } from "@/lib/hooks/useSheetData"
import { useNotifications } from "@/lib/hooks/useNotifications"

export default function DashboardPage() {
  const { data: contentData } = useSheetData("Google Discover All Time")
  const { data: authorData } = useSheetData("All Time Author Leaderboard Discover")

  // Initialize with definite dates
  const defaultDateRange = {
    from: subMonths(new Date(), 16),
    to: new Date()
  }
  
  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  const handleDateChange = (range: DateRange) => {
    // Only update if both dates are defined
    if (range.from && range.to) {
      setDateRange(range)
    }
  }

  // Ensure we always pass a valid date range to components
  const validDateRange = {
    from: dateRange.from || defaultDateRange.from,
    to: dateRange.to || defaultDateRange.to
  }

  // Initialize notifications with content and author data
  useNotifications(
    contentData?.map(item => ({
      title: item.title,
      clicks: parseInt(item.clicks),
      author: item.author
    })) || [],
    authorData?.map(author => ({
      name: author.author,
      totalArticles: parseInt(author.totalArticles),
      averageCTR: parseFloat(author.averageCTR),
      avgClicksPerArticle: parseFloat(author.avgClicksPerArticle)
    })) || []
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Google Discover Performance Dashboard</h1>
        <UnifiedDateSelector defaultValue={dateRange} onDateChange={handleDateChange} />
      </div>

      {/* KPI Cards */}
      <KpiCards sheetName="Google Discover All Time" />

      {/* Performance Trends Chart */}
      <TrendsChart dateRange={validDateRange} />

      {/* Content Performance Table */}
      <ContentPerformance sheetName="Google Discover All Time" />

      {/* Author Performance Table */}
      <AuthorPerformance sheetName="All Time Author Leaderboard Discover" />

      <Footer />
    </div>
  )
}

