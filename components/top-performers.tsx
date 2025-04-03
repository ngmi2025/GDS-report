"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DateRange } from "react-day-picker"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Eye, MousePointerClick } from "lucide-react"

interface TopPerformersProps {
  dateRange: DateRange
  selectedMonth: string
}

export function TopPerformers({ dateRange, selectedMonth }: TopPerformersProps) {
  const [metric, setMetric] = useState<"impressions" | "clicks">("impressions")

  // This would be fetched from your API
  const impressionsData = [
    { title: "American Express Is Removing 3 Benefits Soon", impressions: 1325788 },
    { title: "Chase Adds Limited-Time Wellness Perks", impressions: 1211525 },
    { title: "Big Changes to Chase's United Airlines Personal Credit Card", impressions: 353313 },
    { title: "How I'm Spending 1 Million Amex Points", impressions: 352158 },
    { title: "Hidden Gems in Amex Centurion Lounge Chicago", impressions: 325775 },
    { title: "Why I Make Sure To Spend $15,000 on This Card", impressions: 146973 },
    { title: "The 5 US Passport Offices With Less Wait Time", impressions: 123223 },
    { title: "When the Chase Travel Portal is (And Isn't) Worth It", impressions: 105345 },
    { title: "Amex Platinum Card vs. Visa Infinite: Which is Better?", impressions: 145844 },
    { title: "How I Got the Rich Credit Card Even Though I Don't Qualify", impressions: 145069 },
  ]

  const clicksData = [
    { title: "American Express Is Removing 3 Benefits Soon", clicks: 157821 },
    { title: "Chase Adds Limited-Time Wellness Perks", clicks: 76387 },
    { title: "Big Changes to Chase's United Airlines Personal Credit Card", clicks: 25705 },
    { title: "How I'm Spending 1 Million Amex Points", clicks: 31667 },
    { title: "Hidden Gems in Amex Centurion Lounge Chicago", clicks: 15052 },
    { title: "Why I Make Sure To Spend $15,000 on This Card", clicks: 14649 },
    { title: "The 5 US Passport Offices With Less Wait Time", clicks: 11945 },
    { title: "When the Chase Travel Portal is (And Isn't) Worth It", clicks: 10816 },
    { title: "Amex Platinum Card vs. Visa Infinite: Which is Better?", clicks: 10213 },
    { title: "How I Got the Rich Credit Card Even Though I Don't Qualify", clicks: 9375 },
  ]

  const data = metric === "impressions" ? impressionsData : clicksData

  // Truncate long titles for better display
  const processedData = data.map((item) => ({
    ...item,
    shortTitle: item.title.length > 30 ? item.title.substring(0, 30) + "..." : item.title,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Top 10 articles by {metric}</CardDescription>
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
            [metric]: {
              label: metric === "impressions" ? "Impressions" : "Clicks",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="shortTitle" width={150} tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => {
                      const item = data.find((d) => d.title.startsWith(label.split("...")[0]))
                      return item ? item.title : label
                    }}
                  />
                }
              />
              <Legend />
              <Bar
                dataKey={metric}
                fill={`var(--color-${metric})`}
                name={metric === "impressions" ? "Impressions" : "Clicks"}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

