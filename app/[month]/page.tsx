"use client"

import { useParams } from "next/navigation"
import { format, parse, setYear } from "date-fns"
import { ContentPerformance } from "@/components/content-performance"
import { AuthorPerformance } from "@/components/author-performance"
import { KpiCards } from "@/components/kpi-cards"
import { Footer } from "@/components/footer"

export default function MonthPage() {
  const params = useParams()
  const month = params.month as string

  // Extract month and year from the URL parameter
  const [monthStr, yearStr] = month.split('-')
  const fullYear = yearStr.length === 2 ? `20${yearStr}` : yearStr
  
  // Parse the month string to get the full month name
  let monthName: string
  try {
    // Create a base date with the correct year
    let date = parse(monthStr, 'MMM', new Date())
    // Set the year explicitly
    date = setYear(date, parseInt(fullYear))
    monthName = format(date, 'MMMM') // Get full month name (e.g., "November")
    console.log('Date parsing:', {
      input: monthStr,
      parsed: date.toISOString(),
      monthName,
      year: fullYear
    })
  } catch (error) {
    console.error('Error parsing month:', error)
    monthName = monthStr // Fallback to input month string
  }
  
  // Format sheet names to match Google Sheets tab names
  const contentSheetName = `Google Discover ${monthName} ${fullYear}`
  const authorSheetName = `Author Leaderboard ${monthName} ${fullYear}`
  
  // Log detailed information for debugging
  console.log('Month page params:', JSON.stringify({
    rawParams: params,
    month,
    monthStr,
    yearStr,
    monthName,
    fullYear
  }, null, 2))
  
  console.log('Sheet names:', JSON.stringify({
    content: contentSheetName,
    author: authorSheetName
  }, null, 2))
  
  return (
    <div className="flex-1 space-y-4 p-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Google Discover Performance for {monthName} {fullYear}
      </h1>

      {/* KPI Cards */}
      <KpiCards sheetName={contentSheetName} />

      {/* Content Performance Table */}
      <ContentPerformance sheetName={contentSheetName} />

      {/* Author Performance Table */}
      <AuthorPerformance sheetName={authorSheetName} />
    </div>
  )
} 