"use client"

import React from 'react'
import { DateRange } from 'react-day-picker'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useSearchConsoleData } from '@/lib/hooks/useSearchConsoleData'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ChartData {
  date: string
  clicks: number
  impressions: number
  ctr: number
  scaledCtr: number
}

interface SearchConsoleRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
}

interface SearchConsoleResponse {
  rows?: SearchConsoleRow[]
}

interface Props {
  dateRange: DateRange
}

export function TrendsChart({ dateRange }: Props) {
  const { data, loading, error } = useSearchConsoleData(dateRange)
  const [visibleMetrics, setVisibleMetrics] = React.useState({
    clicks: true,
    impressions: true,
    ctr: false
  })

  if (loading) {
    return (
      <Card className="bg-[#020817]">
        <CardHeader>
          <CardTitle className="text-white">Performance Trends</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#020817]">
        <CardHeader>
          <CardTitle className="text-white">Performance Trends</CardTitle>
          <CardDescription className="text-red-500">Error loading data: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data?.rows || data.rows.length === 0) {
    return (
      <Card className="bg-[#020817]">
        <CardHeader>
          <CardTitle className="text-white">Performance Trends</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Transform and sort the data
  const chartData: ChartData[] = data.rows.map(row => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr * 100,
    scaledCtr: 0 // Will be calculated after sorting
  }))

  // Sort data by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Calculate scaling factor for CTR to match the clicks scale
  const maxClicks = Math.max(...chartData.map(d => d.clicks))
  const maxCtr = Math.max(...chartData.map(d => d.ctr))
  const ctrScale = maxClicks / (maxCtr * 1.2) // Add some padding

  // Scale CTR values
  chartData.forEach(d => {
    d.scaledCtr = d.ctr * ctrScale
  })

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }))
  }

  return (
    <Card className="bg-[#020817] p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance Trends</CardTitle>
            <CardDescription>Track your content's performance over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toggleMetric('clicks')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                visibleMetrics.clicks 
                  ? 'bg-[#4285f4] text-white hover:bg-[#4285f4]/90' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
              }`}
            >
              Clicks
            </button>
            <button
              onClick={() => toggleMetric('impressions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                visibleMetrics.impressions 
                  ? 'bg-[#673ab7] text-white hover:bg-[#673ab7]/90' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
              }`}
            >
              Impressions
            </button>
            <button
              onClick={() => toggleMetric('ctr')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                visibleMetrics.ctr 
                  ? 'bg-[#0f9d58] text-white hover:bg-[#0f9d58]/90' 
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
              }`}
            >
              CTR
            </button>
          </div>
        </div>
      </CardHeader>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const d = new Date(date)
                return d.toLocaleDateString('en-GB', { 
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                }).replace(/\//g, '/');
              }}
              stroke="#666"
              tick={{ fill: '#888', fontSize: 12 }}
            />
            {visibleMetrics.clicks && (
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#4285f4"
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: '#888', fontSize: 12 }}
                tickCount={8}
              />
            )}
            {visibleMetrics.impressions && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#673ab7"
                tickFormatter={(value) => value.toLocaleString()}
                tick={{ fill: '#888', fontSize: 12 }}
                tickCount={8}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(2, 8, 23, 0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '12px',
              }}
              labelStyle={{ 
                color: '#fff',
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '14px'
              }}
              itemStyle={{ 
                color: '#fff',
                fontSize: '13px',
                padding: '4px 0'
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'scaledCtr') {
                  const originalCtr = value / ctrScale
                  return [
                    <span style={{ color: '#0f9d58' }}>{originalCtr.toFixed(1)}%</span>,
                    <span style={{ color: '#0f9d58' }}>CTR</span>
                  ]
                }
                const color = name === 'clicks' ? '#4285f4' : '#673ab7'
                return [
                  <span style={{ color }}>{value.toLocaleString()}</span>,
                  <span style={{ color }}>{name.toUpperCase()}</span>
                ]
              }}
              labelFormatter={(value) => {
                const date = new Date(value)
                const day = date.getDate()
                const ordinal = (d: number) => {
                  if (d > 3 && d < 21) return 'th'
                  switch (d % 10) {
                    case 1: return 'st'
                    case 2: return 'nd'
                    case 3: return 'rd'
                    default: return 'th'
                  }
                }
                return date.toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).replace(/\d+/, `${day}${ordinal(day)}`)
              }}
            />
            {visibleMetrics.clicks && (
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#4285f4"
                yAxisId="left"
                dot={false}
                strokeWidth={1.5}
                activeDot={{ r: 4, fill: "#4285f4" }}
              />
            )}
            {visibleMetrics.impressions && (
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#673ab7"
                yAxisId="right"
                dot={false}
                strokeWidth={1.5}
                activeDot={{ r: 4, fill: "#673ab7" }}
              />
            )}
            {visibleMetrics.ctr && (
              <Line
                type="monotone"
                dataKey="scaledCtr"
                stroke="#0f9d58"
                yAxisId="left"
                dot={false}
                strokeWidth={1.5}
                activeDot={{ r: 4, fill: "#0f9d58" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

