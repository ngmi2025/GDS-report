"use client"

import * as React from "react"
import { Calendar, Search } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

interface UnifiedDateSelectorProps {
  defaultValue?: DateRange & { preset?: string }
  onDateChange?: (range: DateRange & { preset?: string }) => void
}

type ViewType = "presets" | "months" | "calendar"
type SelectionMethod = "preset" | "month" | "calendar"

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 16 months", days: 485 }, // ~16 months (485 days)
]

export function UnifiedDateSelector({ onDateChange, defaultValue }: UnifiedDateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeView, setActiveView] = React.useState<ViewType>("presets")
  const [selectionMethod, setSelectionMethod] = React.useState<SelectionMethod>("calendar")
  const [selectedPreset, setSelectedPreset] = React.useState<string>("")
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(() => {
    if (!defaultValue) {
      const to = new Date()
      const from = subMonths(to, 3)
      return { from, to }
    }
    return defaultValue
  })
  const [monthSearch, setMonthSearch] = React.useState("")

  // Initialize with 3-month range if no defaultValue
  React.useEffect(() => {
    if (!defaultValue && onDateChange) {
      const to = new Date()
      const from = subMonths(to, 3)
      onDateChange({ from, to, preset: "Last 3 months" })
      setSelectionMethod("preset")
      setSelectedPreset("Last 3 months")
    }
  }, [defaultValue, onDateChange])

  // Reset to presets view when opening
  React.useEffect(() => {
    if (isOpen) {
      setActiveView("presets")
    }
  }, [isOpen])

  // Generate list of months (current month and 11 previous months)
  const months = React.useMemo(() => {
    const result = []
    const today = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      result.push(format(date, "MMMM yyyy"))
    }
    return result
  }, [])

  const filteredMonths = months.filter(month => 
    month.toLowerCase().includes(monthSearch.toLowerCase())
  )

  const formatDateDisplay = () => {
    if (!selectedRange?.from) return "Select date range"

    if (selectionMethod === "preset" && selectedPreset) {
      return selectedPreset
    }

    switch (selectionMethod) {
      case "month":
        return format(selectedRange.from, "MMMM yyyy")
      case "calendar":
      default:
        return selectedRange.to 
          ? `${format(selectedRange.from, "MMM d, yyyy")} - ${format(selectedRange.to, "MMM d, yyyy")}`
          : format(selectedRange.from, "MMM d, yyyy")
    }
  }

  const handleMonthSelect = (monthStr: string) => {
    const [month, year] = monthStr.split(" ")
    const from = new Date(`${month} 1, ${year}`)
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0)
    const newRange = { from, to }
    setSelectedRange(newRange)
    setSelectionMethod("month")
    setSelectedPreset("")
    if (onDateChange) {
      onDateChange({ ...newRange, preset: undefined })
    }
    setIsOpen(false)
  }

  const handlePresetClick = (days: number, label: string) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days)
    const newRange = { from, to }
    setSelectedRange(newRange)
    setSelectionMethod("preset")
    setSelectedPreset(label)
    if (onDateChange) {
      onDateChange({ ...newRange, preset: label })
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>{formatDateDisplay()}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[480px] p-4" 
        align="start"
        side="bottom"
        sideOffset={5}
      >
        <div className="mb-4 flex rounded-lg bg-muted p-1">
          {["presets", "months", "calendar"].map((view) => (
            <Button
              key={view}
              variant={activeView === view ? "secondary" : "ghost"}
              className={cn(
                "flex-1 capitalize transition-all duration-200",
                activeView === view 
                  ? "bg-background text-foreground shadow-sm font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveView(view as ViewType)}
            >
              {view}
            </Button>
          ))}
        </div>

        {activeView === "presets" && (
          <div className="grid grid-cols-2 gap-2">
            {PRESET_RANGES.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handlePresetClick(preset.days, preset.label)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}

        {activeView === "months" && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search month..."
                value={monthSearch}
                onChange={(e) => setMonthSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="max-h-[300px] space-y-1 overflow-auto">
              {filteredMonths.map((month) => (
                <Button
                  key={month}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleMonthSelect(month)}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div>
            <CalendarComponent
              mode="range"
              selected={selectedRange}
              onSelect={(value: DateRange | undefined) => {
                if (!value?.from) {
                  setSelectedRange(undefined)
                  return
                }

                if (!selectedRange?.from) {
                  setSelectedRange({ from: value.from, to: undefined })
                  return
                }

                if (selectedRange.from && !selectedRange.to && value.from) {
                  if (value.from.getTime() === selectedRange.from.getTime()) {
                    return
                  }

                  const newRange = {
                    from: selectedRange.from,
                    to: value.from
                  }

                  if (newRange.from > newRange.to) {
                    [newRange.from, newRange.to] = [newRange.to, newRange.from]
                  }

                  setSelectedRange(newRange)
                  setSelectionMethod("calendar")
                  setSelectedPreset("")
                  if (onDateChange) {
                    onDateChange({ ...newRange, preset: undefined })
                  }
                  setTimeout(() => setIsOpen(false), 400)
                  return
                }

                if (selectedRange.from && selectedRange.to) {
                  setSelectedRange({ from: value.from, to: undefined })
                  setSelectedPreset("")
                  setSelectionMethod("calendar")
                }
              }}
              disabled={{ before: addMonths(new Date(), -12) }}
              numberOfMonths={2}
              defaultMonth={selectedRange?.from || new Date()}
              showOutsideDays={false}
              fixedWeeks
              className="border-0"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

