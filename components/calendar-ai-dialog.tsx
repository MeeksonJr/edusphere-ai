"use client"

import { Input } from "@/components/ui/input"

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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Sparkles, Upload, FileText, Download, Copy, Check } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { trackAIUsage } from "@/lib/ai-service"

interface CalendarAIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: any
}

export function CalendarAIDialog({ open, onOpenChange, event }: CalendarAIDialogProps) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const [prompt, setPrompt] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerateResources = async () => {
    if (!event) return

    try {
      setLoading(true)
      setAiResponse("")

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        throw new Error("You must be logged in to use AI features")
      }

      // Track AI usage
      await trackAIUsage(supabase, data.user.id)

      // Generate default prompt if none provided
      const finalPrompt =
        prompt ||
        `Generate study resources and tips for the following assignment:
      
Title: ${event.title}
${event.description ? `Description: ${event.description}` : ""}
${event.subject ? `Subject: ${event.subject}` : ""}
Due Date: ${new Date(event.start).toLocaleDateString()}

Please provide:
1. Key concepts to understand
2. Recommended study resources
3. Step-by-step approach to complete this assignment
4. Time management suggestions`

      // Simulate AI response (in a real app, this would call an AI API)
      // For demo purposes, we'll use a timeout to simulate the API call
      setTimeout(() => {
        const response = `# Study Resources for "${event.title}"

## Key Concepts to Understand
${event.subject ? `For this ${event.subject} assignment, you should focus on these key concepts:` : "You should focus on these key concepts:"}
- Concept 1: Understanding the fundamental principles
- Concept 2: Applying theoretical knowledge to practical problems
- Concept 3: Critical analysis and evaluation of information

## Recommended Study Resources
- Textbook: "Introduction to ${event.subject || "the Subject"}" (Chapters 5-7)
- Online Resources: Khan Academy, Coursera
- Academic Journals: Recent publications on the topic
- Study Groups: Consider forming a study group with classmates

## Step-by-Step Approach
1. **Research Phase (2-3 days)**
   - Gather all necessary materials and resources
   - Read through the assignment requirements carefully
   - Take notes on key concepts and requirements

2. **Planning Phase (1 day)**
   - Create an outline of your approach
   - Break down the assignment into manageable sections
   - Set mini-deadlines for each section

3. **Execution Phase (3-5 days)**
   - Complete each section according to your plan
   - Review your work as you progress
   - Make adjustments to your approach as needed

4. **Review Phase (1-2 days)**
   - Proofread and edit your work
   - Check for any missing requirements
   - Get feedback if possible before final submission

## Time Management Suggestions
- Start at least 7-10 days before the due date
- Allocate 1-2 hours per day to work on this assignment
- Use the Pomodoro technique (25 minutes of focused work, 5-minute break)
- Schedule specific times in your calendar for working on this assignment
- Eliminate distractions during your study sessions

## Additional Tips
- Connect this assignment to previous course material
- Prepare questions for your instructor if anything is unclear
- Consider how this assignment relates to the broader learning objectives of the course

Good luck with your assignment! Remember that consistent effort over time is more effective than last-minute cramming.`

        setAiResponse(response)
        setLoading(false)
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI resources",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleFileAnalysis = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a file to analyze",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setAiResponse("")

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        throw new Error("You must be logged in to use AI features")
      }

      // Track AI usage
      await trackAIUsage(supabase, data.user.id)

      // In a real app, you would upload the file to a server and process it
      // For demo purposes, we'll simulate the file analysis
      setTimeout(() => {
        const response = `# Analysis of "${file.name}"

## Document Summary
I've analyzed your document and identified the following key components:

- **Assignment Type**: ${event.subject || "Academic"} project
- **Complexity Level**: Moderate to High
- **Estimated Time Required**: 8-10 hours

## Key Requirements Identified
1. Research component on specific topics
2. Written analysis (approximately 1500-2000 words)
3. Supporting evidence and citations required
4. Critical evaluation of multiple perspectives

## Suggested Approach
Based on the document analysis, here's a recommended approach:

### Research Phase (3-4 hours)
- Identify 5-7 scholarly sources
- Take structured notes using the Cornell method
- Focus on gathering evidence for different perspectives

### Writing Phase (4-5 hours)
- Create a detailed outline before writing
- Draft introduction with clear thesis statement
- Develop body paragraphs with topic sentences
- Ensure smooth transitions between sections
- Craft a conclusion that synthesizes key points

### Review Phase (1 hour)
- Check for logical flow and coherence
- Verify all citations are properly formatted
- Proofread for grammar and spelling errors
- Ensure all requirements have been met

## Helpful Resources
- University writing center for feedback
- Citation management tools (Zotero, Mendeley)
- Grammar checking tools (Grammarly, Hemingway Editor)

## Timeline Recommendation
- Start at least 7 days before the deadline
- Allocate specific days for research, writing, and review
- Schedule a buffer day for unexpected challenges

Would you like me to provide more specific guidance on any particular aspect of this assignment?`

        setAiResponse(response)
        setLoading(false)
      }, 2500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze file",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResponse)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The AI response has been copied to your clipboard.",
    })
  }

  const downloadResponse = () => {
    const blob = new Blob([aiResponse], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ai-resources-${event?.title.replace(/\s+/g, "-").toLowerCase() || "assignment"}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Assistant for {event?.title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Get AI-powered resources and assistance for your assignment.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="generate" className="mt-4">
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger
              value="generate"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Generate Resources
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              <Upload className="h-4 w-4 mr-2" /> Analyze Assignment File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Custom Prompt (Optional)
              </label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Generate study resources and tips for: ${event?.title}`}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
              <p className="text-xs text-gray-400">Customize your request or leave blank to use the default prompt.</p>
            </div>

            <Button
              onClick={handleGenerateResources}
              className="bg-primary hover:bg-primary/80 w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {loading ? "Generating..." : "Generate Study Resources"}
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="file-upload" className="text-sm font-medium">
                Upload Assignment File
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="bg-gray-800 border-gray-700"
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Button
                  onClick={handleFileAnalysis}
                  className="bg-primary hover:bg-primary/80"
                  disabled={loading || !file}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400">Upload your assignment file (PDF, Word, or text) for AI analysis.</p>
            </div>
          </TabsContent>
        </Tabs>

        {aiResponse && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">AI Response</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-gray-700" onClick={copyToClipboard}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" className="border-gray-700" onClick={downloadResponse}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-wrap">{aiResponse}</div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" className="border-gray-700" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
