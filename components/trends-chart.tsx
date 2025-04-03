"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Toggle } from "@/components/ui/toggle"
import { Eye, MousePointerClick, BarChart2, Target } from "lucide-react"

interface TrendsChartProps {
  dateRange: DateRange
  selectedMonth: string
}

export function TrendsChart({ dateRange, selectedMonth }: TrendsChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    impressions: true,
    clicks: true,
    ctr: true,
    position: true,
  })

  // This would be fetched from your API
  const data = [
    { date: "2025-03-01", impressions: 65000, clicks: 6500, ctr: 10.0, position: 3.2 },
    { date: "2025-03-02", impressions: 68000, clicks: 7200, ctr: 10.6, position: 3.1 },
    { date: "2025-03-03", impressions: 72000, clicks: 7500, ctr: 10.4, position: 3.0 },
    { date: "2025-03-04", impressions: 75000, clicks: 7800, ctr: 10.4, position: 3.0 },
    { date: "2025-03-05", impressions: 70000, clicks: 7000, ctr: 10.0, position: 3.1 },
    { date: "2025-03-06", impressions: 68000, clicks: 6800, ctr: 10.0, position: 3.2 },
    { date: "2025-03-07", impressions: 67000, clicks: 6700, ctr: 10.0, position: 3.2 },
    { date: "2025-03-08", impressions: 69000, clicks: 7100, ctr: 10.3, position: 3.1 },
    { date: "2025-03-09", impressions: 72000, clicks: 7500, ctr: 10.4, position: 3.0 },
    { date: "2025-03-10", impressions: 75000, clicks: 7900, ctr: 10.5, position: 2.9 },
    { date: "2025-03-11", impressions: 78000, clicks: 8200, ctr: 10.5, position: 2.9 },
    { date: "2025-03-12", impressions: 80000, clicks: 8500, ctr: 10.6, position: 2.8 },
    { date: "2025-03-13", impressions: 82000, clicks: 8700, ctr: 10.6, position: 2.8 },
    { date: "2025-03-14", impressions: 85000, clicks: 9000, ctr: 10.6, position: 2.7 },
    { date: "2025-03-15", impressions: 87000, clicks: 9300, ctr: 10.7, position: 2.7 },
  ]

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Daily metrics for the selected period</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Toggle
              pressed={visibleMetrics.impressions}
              onPressedChange={() => toggleMetric("impressions")}
              aria-label="Toggle impressions"
              size="sm"
            >
              <Eye className="mr-1 h-4 w-4" />
              Impressions
            </Toggle>
            <Toggle
              pressed={visibleMetrics.clicks}
              onPressedChange={() => toggleMetric("clicks")}
              aria-label="Toggle clicks"
              size="sm"
            >
              <MousePointerClick className="mr-1 h-4 w-4" />
              Clicks
            </Toggle>
            <Toggle
              pressed={visibleMetrics.ctr}
              onPressedChange={() => toggleMetric("ctr")}
              aria-label="Toggle CTR"
              size="sm"
            >
              <BarChart2 className="mr-1 h-4 w-4" />
              CTR
            </Toggle>
            <Toggle
              pressed={visibleMetrics.position}
              onPressedChange={() => toggleMetric("position")}
              aria-label="Toggle position"
              size="sm"
            >
              <Target className="mr-1 h-4 w-4" />
              Position
            </Toggle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            impressions: {
              label: "Impressions",
              color: "hsl(var(--chart-1))",
            },
            clicks: {
              label: "Clicks",
              color: "hsl(var(--chart-2))",
            },
            ctr: {
              label: "CTR (%)",
              color: "hsl(var(--chart-3))",
            },
            position: {
              label: "Position",
              color: "hsl(var(--chart-4))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />

              {visibleMetrics.impressions && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--color-impressions)"
                  name="Impressions"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}

              {visibleMetrics.clicks && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-clicks)"
                  name="Clicks"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}

              {visibleMetrics.ctr && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ctr"
                  stroke="var(--color-ctr)"
                  name="CTR (%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}

              {visibleMetrics.position && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="position"
                  stroke="var(--color-position)"
                  name="Position"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

