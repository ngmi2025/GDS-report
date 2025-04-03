"use client"

import * as React from "react"
import { CalendarIcon, Check } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UnifiedDateSelectorProps {
  dateRange: DateRange
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  selectedPreset: string
  setSelectedPreset: (preset: string) => void
}

const presets = [
  {
    id: "last7days",
    name: "Last 7 days",
    dateRange: {
      from: addDays(new Date(), -7),
      to: new Date(),
    },
  },
  {
    id: "last28days",
    name: "Last 28 days",
    dateRange: {
      from: addDays(new Date(), -28),
      to: new Date(),
    },
  },
  {
    id: "last90days",
    name: "Last 90 days",
    dateRange: {
      from: addDays(new Date(), -90),
      to: new Date(),
    },
  },
  {
    id: "last180days",
    name: "Last 180 days",
    dateRange: {
      from: addDays(new Date(), -180),
      to: new Date(),
    },
  },
]

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

export function UnifiedDateSelector({
  dateRange,
  setDateRange,
  selectedMonth,
  setSelectedMonth,
  selectedPreset,
  setSelectedPreset,
}: UnifiedDateSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const handlePresetChange = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      setDateRange(preset.dateRange)
      setSelectedPreset(presetId)
    }
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    setSelectedPreset("custom")
    // Here you would typically set the dateRange to cover the entire month
    // For simplicity, we're just setting the preset to "custom"
  }

  const displayText = React.useMemo(() => {
    if (selectedPreset !== "custom") {
      const preset = presets.find((p) => p.id === selectedPreset)
      return preset?.name || "Select date range"
    }

    if (selectedMonth !== "custom") {
      return selectedMonth
    }

    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
      }
      return format(dateRange.from, "LLL dd, y")
    }

    return "Select date range"
  }, [selectedPreset, selectedMonth, dateRange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn("w-[260px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Tabs defaultValue="presets">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="months">Months</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="presets" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={selectedPreset === preset.id ? "default" : "outline"}
                  onClick={() => {
                    handlePresetChange(preset.id)
                    setOpen(false)
                  }}
                  className="justify-start"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="months" className="p-0">
            <Command>
              <CommandInput placeholder="Search month..." />
              <CommandList>
                <CommandEmpty>No month found.</CommandEmpty>
                <CommandGroup>
                  {availableMonths.map((month) => (
                    <CommandItem
                      key={month}
                      onSelect={() => {
                        handleMonthChange(month)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedMonth === month ? "opacity-100" : "opacity-0")} />
                      {month}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </TabsContent>
          <TabsContent value="calendar" className="p-0">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range || { from: new Date(), to: new Date() })
                setSelectedPreset("custom")
              }}
              numberOfMonths={2}
              className="p-3"
            />
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <Button size="sm" onClick={() => setOpen(false)} className="w-full">
                Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

