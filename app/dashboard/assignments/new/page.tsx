"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, Sparkles, Clock, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse, isValid } from "date-fns"
import { useSupabase } from "@/components/supabase-provider"
import { generateAssignmentApproach, trackAIUsage } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Literature",
  "Economics",
  "Psychology",
  "Sociology",
  "Philosophy",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
  "Other",
]

export default function NewAssignmentPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [showCalendar, setShowCalendar] = useState(false)
  const [manualDateInput, setManualDateInput] = useState("")
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    priority: "medium",
    due_date: "",
    ai_summary: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    setDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, due_date: date.toISOString() }))
      setManualDateInput(format(date, "MM/dd/yyyy HH:mm"))
    } else {
      setFormData((prev) => ({ ...prev, due_date: null }))
      setManualDateInput("")
    }
    setShowCalendar(false)
  }

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setManualDateInput(input)

    // Try to parse the date
    try {
      // Try different formats
      let parsedDate: Date | null = null

      // Try MM/DD/YYYY HH:MM format
      parsedDate = parse(input, "MM/dd/yyyy HH:mm", new Date())

      if (!isValid(parsedDate)) {
        // Try MM/DD/YYYY format
        parsedDate = parse(input, "MM/dd/yyyy", new Date())
      }

      if (!isValid(parsedDate)) {
        // Try YYYY-MM-DD format
        parsedDate = parse(input, "yyyy-MM-dd", new Date())
      }

      if (isValid(parsedDate)) {
        setDate(parsedDate)
        setFormData((prev) => ({ ...prev, due_date: parsedDate.toISOString() }))
      } else {
        // If not valid, just update the input field but don't set the date
        setFormData((prev) => ({ ...prev, due_date: null }))
      }
    } catch (error) {
      // If parsing fails, just update the input field but don't set the date
      setFormData((prev) => ({ ...prev, due_date: null }))
    }
  }

  const generateAiSummary = async () => {
    if (!formData.title || !formData.description) {
      setError("Please provide a title and description to generate AI summary")
      return
    }

    setAiLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in to use the AI features")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate AI approach
      const aiSummary = await generateAssignmentApproach(formData.title, formData.description, formData.subject)

      setFormData((prev) => ({ ...prev, ai_summary: aiSummary }))

      toast({
        title: "AI Summary Generated",
        description: "The AI has analyzed your assignment and provided an approach.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to generate AI summary")
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI summary",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      // Create assignment data object, ensuring due_date is null if not set
      const assignmentData = {
        ...formData,
        user_id: user.id,
        status: "ongoing",
        due_date: formData.due_date || null, // Ensure null instead of empty string
      }

      const { error } = await supabase.from("assignments").insert([assignmentData])

      if (error) throw error

      toast({
        title: "Assignment Created",
        description: "Your new assignment has been created successfully.",
      })

      router.push("/dashboard/assignments")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to create assignment")
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Link href="/dashboard/assignments" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Assignments
        </Link>
        <h1 className="text-3xl font-bold neon-text-purple">Create New Assignment</h1>
        <p className="text-gray-400 mt-1">Add details about your academic task</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          {error && <div className="bg-red-900/30 border border-red-800 text-white p-3 rounded-md mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Assignment Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Math Homework Chapter 5"
                className="bg-gray-900 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe what you need to do for this assignment"
                className="bg-gray-900 border-gray-700 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Select value={formData.subject} onValueChange={(value) => handleSelectChange("subject", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">
                Due Date
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    ref={dateInputRef}
                    id="manual_date"
                    value={manualDateInput}
                    onChange={handleManualDateChange}
                    placeholder="MM/DD/YYYY HH:MM or YYYY-MM-DD"
                    className="bg-gray-900 border-gray-700 pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gray-700"
                      onClick={() => setShowCalendar(!showCalendar)}
                      type="button"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      className="bg-gray-900"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-gray-400">Enter date manually (MM/DD/YYYY HH:MM) or select from calendar</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="ai_summary" className="text-sm font-medium">
                  AI-Generated Approach
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAiSummary}
                  disabled={aiLoading || !formData.title || !formData.description}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {aiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {aiLoading ? "Generating..." : "Generate"}
                </Button>
              </div>
              <Textarea
                id="ai_summary"
                name="ai_summary"
                value={formData.ai_summary}
                onChange={handleChange}
                placeholder="Generate AI suggestions on how to approach this assignment"
                className="bg-gray-900 border-gray-700 min-h-[100px]"
                readOnly={aiLoading}
              />
              <p className="text-xs text-gray-400">
                Let AI analyze your assignment and suggest the best approach to complete it.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/assignments">
                <Button variant="outline" className="border-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-primary hover:bg-primary/80" disabled={loading}>
                {loading ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
