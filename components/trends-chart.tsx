"use client"

import React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  date: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

interface TrendsChartProps {
  dateRange: {
    from: Date
    to: Date
  }
}

export function TrendsChart({ dateRange }: TrendsChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState({
    clicks: true,
    impressions: true,
    ctr: false,
    position: false,
  })

  // Generate data points for the selected date range
  const data: ChartData[] = React.useMemo(() => {
    const days: ChartData[] = []
    const currentDate = new Date(dateRange.from)
    const endDate = new Date(dateRange.to)
    
    // Base values for the metrics
    let baseClicks = 6500
    let baseImpressions = 65000
    let baseCtr = 10.0
    let basePosition = 3.2
    
    // Random variation ranges
    const clicksVariation = 500
    const impressionsVariation = 5000
    const ctrVariation = 0.5
    const positionVariation = 0.3
    
    while (currentDate <= endDate) {
      // Add some random variation to create realistic-looking trends
      const randomFactor = Math.sin(days.length * 0.1) // Creates a wave pattern
      const trendFactor = days.length * 0.02 // Creates an upward trend
      
      const clicks = Math.round(
        baseClicks + 
        (Math.random() - 0.5) * clicksVariation + 
        randomFactor * clicksVariation + 
        trendFactor * 100
      )
      
      const impressions = Math.round(
        baseImpressions + 
        (Math.random() - 0.5) * impressionsVariation + 
        randomFactor * impressionsVariation + 
        trendFactor * 1000
      )
      
      const ctr = Number(((clicks / impressions) * 100).toFixed(1))
      
      const position = Number((
        basePosition + 
        (Math.random() - 0.5) * positionVariation + 
        randomFactor * 0.2 - 
        trendFactor * 0.05
      ).toFixed(1))
      
      days.push({
        date: currentDate.toISOString().split('T')[0],
        clicks,
        impressions,
        ctr,
        position
      })
      
      // Update base values slightly to create trends
      baseClicks += Math.random() * 50
      baseImpressions += Math.random() * 500
      baseCtr = (baseClicks / baseImpressions) * 100
      basePosition = Math.max(1, Math.min(5, basePosition + (Math.random() - 0.5) * 0.1))
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Apply smoothing using moving average
    const windowSize = Math.max(7, Math.floor(days.length / 50)) // Adaptive window size
    const smoothData = days.map((day, index) => {
      const window = days.slice(
        Math.max(0, index - windowSize),
        Math.min(days.length, index + windowSize + 1)
      )
      
      return {
        date: day.date,
        clicks: Math.round(window.reduce((sum, d) => sum + d.clicks, 0) / window.length),
        impressions: Math.round(window.reduce((sum, d) => sum + d.impressions, 0) / window.length),
        ctr: Number((window.reduce((sum, d) => sum + d.ctr, 0) / window.length).toFixed(1)),
        position: Number((window.reduce((sum, d) => sum + d.position, 0) / window.length).toFixed(1))
      }
    })
    
    return smoothData
  }, [dateRange.from, dateRange.to])

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }))
  }

  // Calculate min/max values for scaling CTR and Position
  const yMax = Math.max(...data.map(d => d.clicks))
  const y2Max = Math.max(...data.map(d => d.impressions))
  
  // Improved scaling factors for better visualization
  const ctrScale = yMax / (Math.max(...data.map(d => d.ctr)) * 1.2) // Add some padding
  
  // Invert position scaling so higher numbers appear lower on the graph
  const maxPosition = Math.max(...data.map(d => d.position))
  const minPosition = Math.min(...data.map(d => d.position))
  const positionRange = maxPosition - minPosition
  const positionScale = yMax / (positionRange * 1.5) // More padding for position

  // Scale CTR and Position values to match the clicks scale
  const scaledData = data.map(d => ({
    ...d,
    scaledCtr: d.ctr * ctrScale,
    // Invert position so higher numbers appear lower on the graph
    scaledPosition: yMax - ((d.position - minPosition) * positionScale)
  }))

  return (
    <Card className="bg-[#020817]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Performance Trends</CardTitle>
            <CardDescription>Track your content's performance over time</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={visibleMetrics.clicks ? "default" : "outline"}
              onClick={() => toggleMetric("clicks")}
              className={visibleMetrics.clicks ? "bg-[#4285f4] hover:bg-[#4285f4]/90" : ""}
            >
              Clicks
            </Button>
            <Button
              size="sm"
              variant={visibleMetrics.impressions ? "default" : "outline"}
              onClick={() => toggleMetric("impressions")}
              className={visibleMetrics.impressions ? "bg-[#673ab7] hover:bg-[#673ab7]/90" : ""}
            >
              Impressions
            </Button>
            <Button
              size="sm"
              variant={visibleMetrics.ctr ? "default" : "outline"}
              onClick={() => toggleMetric("ctr")}
              className={visibleMetrics.ctr ? "bg-[#0f9d58] hover:bg-[#0f9d58]/90" : ""}
            >
              CTR
            </Button>
            <Button
              size="sm"
              variant={visibleMetrics.position ? "default" : "outline"}
              onClick={() => toggleMetric("position")}
              className={visibleMetrics.position ? "bg-[#ff7043] hover:bg-[#ff7043]/90" : ""}
            >
              Position
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scaledData}
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
                }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label)
                    const day = date.getDate()
                    const ordinal = (day: number) => {
                      if (day > 3 && day < 21) return 'th'
                      switch (day % 10) {
                        case 1: return 'st'
                        case 2: return 'nd'
                        case 3: return 'rd'
                        default: return 'th'
                      }
                    }
                    const formattedDate = date.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                    // Replace the numeric day with day + ordinal
                    const finalDate = formattedDate.replace(
                      /\d+/,
                      `${day}${ordinal(day)}`
                    )

                    return (
                      <div className="rounded-lg border border-border/50 bg-[#020817] p-3 shadow-md">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="font-medium text-white">Date:</div>
                          <div className="text-white">{finalDate}</div>
                          {payload.map((entry: any) => {
                            let value = entry.value
                            let name = entry.name
                            let color = entry.color
                            
                            // Convert scaled values back to original
                            if (name === "scaledCtr") {
                              value = value / ctrScale
                              name = "CTR"
                            } else if (name === "scaledPosition") {
                              // Convert back from inverted scale
                              value = minPosition + ((yMax - value) / positionScale)
                              name = "Position"
                            }
                            
                            return (
                              <React.Fragment key={name}>
                                <div className="font-medium" style={{ color }}>
                                  {name}:
                                </div>
                                <div className="text-white">
                                  {name === "CTR" 
                                    ? `${value.toFixed(1)}%`
                                    : name === "Position"
                                      ? value.toFixed(1)
                                      : value.toLocaleString()}
                                </div>
                              </React.Fragment>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
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
              {visibleMetrics.position && (
                <Line
                  type="monotone"
                  dataKey="scaledPosition"
                  stroke="#ff7043"
                  yAxisId="left"
                  dot={false}
                  strokeWidth={1.5}
                  activeDot={{ r: 4, fill: "#ff7043" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

