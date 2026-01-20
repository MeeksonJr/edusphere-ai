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

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        throw new Error("You must be logged in to use AI features")
      }

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

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: finalPrompt,
          systemPrompt:
            "You are an educational AI assistant that helps students plan and complete assignments effectively. Respond in markdown format.",
          maxTokens: 1400,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate AI resources")
      }

      setAiResponse(result.data?.text || "")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI resources",
        variant: "destructive",
      })
    } finally {
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

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        throw new Error("You must be logged in to use AI features")
      }

      // In a real app, you would upload the file to a server and process it.
      // For now, we'll send a high-level description of the file name to the AI.
      const aiPrompt = `I have an assignment file named "${file.name}". Based on the name and the following context, generate an analysis and recommended approach for completing the assignment:

Title: ${event.title}
${event.description ? `Description: ${event.description}` : ""}
${event.subject ? `Subject: ${event.subject}` : ""}

Provide:
1. Document summary (assumed)
2. Likely key requirements
3. Recommended research and writing approach
4. Helpful resources
5. Timeline recommendation`

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: aiPrompt,
          systemPrompt:
            "You are an educational AI assistant helping students analyze assignment documents and plan their work. Respond in markdown format.",
          maxTokens: 1400,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to analyze file")
      }

      setAiResponse(result.data?.text || "")
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
