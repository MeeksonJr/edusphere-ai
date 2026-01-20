"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

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
      if (!supabase) return
      try {
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
          setUser({ ...data.user, profile })
        }
      } catch (error) {
        console.error("Error loading user:", error)
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user || !supabase) return

      try {
        setLoading(true)
        const { data, error } = await supabase.from("assignments").select("*").eq("user_id", user.id)

        if (error) throw error

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
      setSelectedEvent(event)
      setIsAIDialogOpen(true)
    } else {
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

  const upcomingAssignments = assignments
    .filter((a) => a.status !== "completed")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Calendar</span>
          </h1>
          <p className="text-white/70">Manage your schedule and deadlines</p>
        </div>
      </ScrollReveal>

      {/* Calendar Controls */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                onClick={handleToday}
              >
                Today
              </Button>
              <h2 className="text-xl font-semibold text-white ml-2">{formatDateRange()}</h2>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="glass-surface border-white/20 rounded-lg p-1 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    view === "month"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => handleViewChange("month")}
                >
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    view === "week"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => handleViewChange("week")}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    view === "day"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                  onClick={() => handleViewChange("day")}
                >
                  Day
                </Button>
              </div>
              <Button
                variant="outline"
                className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                Import
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={() => router.push("/dashboard/assignments/new")}
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                New
              </Button>
            </div>
          </div>
        </GlassSurface>
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-4 md:p-6">
              <CalendarView
                view={view}
                date={currentDate}
                events={[...assignments, ...events]}
                onEventClick={handleEventClick}
                isLoading={loading}
              />
            </GlassSurface>
          </ScrollReveal>
        </div>

        {/* Upcoming Assignments Sidebar */}
        <div>
          <ScrollReveal direction="up" delay={0.3}>
            <GlassSurface className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upcoming</h2>
                <Sparkles className="h-5 w-5 text-purple-400" aria-hidden="true" />
              </div>
              {loading ? (
                <LoadingSpinner size="sm" text="Loading..." />
              ) : upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment, index) => (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-lg glass-surface border-white/10 hover:border-purple-500/30 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedEvent(assignment)
                        setIsAIDialogOpen(true)
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 flex-shrink-0">
                          <CheckSquare className="h-full w-full text-purple-400" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-white/60">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            <span>{new Date(assignment.start).toLocaleDateString()}</span>
                          </div>
                          {assignment.priority && (
                            <Badge
                              className={`mt-2 text-xs ${
                                assignment.priority === "high"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : assignment.priority === "medium"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-green-500/20 text-green-400 border-green-500/30"
                              }`}
                            >
                              {assignment.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarComponent className="h-12 w-12 text-white/20 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-white/60 text-sm">No upcoming assignments</p>
                </div>
              )}
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>

      {/* Dialogs */}
      <ImportCalendarDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportSuccess}
      />
      <CalendarAIDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        event={selectedEvent}
      />
    </div>
  )
}
