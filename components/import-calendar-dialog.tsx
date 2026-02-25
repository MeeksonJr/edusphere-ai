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

      onImport(events)
      onOpenChange(false)

      toast({
        title: "Calendar imported",
        description: `Successfully imported ${events.length} events from the calendar file`,
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

      onImport(events)
      onOpenChange(false)

      toast({
        title: "Calendar imported",
        description: `Successfully imported ${events.length} events from the URL`,
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
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
