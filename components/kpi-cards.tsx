"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, MousePointerClick, Eye, BarChart, Minus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export function KpiCards({ data = [] }: { data: any[] }) {
  // Helper to parse numbers safely
  const parseNumber = (value: string | number) => {
    if (typeof value === "number") return value;
    return parseInt(value?.toString().replace(/,/g, "") || "0") || 0;
  };

  // Aggregates by period (7, 28, 90, 180 days)
  const kpiData = useMemo(() => {
    if (!Array.isArray(data)) return {};
    
    const now = new Date();
    const periods = [7, 28, 90, 180];
    const result: Record<string, any> = {};

    periods.forEach((days) => {
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const filtered = data.filter((row) => {
        if (!row) return false;
        const dateStr = row["Published Date"] || row["Updated Date"];
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= from && date <= now;
      });

      // Calculate current period metrics
      const clicks = filtered.reduce((sum, row) => sum + parseNumber(row?.["Clicks"]), 0);
      const impressions = filtered.reduce((sum, row) => sum + parseNumber(row?.["Impressions"]), 0);
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

      // Calculate previous period for comparison
      const previousFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
      const previousFiltered = data.filter((row) => {
        if (!row) return false;
        const dateStr = row["Published Date"] || row["Updated Date"];
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date >= previousFrom && date < from;
      });

      const previousClicks = previousFiltered.reduce((sum, row) => sum + parseNumber(row?.["Clicks"]), 0);
      const previousImpressions = previousFiltered.reduce((sum, row) => sum + parseNumber(row?.["Impressions"]), 0);
      const previousCtr = previousImpressions > 0 ? (previousClicks / previousImpressions) * 100 : 0;

      result[`${days}days`] = {
        impressions: {
          value: impressions,
          change: calculatePercentageChange(impressions, previousImpressions),
          increasing: impressions > previousImpressions,
        },
        clicks: {
          value: clicks,
          change: calculatePercentageChange(clicks, previousClicks),
          increasing: clicks > previousClicks,
        },
        ctr: {
          value: ctr,
          change: calculatePercentageChange(ctr, previousCtr),
          increasing: ctr > previousCtr,
        },
      };
    });

    return result;
  }, [data]);

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
          {Object.entries(kpiData).map(([period, metrics]) => (
            <TabsContent key={period} value={period}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="h-4 w-4" />
                        Clicks
                      </div>
                    </CardTitle>
                    <PercentageChange value={metrics.clicks.change} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(metrics.clicks.value)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Impressions
                      </div>
                    </CardTitle>
                    <PercentageChange value={metrics.impressions.change} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(metrics.impressions.value)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" />
                        CTR
                      </div>
                    </CardTitle>
                    <PercentageChange value={metrics.ctr.change} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.ctr.value.toFixed(2)}%</div>
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
