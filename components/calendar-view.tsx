"use client"

import { useState, useEffect } from "react"

interface CalendarViewProps {
  view: "month" | "week" | "day"
  date: Date
  events: any[]
  onEventClick: (event: any) => void
  isLoading?: boolean
}

export function CalendarView({ view, date, events, onEventClick, isLoading = false }: CalendarViewProps) {
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [hours, setHours] = useState<string[]>([])

  useEffect(() => {
    // Generate hours for day and week view
    const hoursArray = []
    for (let i = 0; i < 24; i++) {
      hoursArray.push(`${i.toString().padStart(2, "0")}:00`)
    }
    setHours(hoursArray)

    // Generate days for month view
    if (view === "month") {
      const year = date.getFullYear()
      const month = date.getMonth()

      // Get the first day of the month
      const firstDay = new Date(year, month, 1)
      // Get the last day of the month
      const lastDay = new Date(year, month + 1, 0)

      // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
      const firstDayOfWeek = firstDay.getDay()

      // Calculate the number of days to show from the previous month
      const daysFromPrevMonth = firstDayOfWeek

      // Calculate the start date (might be from the previous month)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - daysFromPrevMonth)

      // Generate 42 days (6 weeks) to ensure we have enough days to display
      const days = []
      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        days.push(currentDate)
      }

      setCalendarDays(days)
    } else if (view === "week") {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay())

      // Generate 7 days for the week view
      const days = []
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek)
        currentDate.setDate(startOfWeek.getDate() + i)
        days.push(currentDate)
      }

      setCalendarDays(days)
    } else if (view === "day") {
      // Just use the current date for day view
      setCalendarDays([new Date(date)])
    }
  }, [view, date])

  const getEventsForDate = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const getEventsForHour = (day: Date, hour: string) => {
    const hourNum = Number.parseInt(hour.split(":")[0])
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear() &&
        eventDate.getHours() === hourNum
      )
    })
  }

  const isToday = (day: Date) => {
    const today = new Date()
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === date.getMonth()
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {view === "month" ? (
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center py-2 font-medium text-sm">
                {day}
              </div>
            ))}
            {Array(35)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-28 bg-gray-800/50 rounded-md"></div>
              ))}
          </div>
        ) : (
          <div className="h-[600px] bg-gray-800/50 rounded-md"></div>
        )}
      </div>
    )
  }

  if (view === "month") {
    return (
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center py-2 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-800">
          {calendarDays.slice(0, 35).map((day, index) => {
            const dayEvents = getEventsForDate(day)
            return (
              <div
                key={index}
                className={`min-h-28 p-1 ${isToday(day) ? "bg-blue-900/20" : isCurrentMonth(day) ? "bg-gray-900" : "bg-gray-900/50 text-gray-500"
                  }`}
              >
                <div className="text-right p-1">
                  <span
                    className={`text-sm inline-flex items-center justify-center ${isToday(day) ? "h-6 w-6 rounded-full bg-blue-600 text-white" : ""
                      }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={event.id || `month-event-${index}-${eventIndex}`}
                      onClick={() => onEventClick(event)}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${event.type === "assignment"
                          ? event.status === "completed"
                            ? "bg-green-900/30 text-green-400"
                            : event.priority === "high"
                              ? "bg-red-900/30 text-red-400"
                              : event.priority === "medium"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-primary/20 text-primary"
                          : "bg-blue-900/30 text-blue-400"
                        }`}
                    >
                      {event.start &&
                        new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-400 pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (view === "week") {
    return (
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-800">
          <div className="py-2 pl-2 font-medium text-sm"></div>
          {calendarDays.map((day, index) => (
            <div key={index} className="text-center py-2 font-medium text-sm">
              <div>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]}</div>
              <div
                className={`text-sm inline-flex items-center justify-center mt-1 ${isToday(day) ? "h-6 w-6 rounded-full bg-blue-600 text-white" : ""
                  }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-800 min-h-[60px]">
              <div className="py-1 pl-2 text-xs text-gray-400 border-r border-gray-800">{hour}</div>
              {calendarDays.map((day, dayIndex) => {
                const hourEvents = getEventsForHour(day, hour)
                return (
                  <div
                    key={dayIndex}
                    className={`p-1 border-r border-gray-800 ${isToday(day) ? "bg-blue-900/10" : ""}`}
                  >
                    {hourEvents.map((event, eventIndex) => (
                      <div
                        key={event.id || `week-event-${dayIndex}-${hour}-${eventIndex}`}
                        onClick={() => onEventClick(event)}
                        className={`text-xs p-1 rounded truncate cursor-pointer ${event.type === "assignment"
                            ? event.status === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : event.priority === "high"
                                ? "bg-red-900/30 text-red-400"
                                : event.priority === "medium"
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "bg-primary/20 text-primary"
                            : "bg-blue-900/30 text-blue-400"
                          }`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Day view
  return (
    <div className="bg-gray-900 rounded-md overflow-hidden">
      <div className="border-b border-gray-800 py-2 text-center font-medium">
        {calendarDays[0]?.toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(calendarDays[0], hour)
          return (
            <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-gray-800 min-h-[60px]">
              <div className="py-1 pl-2 text-xs text-gray-400 border-r border-gray-800">{hour}</div>
              <div className="p-1">
                {hourEvents.map((event, eventIndex) => (
                  <div
                    key={event.id || `day-event-${hour}-${eventIndex}`}
                    onClick={() => onEventClick(event)}
                    className={`p-2 rounded mb-1 cursor-pointer ${event.type === "assignment"
                        ? event.status === "completed"
                          ? "bg-green-900/30 text-green-400"
                          : event.priority === "high"
                            ? "bg-red-900/30 text-red-400"
                            : event.priority === "medium"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-primary/20 text-primary"
                        : "bg-blue-900/30 text-blue-400"
                      }`}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.description && <div className="text-xs mt-1">{event.description}</div>}
                    {event.location && <div className="text-xs mt-1">📍 {event.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
