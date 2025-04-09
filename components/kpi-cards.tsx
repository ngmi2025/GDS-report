"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"

interface KpiCardsProps {
  sheetName: string;
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function PercentageChange({ value }: { value: number }) {
  if (value === 0) {
    return (
      <div className="flex items-center text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span>0%</span>
      </div>
    )
  }

  const isPositive = value > 0
  const Icon = isPositive ? ArrowUp : ArrowDown
  const colorClass = isPositive ? "text-green-500" : "text-red-500"

  return (
    <div className={`flex items-center ${colorClass}`}>
      <Icon className="h-4 w-4" />
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  )
}

export function KpiCards({ sheetName }: KpiCardsProps) {
  // Dummy data - will be replaced with GSC data later
  const kpiData = {
    current: {
      clicks: 42156,
      impressions: 856234,
      ctr: 4.92,
      position: 3.2
    },
    previous: {
      clicks: 39876,
      impressions: 802345,
      ctr: 4.97,
      position: 3.4
    }
  }

  const metrics = [
    {
      title: "Clicks",
      value: kpiData.current.clicks,
      change: calculatePercentageChange(kpiData.current.clicks, kpiData.previous.clicks),
      format: formatNumber
    },
    {
      title: "Impressions",
      value: kpiData.current.impressions,
      change: calculatePercentageChange(kpiData.current.impressions, kpiData.previous.impressions),
      format: formatNumber
    },
    {
      title: "CTR",
      value: kpiData.current.ctr,
      change: calculatePercentageChange(kpiData.current.ctr, kpiData.previous.ctr),
      format: (value: number) => `${value.toFixed(2)}%`
    },
    {
      title: "Avg. Position",
      value: kpiData.current.position,
      change: calculatePercentageChange(kpiData.previous.position, kpiData.current.position), // Inverted because lower position is better
      format: (value: number) => value.toFixed(1)
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <PercentageChange value={metric.change} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.format(metric.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

