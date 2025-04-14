"use client"

import { useParams } from "next/navigation"
import { format, parse, setYear, startOfMonth, endOfMonth } from "date-fns"
import { ContentPerformance } from "@/components/content-performance"
import { AuthorPerformance } from "@/components/author-performance"
import { KpiCards } from "@/components/kpi-cards"
import { Footer } from "@/components/footer"
import { DateRange } from "react-day-picker"

export default function MonthPage() {
  const params = useParams()
  const month = params.month as string

  // Extract month and year from the URL parameter
  const [monthStr, yearStr] = month.split('-')
  const fullYear = yearStr.length === 2 ? `20${yearStr}` : yearStr
  
  // Parse the month string to get the full month name and date
  let monthDate: Date
  try {
    // Create a base date with the correct year
    let date = parse(monthStr, 'MMM', new Date())
    // Set the year explicitly
    monthDate = setYear(date, parseInt(fullYear))
    console.log('Date parsing:', {
      input: monthStr,
      parsed: monthDate.toISOString(),
      monthName: format(monthDate, 'MMMM'),
      year: fullYear
    })
  } catch (error) {
    console.error('Error parsing month:', error)
    monthDate = new Date() // Fallback to current date
  }
  
  // Format sheet names to match Google Sheets tab names
  const contentSheetName = `Google Discover ${format(monthDate, 'MMMM')} ${fullYear}`
  const authorSheetName = `Author Leaderboard ${format(monthDate, 'MMMM')} ${fullYear}`
  
  // Create date range for the month
  const dateRange: DateRange = {
    from: startOfMonth(monthDate),
    to: endOfMonth(monthDate)
  }
  
  // Log detailed information for debugging
  console.log('Month page params:', JSON.stringify({
    rawParams: params,
    month,
    monthStr,
    yearStr,
    monthName: format(monthDate, 'MMMM'),
    fullYear
  }, null, 2))
  
  console.log('Sheet names:', JSON.stringify({
    content: contentSheetName,
    author: authorSheetName
  }, null, 2))
  
  return (
    <div className="flex-1 space-y-4 p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Google Discover Performance for {format(monthDate, 'MMMM')} {fullYear}
      </h1>

      {/* KPI Cards */}
      <KpiCards dateRange={dateRange} />

      {/* Content Performance Table */}
      <ContentPerformance sheetName={contentSheetName} />

      {/* Author Performance Table */}
      <AuthorPerformance sheetName={authorSheetName} />

      <Footer />
    </div>
  )
} 