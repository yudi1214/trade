"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type CalendarProps = {
  mode?: "single" | "range" | "multiple"
  selected?: { from?: Date; to?: Date } | Date | Date[]
  onSelect?: (date: { from?: Date; to?: Date } | Date | Date[] | undefined) => void
  className?: string
  numberOfMonths?: number
  defaultMonth?: Date
  initialFocus?: boolean
  locale?: any
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  numberOfMonths = 1,
  defaultMonth = new Date(),
  initialFocus = false,
  locale,
}: CalendarProps) {
  const [month, setMonth] = React.useState(defaultMonth)
  const [selectedDates, setSelectedDates] = React.useState<{ from?: Date; to?: Date }>({
    from: selected && "from" in (selected as any) ? (selected as any).from : undefined,
    to: selected && "to" in (selected as any) ? (selected as any).to : undefined,
  })

  const handlePreviousMonth = () => {
    const newMonth = new Date(month)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = new Date(month)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setMonth(newMonth)
  }

  const handleDateClick = (date: Date) => {
    if (mode === "range") {
      if (!selectedDates.from || (selectedDates.from && selectedDates.to)) {
        // Start new range
        const newSelected = { from: date, to: undefined }
        setSelectedDates(newSelected)
        onSelect?.(newSelected)
      } else {
        // Complete range
        const newSelected = {
          from: selectedDates.from,
          to: date < selectedDates.from ? selectedDates.from : date,
        }
        setSelectedDates(newSelected)
        onSelect?.(newSelected)
      }
    } else if (mode === "single") {
      onSelect?.(date)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = (monthOffset = 0) => {
    const currentMonth = new Date(month)
    currentMonth.setMonth(currentMonth.getMonth() + monthOffset)

    const year = currentMonth.getFullYear()
    const monthIndex = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, monthIndex)
    const firstDay = getFirstDayOfMonth(year, monthIndex)

    const days = []
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

    // Month name
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ]

    // Header with month and year
    const header = (
      <div className="flex items-center justify-between mb-4">
        {monthOffset === 0 && (
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="font-medium">
          {monthNames[monthIndex]} {year}
        </div>
        {monthOffset === numberOfMonths - 1 && (
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        {monthOffset > 0 && monthOffset < numberOfMonths - 1 && <div className="w-9"></div>}
      </div>
    )

    // Weekday headers
    const weekdayHeaders = (
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((day, i) => (
          <div key={i} className="text-center text-xs text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>
    )

    // Calendar grid
    const calendarGrid = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarGrid.push(<div key={`empty-${i}`} className="h-9"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day)
      const isToday = new Date().toDateString() === date.toDateString()

      // Check if date is selected
      let isSelected = false
      let isRangeStart = false
      let isRangeEnd = false
      let isInRange = false

      if (mode === "range" && selectedDates.from && selectedDates.to) {
        isRangeStart = date.toDateString() === selectedDates.from.toDateString()
        isRangeEnd = date.toDateString() === selectedDates.to.toDateString()
        isInRange = date >= selectedDates.from && date <= selectedDates.to
        isSelected = isRangeStart || isRangeEnd
      } else if (mode === "range" && selectedDates.from) {
        isSelected = date.toDateString() === selectedDates.from.toDateString()
        isRangeStart = isSelected
      } else if (mode === "single" && selected instanceof Date) {
        isSelected = date.toDateString() === selected.toDateString()
      }

      calendarGrid.push(
        <div
          key={day}
          className={cn(
            "h-9 w-9 p-0 font-normal flex items-center justify-center rounded-md text-sm",
            isSelected && "bg-primary text-primary-foreground",
            !isSelected && isToday && "bg-accent text-accent-foreground",
            !isSelected && !isToday && "text-foreground hover:bg-accent hover:text-accent-foreground",
            isInRange && !isSelected && "bg-accent/50",
            "aria-selected:bg-accent",
          )}
          onClick={() => handleDateClick(date)}
          role="button"
          tabIndex={0}
          aria-selected={isSelected}
        >
          {day}
        </div>,
      )
    }

    return (
      <div className="p-3" key={`month-${monthOffset}`}>
        {header}
        {weekdayHeaders}
        <div className="grid grid-cols-7 gap-1">{calendarGrid}</div>
      </div>
    )
  }

  return (
    <div className={cn("border rounded-md bg-background", className)}>
      <div className={cn("flex", numberOfMonths > 1 && "space-x-4")}>
        {Array.from({ length: numberOfMonths }).map((_, i) => renderCalendar(i))}
      </div>
    </div>
  )
}

