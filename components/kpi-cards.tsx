"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, BarChart2Icon, EyeIcon, MousePointerClickIcon, TrendingUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface KpiMetric {
  value: number
  change: number
}

interface KpiData {
  clicks: KpiMetric
  impressions: KpiMetric
  ctr: KpiMetric
  position: KpiMetric
}

export function KpiCards() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if we're still loading the session
        if (status === 'loading') {
          return
        }

        // Check if we're authenticated
        if (!session) {
          setError('Please sign in to view KPI data')
          setLoading(false)
          return
        }

        console.log('Fetching KPI data...')
        const response = await fetch('/api/searchconsole/overview')
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('KPI fetch response error:', response.status, errorText)
          throw new Error(errorText || `HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('KPI data received:', data)
        setData(data)
        setError(null)
      } catch (err) {
        console.error('KPI fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load KPI data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="h-5 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="mt-2 h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="text-sm text-red-600 font-medium">Error loading KPI data:</div>
        <div className="mt-1 text-sm text-red-500">{error}</div>
        <div className="mt-2 text-xs text-red-400">
          Authentication status: {status}
        </div>
      </div>
    )
  }

  if (!data) return null

  const metrics = [
    {
      title: "Clicks",
      value: data.clicks.value.toLocaleString(),
      change: data.clicks.change,
      icon: MousePointerClickIcon,
    },
    {
      title: "Impressions",
      value: data.impressions.value.toLocaleString(),
      change: data.impressions.change,
      icon: EyeIcon,
    },
    {
      title: "CTR",
      value: data.ctr.value.toFixed(2) + "%",
      change: data.ctr.change,
      icon: BarChart2Icon,
    },
    {
      title: "Avg. Position",
      value: data.position.value.toFixed(1),
      change: data.position.change,
      icon: TrendingUpIcon,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </h3>
              </div>
              <span
                className={cn(
                  "flex items-center text-xs",
                  metric.change > 0
                    ? "text-green-600"
                    : metric.change < 0
                    ? "text-red-600"
                    : "text-gray-600"
                )}
              >
                {metric.change !== 0 && (
                  <>
                    {metric.change > 0 ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </>
                )}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
