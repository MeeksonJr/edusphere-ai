"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useSupabase } from "@/components/supabase-provider"
import { cn } from "@/lib/utils"
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

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(undefined)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    priority: "medium",
    due_date: "",
    ai_summary: "",
    status: "ongoing",
  })

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("assignments").select("*").eq("id", params.id).single()

        if (error) throw error

        if (data) {
          setFormData({
            title: data.title || "",
            description: data.description || "",
            subject: data.subject || "",
            priority: data.priority || "medium",
            due_date: data.due_date || "",
            ai_summary: data.ai_summary || "",
            status: data.status || "ongoing",
          })

          if (data.due_date) {
            setDate(new Date(data.due_date))
          }
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch assignment")
        toast({
          title: "Error",
          description: error.message || "Failed to fetch assignment",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [supabase, params.id, toast])

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
    } else {
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
        due_date: formData.due_date || null, // Ensure null instead of empty string
      }

      const { error } = await supabase.from("assignments").update(assignmentData).eq("id", params.id)

      if (error) throw error

      toast({
        title: "Assignment Updated",
        description: "Your assignment has been updated successfully.",
      })

      router.push(`/dashboard/assignments/${params.id}`)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to update assignment")
      toast({
        title: "Error",
        description: error.message || "Failed to update assignment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/assignments/${params.id}`}
          className="inline-flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Assignment
        </Link>
        <h1 className="text-3xl font-bold neon-text-purple">Edit Assignment</h1>
        <p className="text-gray-400 mt-1">Update your assignment details</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="text-sm font-medium">
                Due Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-gray-900 border-gray-700",
                      !date && "text-gray-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
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
              <Link href={`/dashboard/assignments/${params.id}`}>
                <Button variant="outline" className="border-gray-700">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="bg-primary hover:bg-primary/80" disabled={loading}>
                {loading ? "Updating..." : "Update Assignment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
