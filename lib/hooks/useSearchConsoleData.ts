import { useState, useEffect, useRef } from 'react'
import { DateRange } from 'react-day-picker'
import { format, differenceInDays, subDays, addDays, isAfter, isBefore } from 'date-fns'

interface SearchConsoleMetrics {
  clicks: number
  impressions: number
  ctr: number
}

interface SearchConsoleData {
  current: SearchConsoleMetrics
  previous: SearchConsoleMetrics | null
  changes: {
    clicks: number | null
    impressions: number | null
    ctr: number | null
  }
  warnings?: string[]
  rows?: Array<{
    keys: string[]
    clicks: number
    impressions: number
    ctr: number
  }>
}

const DATA_RETENTION_DAYS = 496 // ~16 months

// Cache for storing API responses
const responseCache = new Map<string, any>()

// Map preset labels to cache keys
const PRESET_TO_KEY: Record<string, string> = {
  'Last 7 days': 'last-7-days',
  'Last 28 days': 'last-28-days',
  'Last 3 months': 'last-3-months',
  'Last 16 months': 'last-16-months',
}

function getCacheKey(dateRange: DateRange & { preset?: string }) {
  if (dateRange.preset && PRESET_TO_KEY[dateRange.preset]) {
    return PRESET_TO_KEY[dateRange.preset]
  }
  // If it's a month, format as yyyy-MM
  if (dateRange.from && dateRange.to && dateRange.from.getDate() === 1 && dateRange.to.getDate() > 27) {
    // Month key
    return `${dateRange.from.getFullYear()}-${String(dateRange.from.getMonth() + 1).padStart(2, '0')}`
  }
  // Fallback to last-3-months
  return 'last-3-months'
}

export function useSearchConsoleData(dateRange: DateRange & { preset?: string }) {
  const [data, setData] = useState<SearchConsoleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevDateRangeRef = useRef<DateRange | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!dateRange.from || !dateRange.to) return

      // Check if the date range has actually changed
      const prevDateRange = prevDateRangeRef.current
      if (prevDateRange?.from?.getTime() === dateRange.from.getTime() && 
          prevDateRange?.to?.getTime() === dateRange.to.getTime()) {
        return
      }
      prevDateRangeRef.current = dateRange

      try {
        setLoading(true)
        setError(null)

        const warnings: string[] = []
        const oldestAvailableDate = subDays(new Date(), DATA_RETENTION_DAYS)

        // Check if current period is within available range
        if (isBefore(dateRange.from, oldestAvailableDate)) {
          throw new Error('Selected date range is beyond the available 16-month period')
        }

        // Calculate the previous period date range
        const currentPeriodDays = differenceInDays(dateRange.to, dateRange.from)
        const previousStart = subDays(dateRange.from, currentPeriodDays)
        const previousEnd = subDays(dateRange.from, 1)

        // Check if previous period is partially or fully outside available range
        const isPreviousPeriodAvailable = isAfter(previousStart, oldestAvailableDate)

        // Generate cache keys
        const currentCacheKey = getCacheKey(dateRange)
        const previousCacheKey = `${format(previousStart, 'yyyy-MM-dd')}-${format(previousEnd, 'yyyy-MM-dd')}`

        // Fetch current period data
        let currentResult
        if (responseCache.has(currentCacheKey)) {
          currentResult = responseCache.get(currentCacheKey)
        } else {
          const currentResponse = await fetch(
            `/api/gsc-cache?range=${currentCacheKey}`
          )

          if (!currentResponse.ok) {
            const errorData = await currentResponse.json()
            if (currentResponse.status === 401) {
              throw new Error('Please sign in to access Google Search Console data')
            }
            throw new Error(errorData.error || 'Failed to fetch Search Console data')
          }

          currentResult = await currentResponse.json()
          responseCache.set(currentCacheKey, currentResult)
        }

        const currentMetrics = calculateMetrics(currentResult.rows || [])

        let previousMetrics: SearchConsoleMetrics | null = null
        let changes = {
          clicks: null,
          impressions: null,
          ctr: null
        } as {
          clicks: number | null
          impressions: number | null
          ctr: number | null
        }

        // Only fetch previous period if it's within the available range
        if (isPreviousPeriodAvailable) {
          let previousResult
          if (responseCache.has(previousCacheKey)) {
            previousResult = responseCache.get(previousCacheKey)
          } else {
            const previousResponse = await fetch(
              `/api/gsc-cache?range=${previousCacheKey}`
            )

            if (previousResponse.ok) {
              previousResult = await previousResponse.json()
              responseCache.set(previousCacheKey, previousResult)
            }
          }

          if (previousResult) {
            previousMetrics = calculateMetrics(previousResult.rows || [])

            // Calculate changes only if we have previous data
            changes = {
              clicks: previousMetrics ? calculatePercentageChange(currentMetrics.clicks, previousMetrics.clicks) : null,
              impressions: previousMetrics ? calculatePercentageChange(currentMetrics.impressions, previousMetrics.impressions) : null,
              ctr: previousMetrics ? calculatePercentageChange(currentMetrics.ctr, previousMetrics.ctr) : null
            } as {
              clicks: number | null
              impressions: number | null
              ctr: number | null
            }
          }
        } else {
          warnings.push('Comparison data is not available for the selected date range (beyond 16-month limit)')
        }

        setData({
          current: currentMetrics,
          previous: previousMetrics,
          changes,
          warnings,
          rows: currentResult.rows // Include the daily data for the trends chart
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange.from?.toISOString(), dateRange.to?.toISOString(), dateRange.preset])

  return { data, loading, error }
}

function calculateMetrics(rows: any[]): SearchConsoleMetrics {
  if (rows.length === 0) {
    return { clicks: 0, impressions: 0, ctr: 0 }
  }

  const totals = rows.reduce(
    (acc, row) => ({
      clicks: acc.clicks + (row.clicks || 0),
      impressions: acc.impressions + (row.impressions || 0),
    }),
    { clicks: 0, impressions: 0 }
  )

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
} 