"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useDateRangeValidation } from "@/lib/hooks/useDateRangeValidation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DateRangePickerProps {
  date: DateRange
  onSelect: (range: DateRange | undefined) => void
}

export function DateRangePicker({ date, onSelect }: DateRangePickerProps) {
  const { isDateDisabled, getOldestAvailableDate } = useDateRangeValidation()

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Data available from {format(getOldestAvailableDate(), "LLL dd, y")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Google Search Console data is only available for the last 16 months</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            numberOfMonths={2}
            disabled={isDateDisabled}
            fromDate={getOldestAvailableDate()}
            toDate={new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

