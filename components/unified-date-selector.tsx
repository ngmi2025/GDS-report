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
  defaultValue?: DateRange
  onDateChange?: (range: DateRange) => void
}

type ViewType = "presets" | "months" | "calendar"

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 3 months", days: 90 },
  { label: "Last 16 months", days: 485 }, // ~16 months (485 days)
]

export function UnifiedDateSelector({ onDateChange, defaultValue }: UnifiedDateSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeView, setActiveView] = React.useState<ViewType>("presets")
  const [selectedRange, setSelectedRange] = React.useState<DateRange | undefined>(() => {
    // Set default to last 16 months if no defaultValue provided
    if (!defaultValue) {
      const to = new Date()
      const from = subMonths(to, 16)
      return { from, to }
    }
    return defaultValue
  })
  const [monthSearch, setMonthSearch] = React.useState("")

  // Initialize with 16-month range if no defaultValue
  React.useEffect(() => {
    if (!defaultValue && onDateChange) {
      const to = new Date()
      const from = subMonths(to, 16)
      onDateChange({ from, to })
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

  const handlePresetClick = (days: number) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - days)
    const newRange = { from, to }
    setSelectedRange(newRange)
    if (onDateChange) {
      onDateChange(newRange)
    }
    setIsOpen(false)
  }

  const handleMonthSelect = (monthStr: string) => {
    const [month, year] = monthStr.split(" ")
    const from = new Date(`${month} 1, ${year}`)
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 0)
    const newRange = { from, to }
    setSelectedRange(newRange)
    if (onDateChange) {
      onDateChange(newRange)
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
          <span>
            {selectedRange?.from ? (
              selectedRange.to ? (
                `${format(selectedRange.from, "MMM d, yyyy")} - ${format(selectedRange.to, "MMM d, yyyy")}`
              ) : (
                format(selectedRange.from, "MMM d, yyyy")
              )
            ) : (
              "Select date range"
            )}
          </span>
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
                onClick={() => handlePresetClick(preset.days)}
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
            <div className="mb-4 flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm">
                  From: {selectedRange?.from ? format(selectedRange.from, "MMM d, yyyy") : "Select date"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="text-sm">
                  To: {selectedRange?.to ? format(selectedRange.to, "MMM d, yyyy") : "Select date"}
                </span>
              </div>
            </div>
            <div className="[&_.rdp]:bg-background [&_.rdp-caption]:mb-4 [&_.rdp-caption_select]:hidden [&_.rdp-nav]:hidden [&_.rdp-table]:w-full [&_.rdp-head_cell]:text-muted-foreground [&_.rdp-cell]:p-0 [&_.rdp-tbody]:divide-y [&_.rdp-row]:divide-x [&_.rdp-day]:h-12 [&_.rdp-day]:w-12 [&_.rdp-day]:text-sm [&_.rdp-day]:font-normal [&_.rdp-day]:transition-colors [&_.rdp-day]:cursor-pointer [&_.rdp-day_button]:h-full [&_.rdp-day_button]:w-full [&_.rdp-day_button]:p-0 [&_.rdp-day_button]:font-normal [&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground [&_.rdp-day_today]:border-2 [&_.rdp-day_today]:border-primary [&_.rdp-day_outside]:text-muted-foreground/50 [&_.rdp-day_outside]:opacity-50 [&_.rdp-day_range_start]:bg-primary [&_.rdp-day_range_start]:text-primary-foreground [&_.rdp-day_range_end]:bg-primary [&_.rdp-day_range_end]:text-primary-foreground [&_.rdp-day_range_middle]:bg-accent/50 [&_.rdp-day_range_middle]:text-accent-foreground [&_.rdp-cell]:border-border [&_.rdp-head_cell]:h-12 [&_.rdp-head_cell]:w-12 [&_.rdp-tbody]:border-x [&_.rdp-tbody]:border-b [&_.rdp-head]:border-x [&_.rdp-head]:border-t [&_.rdp-button]:flex [&_.rdp-button]:h-full [&_.rdp-button]:w-full [&_.rdp-button]:items-center [&_.rdp-button]:justify-center [&_.rdp-day]:flex [&_.rdp-day]:items-center [&_.rdp-day]:justify-center [&_.rdp-day]:p-0 [&_.rdp-day]:relative [&_.rdp-day_button]:absolute [&_.rdp-day_button]:inset-0 [&_.rdp-day_button]:flex [&_.rdp-day_button]:items-center [&_.rdp-day_button]:justify-center [&_.rdp-head_cell]:flex [&_.rdp-head_cell]:items-center [&_.rdp-head_cell]:justify-center [&_.rdp-cell]:flex [&_.rdp-cell]:items-center [&_.rdp-cell]:justify-center [&_.rdp-day_button]:hover:bg-accent [&_.rdp-day_button]:hover:text-accent-foreground">
              <CalendarComponent
                mode="range"
                selected={selectedRange}
                onSelect={(value: DateRange | undefined) => {
                  if (!value?.from) {
                    setSelectedRange(undefined);
                    return;
                  }

                  // If we don't have a from date yet, or we're starting a new selection
                  if (!selectedRange?.from) {
                    setSelectedRange({ from: value.from, to: undefined });
                    return;
                  }

                  // If we have a from date but no to date, complete the range
                  if (selectedRange.from && !selectedRange.to && value.from) {
                    // Don't allow selecting the same date
                    if (value.from.getTime() === selectedRange.from.getTime()) {
                      return;
                    }

                    const newRange = {
                      from: selectedRange.from,
                      to: value.from
                    };

                    // Swap dates if needed
                    if (newRange.from > newRange.to) {
                      [newRange.from, newRange.to] = [newRange.to, newRange.from];
                    }

                    setSelectedRange(newRange);
                    if (onDateChange) {
                      onDateChange(newRange);
                    }
                    setTimeout(() => setIsOpen(false), 400);
                    return;
                  }

                  // If we already have both dates, start a new selection
                  if (selectedRange.from && selectedRange.to) {
                    setSelectedRange({ from: value.from, to: undefined });
                  }
                }}
                disabled={{ before: addMonths(new Date(), -12) }}
                numberOfMonths={2}
                defaultMonth={selectedRange?.from || new Date()}
                showOutsideDays={false}
                fixedWeeks
                className="border-0"
                classNames={{
                  months: "flex space-x-2",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "flex items-center justify-between",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-12 font-medium text-[0.8rem] h-12 flex items-center justify-center",
                  row: "flex w-full mt-2",
                  cell: "relative flex h-12 w-12 items-center justify-center p-0",
                  day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "border-2 border-primary font-medium",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible",
                  day_range_middle: "bg-accent/50 text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                  day_range_end: "bg-primary text-primary-foreground rounded-r-md",
                  day_range_start: "bg-primary text-primary-foreground rounded-l-md"
                }}
                footer={
                  <div className="mt-3 text-sm font-medium text-muted-foreground">
                    {selectedRange?.from && !selectedRange?.to ? (
                      <span className="text-primary">Now select the end date</span>
                    ) : !selectedRange?.from ? (
                      "Select start date"
                    ) : null}
                  </div>
                }
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

