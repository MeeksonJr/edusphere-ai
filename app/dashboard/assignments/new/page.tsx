"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, ChevronLeft, Sparkles, Clock, Loader2, Zap } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, parse, isValid } from "date-fns"
import { useSupabase } from "@/components/supabase-provider"
import { generateAssignmentApproach, trackAIUsage } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"

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
      setFormData((prev) => ({ ...prev, due_date: "" }))
      setManualDateInput("")
    }
    setShowCalendar(false)
  }

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setManualDateInput(input)

    try {
      let parsedDate: Date | null = null
      parsedDate = parse(input, "MM/dd/yyyy HH:mm", new Date())

      if (!isValid(parsedDate)) {
        parsedDate = parse(input, "MM/dd/yyyy", new Date())
      }

      if (!isValid(parsedDate)) {
        parsedDate = parse(input, "yyyy-MM-dd", new Date())
      }

      if (isValid(parsedDate)) {
        setDate(parsedDate)
        setFormData((prev) => ({ ...prev, due_date: parsedDate.toISOString() }))
      } else {
        setFormData((prev) => ({ ...prev, due_date: "" }))
      }
    } catch (error) {
      setFormData((prev) => ({ ...prev, due_date: "" }))
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

      await trackAIUsage(supabase, user.id)
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

      if (!user) throw new Error("You must be logged in")

      const { error: insertError } = await supabase.from("assignments").insert([
        {
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject || null,
          priority: formData.priority,
          due_date: formData.due_date || null,
          status: "ongoing",
          ai_summary: formData.ai_summary || null,
        },
      ])

      if (insertError) throw insertError

      toast({
        title: "Assignment Created",
        description: "Your assignment has been created successfully.",
      })

      router.push("/dashboard/assignments")
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
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to Assignments
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Create New</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Assignment
            </span>
          </h1>
          <p className="text-white/70">Add a new assignment to track your academic tasks</p>
        </div>
      </ScrollReveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Math Homework Chapter 5"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the assignment requirements..."
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="subject" className="text-white mb-2 block">
                    Subject
                  </Label>
                  <Select value={formData.subject} onValueChange={(value) => handleSelectChange("subject", value)}>
                    <SelectTrigger className="glass-surface border-white/20 text-white">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject} className="text-white">
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority" className="text-white mb-2 block">
                    Priority
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                    <SelectTrigger className="glass-surface border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      <SelectItem value="low" className="text-white">
                        Low
                      </SelectItem>
                      <SelectItem value="medium" className="text-white">
                        Medium
                      </SelectItem>
                      <SelectItem value="high" className="text-white">
                        High
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="due_date" className="text-white mb-2 block">
                  Due Date
                </Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal glass-surface border-white/20 text-white hover:border-purple-500/50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-white/60" aria-hidden="true" />
                      {date ? format(date, "PPP") : <span className="text-white/60">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-surface border-white/20" align="start">
                    <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </GlassSurface>
        </ScrollReveal>

        {/* AI Summary */}
        {formData.ai_summary && (
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-6 lg:p-8 border-purple-500/30">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" aria-hidden="true" />
                <h2 className="text-xl font-bold text-white">AI-Generated Approach</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-white/80 whitespace-pre-wrap">{formData.ai_summary}</p>
              </div>
            </GlassSurface>
          </ScrollReveal>
        )}

        {/* Error Message */}
        {error && (
          <GlassSurface className="p-4 border-red-500/30 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </GlassSurface>
        )}

        {/* Actions */}
        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={generateAiSummary}
              disabled={aiLoading || !formData.title || !formData.description}
              className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" aria-hidden="true" />
                  Generate AI Approach
                </>
              )}
            </Button>

            <div className="flex gap-4">
              <Link href="/dashboard/assignments">
                <Button type="button" variant="ghost" className="text-white/70 hover:text-white">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </form>
    </div>
  )
}
