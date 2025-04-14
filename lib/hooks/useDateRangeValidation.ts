import { DateRange } from "react-day-picker"
import { subDays, isBefore, startOfDay } from "date-fns"

const DATA_RETENTION_DAYS = 496 // ~16 months

export function useDateRangeValidation() {
  const oldestAvailableDate = startOfDay(subDays(new Date(), DATA_RETENTION_DAYS))

  const isDateDisabled = (date: Date) => {
    return isBefore(date, oldestAvailableDate)
  }

  const getOldestAvailableDate = () => oldestAvailableDate

  const validateDateRange = (range: DateRange) => {
    if (!range.from) return true
    return !isBefore(range.from, oldestAvailableDate)
  }

  return {
    isDateDisabled,
    getOldestAvailableDate,
    validateDateRange
  }
} 