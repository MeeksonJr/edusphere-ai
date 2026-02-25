"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { parseICalendar } from "@/lib/calendar-utils"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, Upload, LinkIcon, Calendar } from "lucide-react"

interface ImportCalendarDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (events: any[]) => void
}

export function ImportCalendarDialog({ open, onOpenChange, onImport }: ImportCalendarDialogProps) {
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [calendarUrl, setCalendarUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  /**
   * Save parsed events to the calendar_events table in Supabase.
   * Returns the saved events with their database IDs.
   */
  const saveEventsToDatabase = async (events: any[], source: string, feedUrl?: string) => {
    if (!supabase) throw new Error("Supabase client not available")

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("You must be logged in to import calendars")

    const userId = userData.user.id

    // If there's a feed URL, save/upsert the feed record
    if (feedUrl) {
      const { error: feedError } = await (supabase as any)
        .from("calendar_feeds")
        .upsert(
          {
            user_id: userId,
            name: source === "url" ? "Imported Calendar Feed" : "Uploaded Calendar",
            url: feedUrl,
            last_synced_at: new Date().toISOString(),
          },
          { onConflict: "user_id,url" }
        )

      if (feedError) {
        console.error("Error saving feed:", feedError)
        // Don't block the import if feed save fails
      }
    }

    // Prepare events for insertion, deduplicating by external_id
    const eventsToInsert = events.map((event) => ({
      user_id: userId,
      title: event.title,
      description: event.description || null,
      start_time: event.start instanceof Date ? event.start.toISOString() : event.start,
      end_time: event.end instanceof Date ? event.end.toISOString() : event.end,
      all_day: event.allDay || false,
      location: event.location || null,
      source: source,
      external_id: event.externalId || null,
    }))

    // Delete existing events from the same source URL to avoid duplicates on re-import
    if (feedUrl) {
      await supabase
        .from("calendar_events")
        .delete()
        .eq("user_id", userId)
        .eq("source", source)
    }

    // Insert events in batches of 50
    const savedEvents: any[] = []
    for (let i = 0; i < eventsToInsert.length; i += 50) {
      const batch = eventsToInsert.slice(i, i + 50)
      const { data, error } = await (supabase as any)
        .from("calendar_events")
        .insert(batch)
        .select()

      if (error) {
        console.error("Error saving events batch:", error)
        throw new Error(`Failed to save events: ${error.message}`)
      }

      if (data) {
        savedEvents.push(...data)
      }
    }

    return savedEvents
  }

  const handleImportFromFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an iCalendar (.ics) file to import",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const text = await file.text()
      const { events, error } = await parseICalendar(text)

      if (error) {
        throw new Error(error)
      }

      if (events.length === 0) {
        throw new Error("No events found in the calendar file")
      }

      // Save to database
      const savedEvents = await saveEventsToDatabase(events, `file:${file.name}`)

      // Map saved events to the format expected by the calendar view
      const mappedEvents = savedEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        type: "event",
        location: event.location,
        description: event.description,
        source: event.source,
      }))

      onImport(mappedEvents)
      onOpenChange(false)

      toast({
        title: "Calendar imported & saved",
        description: `Successfully imported and saved ${mappedEvents.length} events from the calendar file`,
      })
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import calendar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportFromUrl = async () => {
    if (!calendarUrl) {
      toast({
        title: "No URL provided",
        description: "Please enter a valid iCalendar URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Use our server-side proxy to bypass CORS restrictions
      const proxyUrl = `/api/calendar-proxy?url=${encodeURIComponent(calendarUrl)}`
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch calendar from URL")
      }

      const text = await response.text()
      const { events, error } = await parseICalendar(text)

      if (error) {
        throw new Error(error)
      }

      if (events.length === 0) {
        throw new Error("No events found in the calendar")
      }

      // Save to database with feed URL
      const savedEvents = await saveEventsToDatabase(events, `url:${calendarUrl}`, calendarUrl)

      // Map saved events to the format expected by the calendar view
      const mappedEvents = savedEvents.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        type: "event",
        location: event.location,
        description: event.description,
        source: event.source,
      }))

      onImport(mappedEvents)
      onOpenChange(false)

      toast({
        title: "Calendar imported & saved",
        description: `Successfully imported and saved ${mappedEvents.length} events from the URL`,
      })
    } catch (error: any) {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import calendar from URL",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle>Import Calendar</DialogTitle>
          <DialogDescription>
            Import events from an iCalendar (.ics) file or URL to add them to your calendar.
            Events are automatically saved to your account.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="file" className="mt-4">
          <TabsList className="grid grid-cols-2 bg-gray-800">
            <TabsTrigger value="file" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Upload className="h-4 w-4 mr-2" /> From File
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <LinkIcon className="h-4 w-4 mr-2" /> From URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-file">iCalendar File</Label>
              <Input
                id="calendar-file"
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-sm text-gray-400">
                Select an iCalendar (.ics) file from your device to import events.
              </p>
            </div>
            <Button
              onClick={handleImportFromFile}
              disabled={!file || loading}
              className="w-full bg-primary hover:bg-primary/80"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing & Saving...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" /> Import from File
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-url">iCalendar URL</Label>
              <Input
                id="calendar-url"
                type="url"
                placeholder="https://example.com/calendar.ics"
                value={calendarUrl}
                onChange={(e) => setCalendarUrl(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-sm text-gray-400">Enter the URL of an iCalendar (.ics) file to import events.</p>
            </div>
            <Button
              onClick={handleImportFromUrl}
              disabled={!calendarUrl || loading}
              className="w-full bg-primary hover:bg-primary/80"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing & Saving...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" /> Import from URL
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-700">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
