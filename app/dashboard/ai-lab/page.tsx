"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sparkles,
  Send,
  Lightbulb,
  BookOpen,
  BrainCircuit,
  Download,
  Copy,
  Check,
  Zap,
  FileText,
  Loader2,
  Save,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  RefreshCw,
  Plus,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { answerQuestion, generateFlashcards, generateStudyPlan, generateSummary, trackAIUsage } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AILabPage() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [summaryInput, setSummaryInput] = useState("")
  const [summaryResult, setSummaryResult] = useState("")
  const [studySubject, setStudySubject] = useState("")
  const [studyTopic, setStudyTopic] = useState("")
  const [studyPlan, setStudyPlan] = useState("")
  const [studyPlanTitle, setStudyPlanTitle] = useState("")
  const [flashcardTopic, setFlashcardTopic] = useState("")
  const [flashcardCount, setFlashcardCount] = useState("5")
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([])
  const [activeFlashcard, setActiveFlashcard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [aiProvider, setAiProvider] = useState<"gemini" | "huggingface">("gemini")
  const [savedChats, setSavedChats] = useState<{ id: string; title: string; messages: any[] }[]>([])
  const [savedFlashcards, setSavedFlashcards] = useState<{ id: string; title: string; cards: any[] }[]>([])
  const [savedStudyPlans, setSavedStudyPlans] = useState<
    { id: string; title: string; content: string; subject: string; topic: string }[]
  >([])
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFlashcard, setEditingFlashcard] = useState<{
    index: number
    field: "question" | "answer"
    value: string
  } | null>(null)
  const [isSaveStudyPlanDialogOpen, setIsSaveStudyPlanDialogOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        setUser({ ...data.user, profile })

        // Fetch saved chats
        const { data: chats } = await supabase
          .from("ai_chats")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })

        if (chats) {
          setSavedChats(
            chats.map((chat) => ({
              id: chat.id,
              title: chat.title,
              messages: chat.messages,
            })),
          )
        }

        // Fetch saved flashcards
        const { data: flashcardSets } = await supabase
          .from("flashcard_sets")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })

        if (flashcardSets) {
          setSavedFlashcards(
            flashcardSets.map((set) => ({
              id: set.id,
              title: set.title,
              cards: set.cards,
            })),
          )
        }

        // Fetch saved study plans
        const { data: studyPlans } = await supabase
          .from("study_guides")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })

        if (studyPlans) {
          setSavedStudyPlans(
            studyPlans.map((plan) => ({
              id: plan.id,
              title: plan.title,
              content: plan.content,
              subject: plan.subject,
              topic: plan.topic,
            })),
          )
        }
      }
    }

    getUser()
  }, [supabase])

  useEffect(() => {
    // Scroll to bottom of chat
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [chatInput])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || loading) return

    try {
      setLoading(true)

      // Add user message to chat
      const userMessage = chatInput.trim()
      setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])
      setChatInput("")

      if (!user) throw new Error("You must be logged in to use the AI Lab")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Show thinking state
      setIsThinking(true)

      // Get AI response
      const response = await answerQuestion(userMessage)

      // Hide thinking state
      setIsThinking(false)

      // Add AI response to chat
      setChatHistory((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsThinking(false)
    }
  }

  const handleNewChat = () => {
    setChatHistory([])
  }

  const handleSaveChat = async () => {
    if (chatHistory.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Start a conversation first before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      const title = chatHistory[0].content.substring(0, 50) + (chatHistory[0].content.length > 50 ? "..." : "")

      const { data, error } = await supabase
        .from("ai_chats")
        .insert([
          {
            user_id: user.id,
            title,
            messages: chatHistory,
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setSavedChats((prev) => [
          {
            id: data[0].id,
            title,
            messages: chatHistory,
          },
          ...prev,
        ])

        toast({
          title: "Chat Saved",
          description: "Your conversation has been saved successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save chat",
        variant: "destructive",
      })
    }
  }

  const loadSavedChat = (chatId: string) => {
    const chat = savedChats.find((c) => c.id === chatId)
    if (chat) {
      setChatHistory(chat.messages)
    }
  }

  const deleteSavedChat = async (chatId: string) => {
    try {
      const { error } = await supabase.from("ai_chats").delete().eq("id", chatId)

      if (error) throw error

      setSavedChats((prev) => prev.filter((chat) => chat.id !== chatId))

      toast({
        title: "Chat Deleted",
        description: "The chat has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  const handleSummarize = async () => {
    if (!summaryInput.trim() || loading) return

    try {
      setLoading(true)

      if (!user) throw new Error("You must be logged in to use the AI Lab")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate summary
      const summary = await generateSummary(summaryInput)
      setSummaryResult(summary)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStudyPlan = async () => {
    if (!studySubject.trim() || !studyTopic.trim() || loading) return

    try {
      setLoading(true)

      if (!user) throw new Error("You must be logged in to use the AI Lab")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate study plan
      const plan = await generateStudyPlan(studySubject, studyTopic)
      setStudyPlan(plan)
      setStudyPlanTitle(`${studySubject}: ${studyTopic}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStudyPlan = async () => {
    if (!studyPlan) {
      toast({
        title: "Nothing to save",
        description: "Generate a study plan first before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("study_guides")
        .insert([
          {
            user_id: user.id,
            title: studyPlanTitle,
            content: studyPlan,
            subject: studySubject,
            topic: studyTopic,
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setSavedStudyPlans((prev) => [
          {
            id: data[0].id,
            title: studyPlanTitle,
            content: studyPlan,
            subject: studySubject,
            topic: studyTopic,
          },
          ...prev,
        ])

        setIsSaveStudyPlanDialogOpen(false)

        toast({
          title: "Study Plan Saved",
          description: "Your study plan has been saved successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save study plan",
        variant: "destructive",
      })
    }
  }

  const loadSavedStudyPlan = (planId: string) => {
    const plan = savedStudyPlans.find((p) => p.id === planId)
    if (plan) {
      setStudyPlan(plan.content)
      setStudySubject(plan.subject)
      setStudyTopic(plan.topic)
      setStudyPlanTitle(plan.title)
    }
  }

  const deleteSavedStudyPlan = async (planId: string) => {
    try {
      const { error } = await supabase.from("study_guides").delete().eq("id", planId)

      if (error) throw error

      setSavedStudyPlans((prev) => prev.filter((plan) => plan.id !== planId))

      toast({
        title: "Study Plan Deleted",
        description: "The study plan has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete study plan",
        variant: "destructive",
      })
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!flashcardTopic.trim() || loading) return

    try {
      setLoading(true)

      if (!user) throw new Error("You must be logged in to use the AI Lab")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate flashcards
      const cards = await generateFlashcards(flashcardTopic, Number.parseInt(flashcardCount))
      setFlashcards(cards)
      setActiveFlashcard(0)
      setShowAnswer(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFlashcards = async () => {
    if (flashcards.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Generate flashcards first before saving.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("flashcard_sets")
        .insert([
          {
            user_id: user.id,
            title: flashcardTopic,
            cards: flashcards,
          },
        ])
        .select()

      if (error) throw error

      if (data && data[0]) {
        setSavedFlashcards((prev) => [
          {
            id: data[0].id,
            title: flashcardTopic,
            cards: flashcards,
          },
          ...prev,
        ])

        toast({
          title: "Flashcards Saved",
          description: "Your flashcards have been saved successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save flashcards",
        variant: "destructive",
      })
    }
  }

  const loadSavedFlashcards = (setId: string) => {
    const set = savedFlashcards.find((s) => s.id === setId)
    if (set) {
      setFlashcards(set.cards)
      setFlashcardTopic(set.title)
      setActiveFlashcard(0)
      setShowAnswer(false)
    }
  }

  const deleteSavedFlashcardSet = async (setId: string) => {
    try {
      const { error } = await supabase.from("flashcard_sets").delete().eq("id", setId)

      if (error) throw error

      setSavedFlashcards((prev) => prev.filter((set) => set.id !== setId))

      toast({
        title: "Flashcard Set Deleted",
        description: "The flashcard set has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete flashcard set",
        variant: "destructive",
      })
    }
  }

  const handleNextFlashcard = () => {
    if (activeFlashcard < flashcards.length - 1) {
      setActiveFlashcard(activeFlashcard + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevFlashcard = () => {
    if (activeFlashcard > 0) {
      setActiveFlashcard(activeFlashcard - 1)
      setShowAnswer(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  const downloadFlashcards = () => {
    const flashcardsText = flashcards
      .map((card, index) => `Card ${index + 1}:\nQuestion: ${card.question}\nAnswer: ${card.answer}\n`)
      .join("\n")

    const blob = new Blob([flashcardsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashcards-${flashcardTopic.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadStudyPlan = () => {
    const blob = new Blob([studyPlan], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `study-plan-${studyTopic.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSummary = () => {
    const blob = new Blob([summaryResult], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `summary-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Function to get AI explanation for flashcard
  const getFlashcardExplanation = async (question: string, answer: string) => {
    try {
      setLoading(true)

      if (!user) throw new Error("You must be logged in to use the AI Lab")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate explanation
      const prompt = `Please explain in detail how to arrive at this answer:\n\nQuestion: ${question}\nAnswer: ${answer}\n\nProvide a step-by-step explanation with any relevant formulas, concepts, or reasoning.`

      // Add to chat history
      setChatHistory([
        { role: "user", content: prompt },
        { role: "assistant", content: "Generating detailed explanation..." },
      ])

      // Switch to chat tab
      document.querySelector('[data-state="inactive"][value="chat"]')?.click()

      // Get AI response
      const explanation = await answerQuestion(prompt)

      // Update the last message with the actual response
      setChatHistory((prev) => [prev[0], { role: "assistant", content: explanation }])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to edit flashcard
  const handleEditFlashcard = () => {
    if (!editingFlashcard) return

    const { index, field, value } = editingFlashcard
    const updatedFlashcards = [...flashcards]
    updatedFlashcards[index] = {
      ...updatedFlashcards[index],
      [field]: value,
    }
    setFlashcards(updatedFlashcards)
    setIsEditDialogOpen(false)
    setEditingFlashcard(null)
  }

  // Function to delete flashcard
  const deleteFlashcard = (index: number) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index)
    setFlashcards(updatedFlashcards)
    if (activeFlashcard >= updatedFlashcards.length) {
      setActiveFlashcard(Math.max(0, updatedFlashcards.length - 1))
    }
  }

  // Function to render markdown content
  const renderMarkdown = (content: string) => {
    // This is a simple implementation - in a real app, you'd use a markdown parser
    const sections = content.split("\n\n")
    return sections.map((section, index) => {
      if (section.startsWith("# ")) {
        return (
          <h1 key={index} className="text-3xl font-bold my-6">
            {section.replace("# ", "")}
          </h1>
        )
      } else if (section.startsWith("## ")) {
        return (
          <h2 key={index} className="text-2xl font-bold my-5">
            {section.replace("## ", "")}
          </h2>
        )
      } else if (section.startsWith("### ")) {
        return (
          <h3 key={index} className="text-xl font-bold my-4">
            {section.replace("### ", "")}
          </h3>
        )
      } else if (section.startsWith("- ")) {
        const items = section.split("\n").map((item) => item.replace("- ", ""))
        return (
          <ul key={index} className="list-disc pl-6 my-4 space-y-2">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      } else if (section.includes("\n1. ")) {
        const items = section.split("\n").filter((item) => item.match(/^\d+\. /))
        return (
          <ol key={index} className="list-decimal pl-6 my-4 space-y-2">
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\. /, "")}</li>
            ))}
          </ol>
        )
      } else if (section.startsWith("**")) {
        return (
          <p key={index} className="font-bold my-4">
            {section.replace(/\*\*/g, "")}
          </p>
        )
      } else {
        return (
          <p key={index} className="my-4">
            {section}
          </p>
        )
      }
    })
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-green">AI Lab</h1>
        <p className="text-gray-400 mt-1">
          Leverage AI to enhance your learning experience
          {user?.profile?.subscription_tier === "free" && (
            <span className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded-full">
              {10 - (user?.profile?.ai_requests_count || 0)} requests remaining
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center mb-6 space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">AI Provider:</span>
          <Select value={aiProvider} onValueChange={(value: "gemini" | "huggingface") => setAiProvider(value)}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">
                <div className="flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
                  Gemini AI
                </div>
              </SelectItem>
              <SelectItem value="huggingface">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-yellow-400" />
                  Hugging Face
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="bg-gray-800 text-gray-300 hover:bg-gray-700">
          {aiProvider === "gemini" ? "Gemini 1.5 Flash" : "Hugging Face Models"}
        </Badge>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="chat" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <MessageSquare className="h-4 w-4 mr-2" /> AI Chat
          </TabsTrigger>
          <TabsTrigger value="summarize" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Lightbulb className="h-4 w-4 mr-2" /> Summarize
          </TabsTrigger>
          <TabsTrigger
            value="study-plan"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <BookOpen className="h-4 w-4 mr-2" /> Study Plan
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <BrainCircuit className="h-4 w-4 mr-2" /> Flashcards
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>AI Assistant</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-700" onClick={handleNewChat}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700" onClick={() => setChatHistory([])}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin pr-2" id="chat-container">
                    {chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-xl font-medium mb-2">Ask me anything!</h3>
                        <p className="text-gray-400 max-w-md">
                          I can help with homework, explain concepts, solve problems, and more.
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              message.role === "user" ? "user-message" : "ai-message"
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              {message.role === "assistant" && (
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src="/ai-avatar.png" />
                                  <AvatarFallback className="bg-blue-900 text-blue-300">AI</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                <p className="text-sm font-medium mb-1">
                                  {message.role === "assistant" ? "AI Assistant" : "You"}
                                </p>
                                <div className="whitespace-pre-wrap text-left">{message.content}</div>
                              </div>
                              {message.role === "user" && (
                                <Avatar className="h-8 w-8 ml-2">
                                  <AvatarImage src={user?.profile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-purple-900 text-purple-300">
                                    {user?.profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            {message.role === "assistant" && (
                              <div className="flex justify-start mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-gray-400 hover:text-white"
                                  onClick={() => copyToClipboard(message.content, index)}
                                >
                                  {copiedIndex === index ? (
                                    <Check className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Copy className="h-3 w-3 mr-1" />
                                  )}
                                  {copiedIndex === index ? "Copied" : "Copy"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="ai-message max-w-[80%] rounded-lg p-4">
                          <div className="flex items-start mb-2">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src="/ai-avatar.png" />
                              <AvatarFallback className="bg-blue-900 text-blue-300">AI</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">AI Assistant</p>
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                                <span className="text-sm text-gray-400 ml-1">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Textarea
                      ref={textareaRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 bg-gray-900 border-gray-700 min-h-[60px] max-h-[200px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          if (chatInput.trim() && !loading) {
                            handleChatSubmit(e)
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col gap-2 self-end">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/80"
                        disabled={loading || !chatInput.trim()}
                      >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-700"
                        onClick={handleSaveChat}
                        disabled={chatHistory.length === 0}
                      >
                        <Save className="h-5 w-5" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Saved Chats</CardTitle>
                  <CardDescription>Your previous conversations</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  {savedChats.length > 0 ? (
                    <div className="space-y-2">
                      {savedChats.map((chat) => (
                        <div key={chat.id} className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            className="w-full justify-start border-gray-700 text-left mr-2"
                            onClick={() => loadSavedChat(chat.id)}
                          >
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{chat.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => deleteSavedChat(chat.id)} className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No saved chats yet. Save your conversations to access them later.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Summarize Tab */}
        <TabsContent value="summarize" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Text Summarizer</CardTitle>
              <CardDescription>
                Paste any text to get a concise summary. Great for articles, research papers, or long documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <label htmlFor="summary-input" className="block text-sm font-medium mb-2">
                  Text to Summarize
                </label>
                <Textarea
                  id="summary-input"
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder="Paste the text you want to summarize..."
                  className="bg-gray-900 border-gray-700 min-h-[200px]"
                />
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={handleSummarize}
                  className="bg-primary hover:bg-primary/80 mb-6"
                  disabled={loading || !summaryInput.trim()}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Lightbulb className="h-5 w-5 mr-2" />}
                  Generate Summary
                </Button>

                {summaryResult && (
                  <Button variant="outline" className="border-gray-700 mb-6" onClick={downloadSummary}>
                    <Download className="h-5 w-5 mr-2" />
                    Download Summary
                  </Button>
                )}
              </div>

              {summaryResult && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-wrap">
                    {summaryResult}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(summaryResult, 0)}
                    >
                      {copiedIndex === 0 ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copiedIndex === 0 ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="study-plan" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Study Plan Generator</CardTitle>
                  <CardDescription>
                    Create a personalized study plan for any subject or topic. Includes learning objectives, resources,
                    and a timeline.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="study-subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="study-subject"
                        value={studySubject}
                        onChange={(e) => setStudySubject(e.target.value)}
                        placeholder="e.g., Mathematics, Physics, History"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="study-topic" className="block text-sm font-medium mb-2">
                        Specific Topic
                      </label>
                      <Input
                        id="study-topic"
                        value={studyTopic}
                        onChange={(e) => setStudyTopic(e.target.value)}
                        placeholder="e.g., Calculus, Quantum Mechanics, World War II"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={handleGenerateStudyPlan}
                      className="bg-primary hover:bg-primary/80 mb-6"
                      disabled={loading || !studySubject.trim() || !studyTopic.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <BookOpen className="h-5 w-5 mr-2" />
                      )}
                      Generate Study Plan
                    </Button>

                    {studyPlan && (
                      <div className="space-x-2">
                        <Button variant="outline" className="border-gray-700 mb-6" onClick={downloadStudyPlan}>
                          <Download className="h-5 w-5 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-700 mb-6"
                          onClick={() => setIsSaveStudyPlanDialogOpen(true)}
                        >
                          <Save className="h-5 w-5 mr-2" />
                          Save Plan
                        </Button>
                      </div>
                    )}
                  </div>

                  {studyPlan && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Your Study Plan</h3>
                      <div className="bg-gray-800 rounded-lg p-6 whitespace-pre-wrap prose prose-invert max-w-none">
                        {renderMarkdown(studyPlan)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(studyPlan, 0)}
                        >
                          {copiedIndex === 0 ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {copiedIndex === 0 ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Saved Study Plans</CardTitle>
                  <CardDescription>Your study guides</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  {savedStudyPlans.length > 0 ? (
                    <div className="space-y-2">
                      {savedStudyPlans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            className="w-full justify-start border-gray-700 text-left mr-2"
                            onClick={() => loadSavedStudyPlan(plan.id)}
                          >
                            <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{plan.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => deleteSavedStudyPlan(plan.id)} className="text-red-500">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No saved study plans yet. Generate and save study plans to access them later.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Flashcard Generator</CardTitle>
                  <CardDescription>
                    Create flashcards for any topic to help with memorization and quick review.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label htmlFor="flashcard-topic" className="block text-sm font-medium mb-2">
                        Topic
                      </label>
                      <Input
                        id="flashcard-topic"
                        value={flashcardTopic}
                        onChange={(e) => setFlashcardTopic(e.target.value)}
                        placeholder="e.g., Spanish Vocabulary, Chemical Elements, Historical Dates"
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="flashcard-count" className="block text-sm font-medium mb-2">
                        Number of Cards
                      </label>
                      <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                        <SelectTrigger className="bg-gray-900 border-gray-700">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 cards</SelectItem>
                          <SelectItem value="10">10 cards</SelectItem>
                          <SelectItem value="15">15 cards</SelectItem>
                          <SelectItem value="20">20 cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      onClick={handleGenerateFlashcards}
                      className="bg-primary hover:bg-primary/80 mb-6"
                      disabled={loading || !flashcardTopic.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <BrainCircuit className="h-5 w-5 mr-2" />
                      )}
                      Generate Flashcards
                    </Button>

                    {flashcards.length > 0 && (
                      <div className="space-x-2">
                        <Button variant="outline" className="border-gray-700 mb-6" onClick={downloadFlashcards}>
                          <Download className="h-5 w-5 mr-2" />
                          Download
                        </Button>

                        <Button variant="outline" className="border-gray-700 mb-6" onClick={handleSaveFlashcards}>
                          <Save className="h-5 w-5 mr-2" />
                          Save Set
                        </Button>
                      </div>
                    )}
                  </div>

                  {flashcards.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">
                          Flashcard {activeFlashcard + 1} of {flashcards.length}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700"
                            onClick={() =>
                              getFlashcardExplanation(
                                flashcards[activeFlashcard]?.question,
                                flashcards[activeFlashcard]?.answer,
                              )
                            }
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Get AI Explanation
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingFlashcard({
                                    index: activeFlashcard,
                                    field: "question",
                                    value: flashcards[activeFlashcard]?.question,
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                Edit Question
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingFlashcard({
                                    index: activeFlashcard,
                                    field: "answer",
                                    value: flashcards[activeFlashcard]?.answer,
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                Edit Answer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteFlashcard(activeFlashcard)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Card
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flashcard">
                        <div className={`flashcard-inner ${showAnswer ? "flipped" : ""}`}>
                          <div className="flashcard-front bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium mb-2">Question:</p>
                              <p className="text-gray-300 text-lg">{flashcards[activeFlashcard]?.question}</p>
                            </div>
                          </div>
                          <div className="flashcard-back bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium mb-2">Answer:</p>
                              <p className="text-gray-300 text-lg">{flashcards[activeFlashcard]?.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700"
                          onClick={handlePrevFlashcard}
                          disabled={activeFlashcard === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          variant={showAnswer ? "outline" : "default"}
                          className={showAnswer ? "border-gray-700" : "bg-primary hover:bg-primary/80"}
                          onClick={() => setShowAnswer(!showAnswer)}
                        >
                          {showAnswer ? "Hide Answer" : "Show Answer"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700"
                          onClick={handleNextFlashcard}
                          disabled={activeFlashcard === flashcards.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Saved Flashcards</CardTitle>
                  <CardDescription>Your flashcard sets</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto scrollbar-thin">
                  {savedFlashcards.length > 0 ? (
                    <div className="space-y-2">
                      {savedFlashcards.map((set) => (
                        <div key={set.id} className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            className="w-full justify-start border-gray-700 text-left mr-2"
                            onClick={() => loadSavedFlashcards(set.id)}
                          >
                            <BrainCircuit className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{set.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => deleteSavedFlashcardSet(set.id)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No saved flashcard sets yet. Save your flashcards to access them later.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Flashcard Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Edit Flashcard {editingFlashcard?.field === "question" ? "Question" : "Answer"}</DialogTitle>
            <DialogDescription>
              Make changes to your flashcard {editingFlashcard?.field === "question" ? "question" : "answer"}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editingFlashcard?.value || ""}
              onChange={(e) => setEditingFlashcard((prev) => (prev ? { ...prev, value: e.target.value } : null))}
              className="bg-gray-800 border-gray-700 min-h-[150px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button onClick={handleEditFlashcard} className="bg-primary hover:bg-primary/80">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Study Plan Dialog */}
      <Dialog open={isSaveStudyPlanDialogOpen} onOpenChange={setIsSaveStudyPlanDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Save Study Plan</DialogTitle>
            <DialogDescription>Give your study plan a title before saving it.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="study-plan-title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="study-plan-title"
              value={studyPlanTitle}
              onChange={(e) => setStudyPlanTitle(e.target.value)}
              placeholder="e.g., Calculus Fundamentals Study Guide"
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveStudyPlanDialogOpen(false)} className="border-gray-700">
              Cancel
            </Button>
            <Button onClick={handleSaveStudyPlan} className="bg-primary hover:bg-primary/80">
              Save Study Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
