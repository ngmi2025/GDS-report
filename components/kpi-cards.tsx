"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, MousePointerClick, Eye, BarChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function KpiCards() {
  // This would be fetched from your API
  const kpiData = {
    "7days": {
      impressions: {
        value: 198_900,
        change: 8.9,
        increasing: true,
      },
      clicks: {
        value: 2_200_000,
        change: 9.1,
        increasing: true,
      },
      ctr: {
        value: 8.9,
        change: 0.2,
        increasing: true,
      },
    },
    "28days": {
      impressions: {
        value: 660_900,
        change: 7.4,
        increasing: true,
      },
      clicks: {
        value: 8_900_000,
        change: 8.2,
        increasing: true,
      },
      ctr: {
        value: 7.4,
        change: -0.3,
        increasing: false,
      },
    },
    "90days": {
      impressions: {
        value: 1_400_000,
        change: 6.8,
        increasing: true,
      },
      clicks: {
        value: 20_500_000,
        change: 7.5,
        increasing: true,
      },
      ctr: {
        value: 6.8,
        change: 0.1,
        increasing: true,
      },
    },
    "180days": {
      impressions: {
        value: 2_100_000,
        change: 6.8,
        increasing: true,
      },
      clicks: {
        value: 30_800_000,
        change: 7.2,
        increasing: true,
      },
      ctr: {
        value: 6.8,
        change: -0.1,
        increasing: false,
      },
    },
  }

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

