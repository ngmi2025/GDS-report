"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthSelectorProps {
  selectedMonth: string
  setSelectedMonth: (month: string) => void
}

export function MonthSelector({ selectedMonth, setSelectedMonth }: MonthSelectorProps) {
  // This would be dynamically populated from your API
  const availableMonths = [
    "March 2025",
    "February 2025",
    "January 2025",
    "December 2024",
    "November 2024",
    "October 2024",
    "September 2024",
    "August 2024",
  ]

  return (
    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select month" />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.map((month) => (
          <SelectItem key={month} value={month}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

