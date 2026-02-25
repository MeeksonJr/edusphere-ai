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
import { EventDetailDialog } from "@/components/event-detail-dialog"
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
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false)
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
        const { data, error } = await (supabase as any).from("assignments").select("*").eq("user_id", user.id)

        if (error) throw error

        const assignmentEvents = data.map((assignment: any) => ({
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

        setAssignments(assignmentEvents.filter((event: any) => event.start !== null))

        const { data: eventsData, error: eventsError } = await (supabase as any)
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)

        if (eventsError) throw eventsError

        const calendarEvents =
          eventsData?.map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start_time),
            end: new Date(event.end_time),
            type: "event",
            location: event.location,
            description: event.description,
            source: event.source,
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
    setSelectedEvent(event)
    setIsEventDetailOpen(true)
  }

  const handleEventDelete = (eventId: string) => {
    // Remove from assignments or events state
    setAssignments((prev) => prev.filter((a) => a.id !== eventId))
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  const handleOpenAIFromDetail = (event: any) => {
    setSelectedEvent(event)
    setIsAIDialogOpen(true)
  }

  const handleImportSuccess = (importedEvents: any[]) => {
    // Replace events from the same source, or just add new ones
    setEvents((prev) => {
      const importedIds = new Set(importedEvents.map((e) => e.id))
      const filtered = prev.filter((e) => !importedIds.has(e.id))
      return [...filtered, ...importedEvents]
    })
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

  const upcomingImportedEvents = events
    .filter((e) => new Date(e.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const [showAllAssignments, setShowAllAssignments] = useState(false)
  const [showAllImported, setShowAllImported] = useState(false)

  const displayedAssignments = showAllAssignments ? upcomingAssignments : upcomingAssignments.slice(0, 5)
  const displayedImported = showAllImported ? upcomingImportedEvents : upcomingImportedEvents.slice(0, 5)

  const renderEventCard = (item: any, icon: React.ReactNode, gradient: string) => (
    <div
      key={item.id}
      className="p-3 rounded-lg glass-surface border-foreground/10 hover:border-cyan-500/30 transition-colors cursor-pointer group"
      onClick={() => {
        setSelectedEvent(item)
        setIsEventDetailOpen(true)
      }}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 rounded-lg ${gradient} p-2 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-cyan-400 transition-colors truncate">
            {item.title}
          </h3>
          <div className="flex items-center space-x-2 text-xs text-foreground/60">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{new Date(item.start).toLocaleDateString()}</span>
          </div>
          {item.priority && (
            <Badge
              className={`mt-2 text-xs ${item.priority === "high"
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : item.priority === "medium"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-green-500/20 text-green-400 border-green-500/30"
                }`}
            >
              {item.priority}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">Calendar</span>
          </h1>
          <p className="text-foreground/70">Manage your schedule and deadlines</p>
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
                className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground"
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground"
                onClick={handleToday}
              >
                Today
              </Button>
              <h2 className="text-xl font-semibold text-white ml-2">{formatDateRange()}</h2>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="glass-surface border-foreground/20 rounded-lg p-1 flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "month"
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                    }`}
                  onClick={() => handleViewChange("month")}
                >
                  Month
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "week"
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                    }`}
                  onClick={() => handleViewChange("week")}
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${view === "day"
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                    }`}
                  onClick={() => handleViewChange("day")}
                >
                  Day
                </Button>
              </div>
              <Button
                variant="outline"
                className="glass-surface border-foreground/20 hover:border-cyan-500/50 text-foreground"
                onClick={() => setIsImportDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                Import
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-foreground"
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

        {/* Upcoming Sidebar */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ScrollReveal direction="up" delay={0.3}>
            <GlassSurface className="p-6">
              <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Upcoming</h2>
                  <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                </div>

                {loading ? (
                  <LoadingSpinner size="sm" text="Loading..." />
                ) : (
                  <div className="space-y-6">
                    {/* Assignments Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-cyan-400" aria-hidden="true" />
                          <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                            Assignments
                          </h3>
                        </div>
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {upcomingAssignments.length}
                        </Badge>
                      </div>
                      {displayedAssignments.length > 0 ? (
                        <div className="space-y-2">
                          {displayedAssignments.map((assignment) =>
                            renderEventCard(
                              assignment,
                              <CheckSquare className="h-full w-full text-cyan-400" aria-hidden="true" />,
                              "bg-gradient-to-br from-cyan-500/20 to-blue-500/20"
                            )
                          )}
                          {upcomingAssignments.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs"
                              onClick={() => setShowAllAssignments(!showAllAssignments)}
                            >
                              {showAllAssignments
                                ? "Show Less"
                                : `View All (${upcomingAssignments.length})`}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-foreground/40 text-sm text-center py-3">No upcoming assignments</p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-foreground/10" />

                    {/* Imported Events Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarComponent className="h-4 w-4 text-pink-400" aria-hidden="true" />
                          <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                            Imported Events
                          </h3>
                        </div>
                        <Badge className="text-xs bg-pink-500/20 text-pink-400 border-pink-500/30">
                          {upcomingImportedEvents.length}
                        </Badge>
                      </div>
                      {displayedImported.length > 0 ? (
                        <div className="space-y-2">
                          {displayedImported.map((event) =>
                            renderEventCard(
                              event,
                              <CalendarComponent className="h-full w-full text-pink-400" aria-hidden="true" />,
                              "bg-gradient-to-br from-pink-500/20 to-purple-500/20"
                            )
                          )}
                          {upcomingImportedEvents.length > 5 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 text-xs"
                              onClick={() => setShowAllImported(!showAllImported)}
                            >
                              {showAllImported
                                ? "Show Less"
                                : `View All (${upcomingImportedEvents.length})`}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CalendarComponent className="h-8 w-8 text-foreground/15 mx-auto mb-2" aria-hidden="true" />
                          <p className="text-foreground/40 text-sm">No imported events</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-cyan-400 hover:text-cyan-300 text-xs"
                            onClick={() => setIsImportDialogOpen(true)}
                          >
                            <Upload className="h-3 w-3 mr-1" /> Import Calendar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
      <EventDetailDialog
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
        event={selectedEvent}
        onDelete={handleEventDelete}
        onOpenAI={handleOpenAIFromDetail}
      />
      <CalendarAIDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        event={selectedEvent}
      />
    </div>
  )
}
