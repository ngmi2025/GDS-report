"use client"

import { MousePointerClick, Eye, Percent } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchConsoleData } from "@/lib/hooks/useSearchConsoleData"
import { DateRange } from "react-day-picker"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface KpiCardsProps {
  dateRange: DateRange | undefined
}

export function KpiCards({ dateRange }: KpiCardsProps) {
  if (!dateRange) {
    return null
  }

  const { data, loading, error } = useSearchConsoleData(dateRange)

  if (error) {
    return <div>Error loading data</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return null
  }

  const metrics = [
    {
      title: "Clicks",
      value: data.current.clicks.toLocaleString(),
      change: data.changes.clicks,
      icon: MousePointerClick,
      tooltip: "Total number of clicks from Google Discover"
    },
    {
      title: "Impressions",
      value: data.current.impressions.toLocaleString(),
      change: data.changes.impressions,
      icon: Eye,
      tooltip: "Total number of impressions from Google Discover"
    },
    {
      title: "CTR",
      value: `${data.current.ctr.toFixed(2)}%`,
      change: data.changes.ctr,
      icon: Percent,
      tooltip: "Click-through rate (clicks ÷ impressions)"
    },
  ]

  return (
    <div className="space-y-4">
      {data.warnings && data.warnings.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {data.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title} className="bg-[#020817]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <metric.icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-white">
                  {metric.title}
                </CardTitle>
              </div>
              {metric.change !== null && (
                <div className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change).toFixed(1)}%
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
