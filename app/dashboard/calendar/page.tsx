"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  CheckSquare,
  Clock,
  CalendarIcon as CalendarComponent,
  Sparkles,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { CalendarView } from "@/components/calendar-view"
import { ImportCalendarDialog } from "@/components/import-calendar-dialog"
import { CalendarAIDialog } from "@/components/calendar-ai-dialog"

export default function CalendarPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        setUser({ ...data.user, profile })
      }
    }

    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) return

      try {
        setLoading(true)
        const { data, error } = await supabase.from("assignments").select("*").eq("user_id", user.id)

        if (error) throw error

        // Transform assignments to calendar events
        const assignmentEvents = data.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          start: assignment.due_date ? new Date(assignment.due_date) : null,
          end: assignment.due_date ? new Date(assignment.due_date) : null,
          type: "assignment",
          status: assignment.status,
          priority: assignment.priority,
          subject: assignment.subject,
          description: assignment.description,
        }))

        setAssignments(assignmentEvents.filter((event) => event.start !== null))

        // Fetch calendar events
        const { data: eventsData, error: eventsError } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)

        if (eventsError) throw eventsError

        const calendarEvents =
          eventsData?.map((event) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            type: "event",
            location: event.location,
            description: event.description,
          })) || []

        setEvents(calendarEvents)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch calendar data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAssignments()
    }
  }, [user, supabase, toast])

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleViewChange = (newView: "month" | "week" | "day") => {
    setView(newView)
  }

  const handleEventClick = (event: any) => {
    if (event.type === "assignment") {
      // Option to view assignment details or get AI assistance
      setSelectedEvent(event)
      setIsAIDialogOpen(true)
    } else {
      // For regular events, just navigate to the event detail
      // In a real app, you might have an event detail page
      toast({
        title: event.title,
        description: event.description || "No description available",
      })
    }
  }

  const handleImportSuccess = (importedEvents: any[]) => {
    setEvents((prev) => [...prev, ...importedEvents])
    toast({
      title: "Calendar Imported",
      description: `Successfully imported ${importedEvents.length} events.`,
    })
  }

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }

    if (view === "month") {
      return currentDate.toLocaleDateString(undefined, options)
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startMonth = startOfWeek.toLocaleDateString(undefined, { month: "short" })
      const endMonth = endOfWeek.toLocaleDateString(undefined, { month: "short" })

      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`
    } else {
      return currentDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-blue">Calendar</h1>
        <p className="text-gray-400 mt-1">Manage your schedule and deadlines</p>
      </div>

      <Card className="glass-card mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" className="border-gray-700" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-700" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-gray-700" onClick={handleToday}>
                Today
              </Button>
              <h2 className="text-xl font-semibold ml-2">{formatDateRange()}</h2>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <div className="bg-gray-800 rounded-md p-1 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "month" ? "bg-gray-700" : ""}`}
                  onClick={() => handleViewChange("month")}
                >
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "week" ? "bg-gray-700" : ""}`}
                  onClick={() => handleViewChange("week")}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "day" ? "bg-gray-700" : ""}`}
                  onClick={() => handleViewChange("day")}
                >
                  Day
                </Button>
              </div>
              <Button variant="outline" className="border-gray-700" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                className="bg-primary hover:bg-primary/80"
                onClick={() => router.push("/dashboard/assignments/new")}
              >
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <CalendarView
              view={view}
              date={currentDate}
              events={[...assignments, ...events]}
              onEventClick={handleEventClick}
              isLoading={loading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 animate-pulse">
                    <div className="bg-gray-800 p-2 rounded-md h-9 w-9"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : assignments.filter((a) => a.status !== "completed").length > 0 ? (
              <div className="space-y-4">
                {assignments
                  .filter((a) => a.status !== "completed")
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .slice(0, 5)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-start space-x-4 cursor-pointer hover:bg-gray-800/50 p-2 rounded-md transition-colors"
                      onClick={() => {
                        setSelectedEvent(assignment)
                        setIsAIDialogOpen(true)
                      }}
                    >
                      <div className="bg-gray-800 p-2 rounded-md">
                        <CheckSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{assignment.title}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="mr-1 h-3 w-3" />
                            {assignment.start ? new Date(assignment.start).toLocaleDateString() : "No due date"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center">
                            {assignment.subject && (
                              <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{assignment.subject}</span>
                            )}
                            {assignment.priority && (
                              <span
                                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  assignment.priority === "high"
                                    ? "bg-red-900/30 text-red-400"
                                    : assignment.priority === "medium"
                                      ? "bg-yellow-900/30 text-yellow-400"
                                      : "bg-green-900/30 text-green-400"
                                }`}
                              >
                                {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                              </span>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No upcoming assignments</p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary/80"
                  onClick={() => router.push("/dashboard/assignments/new")}
                >
                  Create Assignment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-4 animate-pulse">
                    <div className="bg-gray-800 p-2 rounded-md h-9 w-9"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="flex items-start space-x-4 p-2 rounded-md">
                      <div className="bg-gray-800 p-2 rounded-md">
                        <CalendarComponent className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400">{event.description || "No description"}</p>
                        {event.location && (
                          <div className="flex items-center pt-1">
                            <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No upcoming events</p>
                <Button className="mt-4 bg-primary hover:bg-primary/80" onClick={() => setIsImportDialogOpen(true)}>
                  Import Calendar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isImportDialogOpen && (
        <ImportCalendarDialog
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {isAIDialogOpen && selectedEvent && (
        <CalendarAIDialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen} event={selectedEvent} />
      )}
    </div>
  )
}
