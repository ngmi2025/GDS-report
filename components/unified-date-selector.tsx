"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Search } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
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

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 28 days", days: 28 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 16 months", days: 485 }, // ~16 months (485 days)
]

const DEFAULT_DATE_RANGE: DateRange = {
  from: subMonths(new Date(), 3),
  to: new Date()
}

export function UnifiedDateSelector({ onDateChange, defaultValue }: UnifiedDateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeView, setActiveView] = React.useState<ViewType>("presets")
  const [selectedRange, setSelectedRange] = React.useState<DateRange>(
    defaultValue?.from && defaultValue?.to 
      ? { from: defaultValue.from, to: defaultValue.to }
      : DEFAULT_DATE_RANGE
  )
  const [selectedPreset, setSelectedPreset] = React.useState<string>(defaultValue?.preset || "")
  const [monthSearch, setMonthSearch] = React.useState("")

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
    if (!selectedRange.from) return "Select date range"

    if (selectedPreset && activeView !== "calendar") {
      return selectedPreset
    }

    return selectedRange.to 
      ? `${format(selectedRange.from, "MMM d, yyyy")} - ${format(selectedRange.to, "MMM d, yyyy")}`
      : format(selectedRange.from, "MMM d, yyyy")
  }

  const handleMonthSelect = (monthStr: string) => {
    const [month, year] = monthStr.split(" ")
    const from = startOfMonth(new Date(`${month} 1, ${year}`))
    const to = endOfMonth(from)
    const newRange = { from, to }
    setSelectedRange(newRange)
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
    setSelectedPreset(label)
    if (onDateChange) {
      onDateChange({ ...newRange, preset: label })
    }
    setIsOpen(false)
  }

  const handleCalendarSelect = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    if (!start) return

    const today = new Date()
    const sixteenMonthsAgo = subMonths(today, 16)
    
    // Ensure the selected range is within bounds
    const from = start < sixteenMonthsAgo ? sixteenMonthsAgo : start
    const to = end || start
    
    // Validate the range
    if (to > today) return // Don't allow future dates
    if (from > to) return // Don't allow invalid ranges
    
    const newRange = { from, to }
    setSelectedRange(newRange)
    setSelectedPreset("")
    
    if (end) {
      if (onDateChange) {
        onDateChange({ ...newRange, preset: undefined })
      }
    }
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
          <CalendarIcon className="h-4 w-4" />
          <span>{formatDateDisplay()}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[800px] p-4" 
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
                className={cn(
                  "w-full justify-start",
                  selectedPreset === preset.label && "bg-accent text-accent-foreground"
                )}
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
                  className={cn(
                    "w-full justify-start",
                    selectedRange.from && format(selectedRange.from, "MMMM yyyy") === month && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleMonthSelect(month)}
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeView === "calendar" && (
          <div className="space-y-4">
            <div className="flex gap-8 justify-between">
              <div className="flex-1">
                <div className="mb-2 text-sm font-medium flex items-center justify-between">
                  <span>Start Date</span>
                  {selectedRange.from && (
                    <span className="text-muted-foreground">
                      {format(selectedRange.from, "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                <DatePicker
                  selected={selectedRange.from}
                  onChange={(date) => {
                    if (!date) return
                    const newRange = {
                      from: date,
                      to: selectedRange.to && date > selectedRange.to ? date : selectedRange.to
                    }
                    setSelectedRange(newRange)
                    setSelectedPreset("")
                    if (newRange.to) {
                      onDateChange?.({ ...newRange, preset: undefined })
                    }
                  }}
                  selectsStart
                  startDate={selectedRange.from}
                  endDate={selectedRange.to}
                  maxDate={selectedRange.to || new Date()}
                  minDate={subMonths(new Date(), 16)}
                  calendarClassName="!border-0 !shadow-none"
                  className="!w-full !border-0"
                  showPopperArrow={false}
                  inline
                  dateFormat="MMM d, yyyy"
                />
              </div>
              <div className="flex-1">
                <div className="mb-2 text-sm font-medium flex items-center justify-between">
                  <span>End Date</span>
                  {selectedRange.to && (
                    <span className="text-muted-foreground">
                      {format(selectedRange.to, "MMM d, yyyy")}
                    </span>
                  )}
                </div>
                <DatePicker
                  selected={selectedRange.to}
                  onChange={(date) => {
                    if (!date) return
                    const newRange = {
                      from: selectedRange.from || date,
                      to: date
                    }
                    setSelectedRange(newRange)
                    setSelectedPreset("")
                    if (newRange.from) {
                      onDateChange?.({ ...newRange, preset: undefined })
                    }
                  }}
                  selectsEnd
                  startDate={selectedRange.from}
                  endDate={selectedRange.to}
                  minDate={selectedRange.from || subMonths(new Date(), 16)}
                  maxDate={new Date()}
                  calendarClassName="!border-0 !shadow-none"
                  className="!w-full !border-0"
                  showPopperArrow={false}
                  inline
                  dateFormat="MMM d, yyyy"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Select start and end dates within the last 16 months
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

