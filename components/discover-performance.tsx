"use client";

import { useState, useEffect } from "react";
import { useSheetData, type ContentSheetData } from "@/lib/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";

interface DiscoverPerformanceProps {
  sheetName: string;
  className?: string;
}

interface PerformanceMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCTR: number;
  totalArticles: number;
}

export function DiscoverPerformance({ sheetName, className }: DiscoverPerformanceProps) {
  const { data, loading: isLoading, error } = useSheetData<ContentSheetData>(sheetName);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (data) {
      const totalClicks = data.reduce((sum, item) => sum + item.Clicks, 0);
      const totalImpressions = data.reduce((sum, item) => sum + item.Impressions, 0);
      const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      setMetrics({
        totalClicks,
        totalImpressions,
        averageCTR,
        totalArticles: data.length
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Discover Performance</CardTitle>
          <CardDescription>Overall performance metrics for Google Discover</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Discover Performance</CardTitle>
        <CardDescription>Overall performance metrics for Google Discover</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics?.totalClicks || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total clicks across all articles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics?.totalImpressions || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Total impressions across all articles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.averageCTR.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">
                Average click-through rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics?.totalArticles || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Articles in Google Discover
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 