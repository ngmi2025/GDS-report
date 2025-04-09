"use client"

import * as React from "react"
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from "recharts"

interface LineChartProps {
  data: any[]
  categories: string[]
  index: string
  yAxisWidth?: number
  customTooltip?: (props: { datum: any }) => React.ReactNode
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
]

export function LineChart({ data, categories, index, yAxisWidth = 50, customTooltip }: LineChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={index}
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
          />
          <YAxis
            width={yAxisWidth}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={({ payload }) => {
            if (!payload?.length || !customTooltip) return null
            return customTooltip({ datum: payload[0].payload })
          }} />
          <Legend />
          {categories.map((category, index) => (
            <Line
              key={category}
              type="monotone"
              dataKey={category}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              name={category.charAt(0).toUpperCase() + category.slice(1)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
} 