"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Eye, MousePointerClick } from "lucide-react"

interface DeviceBreakdownProps {
  dateRange: DateRange
  selectedMonth: string
}

export function DeviceBreakdown({ dateRange, selectedMonth }: DeviceBreakdownProps) {
  const [metric, setMetric] = useState<"impressions" | "clicks">("impressions")

  // This would be fetched from your API
  const impressionsData = [
    { name: "Mobile", value: 1450000 },
    { name: "Desktop", value: 550000 },
    { name: "Tablet", value: 105000 },
  ]

  const clicksData = [
    { name: "Mobile", value: 155000 },
    { name: "Desktop", value: 60000 },
    { name: "Tablet", value: 6834 },
  ]

  const data = metric === "impressions" ? impressionsData : clicksData

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>{metric} distribution by device type</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={metric}
            onValueChange={(value) => value && setMetric(value as "impressions" | "clicks")}
          >
            <ToggleGroupItem value="impressions" aria-label="Show impressions">
              <Eye className="mr-1 h-4 w-4" />
              Impressions
            </ToggleGroupItem>
            <ToggleGroupItem value="clicks" aria-label="Show clicks">
              <MousePointerClick className="mr-1 h-4 w-4" />
              Clicks
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            mobile: {
              label: "Mobile",
              color: COLORS[0],
            },
            desktop: {
              label: "Desktop",
              color: COLORS[1],
            },
            tablet: {
              label: "Tablet",
              color: COLORS[2],
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => value.toLocaleString()} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

