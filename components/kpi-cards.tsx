"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, MousePointerClick, Eye, BarChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function KpiCards({ data }: { data: any[] }) {
  // Helper to parse numbers safely
  const parseNumber = (value: string | number) => {
    if (typeof value === "number") return value
    return parseInt(value.toString().replace(/,/g, "")) || 0
  }

  // Aggregates by period (7, 28, 90, 180 days)
  const kpiData = useMemo(() => {
    const now = new Date()
    const periods = [7, 28, 90, 180]
    const result: Record<string, any> = {}

    periods.forEach((days) => {
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      const filtered = data.filter((row) => {
        const dateStr = row[8] || row[9] // Published or Updated Date
        const date = new Date(dateStr)
        return date >= from && date <= now
      })

      const clicks = filtered.reduce((sum, row) => sum + parseNumber(row[3]), 0)
      const impressions = filtered.reduce((sum, row) => sum + parseNumber(row[4]), 0)
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

      result[`${days}days`] = {
        impressions: {
          value: impressions,
          change: 0,
          increasing: true,
        },
        clicks: {
          value: clicks,
          change: 0,
          increasing: true,
        },
        ctr: {
          value: ctr,
          change: 0,
          increasing: true,
        },
      }
    })

    return result
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>Key metrics across different time periods</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="7days">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="7days">Last 7 days</TabsTrigger>
            <TabsTrigger value="28days">Last 28 days</TabsTrigger>
            <TabsTrigger value="90days">Last 90 days</TabsTrigger>
            <TabsTrigger value="180days">Last 180 days</TabsTrigger>
          </TabsList>

          {Object.entries(kpiData).map(([period, data]) => (
            <TabsContent key={period} value={period}>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.impressions.value.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {data.impressions.increasing ? (
                        <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <span className={data.impressions.increasing ? "text-green-500" : "text-red-500"}>
                        {data.impressions.change}%
                      </span>
                      <span className="ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                    <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.clicks.value.toLocaleString()}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {data.clicks.increasing ? (
                        <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <span className={data.clicks.increasing ? "text-green-500" : "text-red-500"}>
                        {data.clicks.change}%
                      </span>
                      <span className="ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CTR</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.ctr.value.toFixed(1)}%</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {data.ctr.increasing ? (
                        <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                      )}
                      <span className={data.ctr.increasing ? "text-green-500" : "text-red-500"}>
                        {data.ctr.change}%
                      </span>
                      <span className="ml-1">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
