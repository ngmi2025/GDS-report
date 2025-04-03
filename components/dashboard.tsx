"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { KpiCards } from "@/components/kpi-cards"
import { TrendsChart } from "@/components/trends-chart"
import { ContentTable } from "@/components/content-table"
import { AuthorPerformance } from "@/components/author-performance"
import { UnifiedDateSelector } from "@/components/unified-date-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DateRange } from "react-day-picker"
import { Footer } from "@/components/footer"

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [selectedMonth, setSelectedMonth] = useState<string>("March 2025")
  const [selectedPreset, setSelectedPreset] = useState<string>("last28days")

  const [googleData, setGoogleData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://script.google.com/macros/s/AKfycbykko6EP2hc6QXisfVmHyUeEQPkRBuhJNshs9troTxjpcjlzQbGSBAKL56Y2rPrYsLa/exec")
      .then((res) => res.json())
      .then((data) => {
        setGoogleData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to fetch Google Discover data.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading Google Discover data…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Google Discover Performance Dashboard</h1>
          <UnifiedDateSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
          />
        </div>

        <KpiCards data={googleData} />

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="content">Content Performance</TabsTrigger>
            <TabsTrigger value="authors">Author Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="trends" className="space-y-4">
            <TrendsChart data={googleData} dateRange={dateRange} selectedMonth={selectedMonth} />
          </TabsContent>
          <TabsContent value="content" className="space-y-4">
            <ContentTable data={googleData} dateRange={dateRange} selectedMonth={selectedMonth} />
          </TabsContent>
          <TabsContent value="authors" className="space-y-4">
            <AuthorPerformance data={googleData} dateRange={dateRange} selectedMonth={selectedMonth} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
