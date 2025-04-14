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

type ValidDateRange = { from: Date; to: Date; preset?: string }

export default function DashboardPage() {
  const { data: contentData } = useSheetData("Google Discover All Time")
  const { data: authorData } = useSheetData("All Time Author Leaderboard Discover")

  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 90) // Last 3 months
  const defaultDateRange: ValidDateRange = {
    from,
    to,
    preset: "Last 3 months"
  }

  const [validDateRange, setValidDateRange] = useState<ValidDateRange>(defaultDateRange)

  const handleDateChange = (range: DateRange & { preset?: string }) => {
    if (range.from && range.to) {
      setValidDateRange({
        from: range.from,
        to: range.to,
        preset: range.preset
      })
    }
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
        <UnifiedDateSelector
          defaultValue={defaultDateRange}
          onDateChange={handleDateChange}
        />
      </div>

      {/* KPI Cards */}
      <KpiCards dateRange={validDateRange} />

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

