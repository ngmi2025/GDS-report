"use client"

import { useParams, useRouter } from "next/navigation"
import { format, parse, setYear, startOfMonth, endOfMonth } from "date-fns"
import { ContentPerformance } from "@/components/content-performance"
import { AuthorPerformance } from "@/components/author-performance"
import { KpiCards } from "@/components/kpi-cards"
import { Footer } from "@/components/footer"
import { DateRange } from "react-day-picker"
import { useEffect } from "react"

export default function MonthPage() {
  const params = useParams()
  const router = useRouter()
  const month = params.month as string

  useEffect(() => {
    if (!month) {
      const currentDate = new Date()
      const currentMonth = format(currentDate, 'MMM-yy').toLowerCase()
      router.push(`/${currentMonth}`)
      return
    }

    const [monthStr, yearStr] = month.split('-')
    if (!monthStr || !yearStr) {
      const currentDate = new Date()
      const currentMonth = format(currentDate, 'MMM-yy').toLowerCase()
      router.push(`/${currentMonth}`)
      return
    }
  }, [month, router])

  if (!month) return null

  // Extract month and year from the URL parameter
  const [monthStr, yearStr] = month.split('-')
  if (!monthStr || !yearStr) return null

  // Parse the month string to get the full month name and date
  let monthDate: Date
  try {
    // Create a base date with the correct year
    let date = parse(monthStr, 'MMM', new Date())
    // Set the year explicitly
    monthDate = setYear(date, parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr))
  } catch (error) {
    console.error('Error parsing month:', error)
    const currentDate = new Date()
    router.push(`/${format(currentDate, 'MMM-yy').toLowerCase()}`)
    return null
  }

  // Create date range for the month
  const dateRange: DateRange = {
    from: startOfMonth(monthDate),
    to: endOfMonth(monthDate)
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Google Discover Performance for {format(monthDate, 'MMMM yyyy')}
      </h1>

      {/* KPI Cards */}
      <KpiCards dateRange={dateRange} />

      {/* Content Performance Table */}
      <ContentPerformance sheetName={`Google Discover ${format(monthDate, 'MMMM yyyy')}`} />

      {/* Author Performance Table */}
      <AuthorPerformance sheetName={`Author Leaderboard ${format(monthDate, 'MMMM yyyy')}`} />

      <Footer />
    </div>
  )
} 