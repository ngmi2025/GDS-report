"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, MousePointerClick, Eye, BarChart, ArrowUpDown, Minus } from "lucide-react"
import { formatNumber } from "@/lib/utils"

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

export function KpiCards() {
  // Dummy data for demonstration
  const metrics = [
    {
      title: "Clicks",
      icon: MousePointerClick,
      value: 42156,
      change: 5.7,
      format: formatNumber
    },
    {
      title: "Impressions",
      icon: Eye,
      value: 856234,
      change: 6.8,
      format: formatNumber
    },
    {
      title: "CTR",
      icon: BarChart,
      value: 4.92,
      change: -0.8,
      format: (value: number) => `${value.toFixed(2)}%`
    },
    {
      title: "Avg. Position",
      icon: ArrowUpDown,
      value: 3.2,
      change: 5.9, // Note: For position, negative change is good (moving up in rankings)
      format: (value: number) => value.toFixed(1)
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4" />
                {metric.title}
              </div>
            </CardTitle>
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
