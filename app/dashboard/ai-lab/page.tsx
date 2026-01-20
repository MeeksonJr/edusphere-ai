"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

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
      const userMessage = chatInput.trim()
      setChatHistory((prev) => [...prev, { role: "user", content: userMessage }])
      setChatInput("")

      if (!user) throw new Error("You must be logged in to use the AI Lab")
      await trackAIUsage(supabase, user.id)
      setIsThinking(true)

      const response = await answerQuestion(userMessage)
      setIsThinking(false)
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
      await trackAIUsage(supabase, user.id)
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
      await trackAIUsage(supabase, user.id)
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

        toast({
          title: "Study Plan Saved",
          description: "Your study plan has been saved successfully.",
        })
        setIsSaveStudyPlanDialogOpen(false)
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
      setStudyPlanTitle(plan.title)
      setStudySubject(plan.subject)
      setStudyTopic(plan.topic)
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
      await trackAIUsage(supabase, user.id)
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

  const getFlashcardExplanation = async (question: string, answer: string) => {
    try {
      setLoading(true)
      if (!user) throw new Error("You must be logged in to use the AI Lab")
      await trackAIUsage(supabase, user.id)

      const prompt = `Please explain in detail how to arrive at this answer:\n\nQuestion: ${question}\nAnswer: ${answer}\n\nProvide a step-by-step explanation with any relevant formulas, concepts, or reasoning.`

      setChatHistory([
        { role: "user", content: prompt },
        { role: "assistant", content: "Generating detailed explanation..." },
      ])

      const explanation = await answerQuestion(prompt)
      setChatHistory([{ role: "user", content: prompt }, { role: "assistant", content: explanation }])
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

  const deleteFlashcard = (index: number) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index)
    setFlashcards(updatedFlashcards)
    if (activeFlashcard >= updatedFlashcards.length) {
      setActiveFlashcard(Math.max(0, updatedFlashcards.length - 1))
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">AI</span>{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Lab
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-white/70">Leverage AI to enhance your learning experience</p>
            {user?.profile?.subscription_tier === "free" && (
              <Badge className="glass-surface border-white/10 text-white/80">
                {10 - (user?.profile?.ai_requests_count || 0)} requests remaining
              </Badge>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* AI Provider Selector */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-white">AI Provider:</span>
            <Select value={aiProvider} onValueChange={(value: "gemini" | "huggingface") => setAiProvider(value)}>
              <SelectTrigger className="w-[180px] glass-surface border-white/20 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="glass-surface border-white/20">
                <SelectItem value="gemini" className="text-white">
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-blue-400" aria-hidden="true" />
                    Gemini AI
                  </div>
                </SelectItem>
                <SelectItem value="huggingface" className="text-white">
                  <div className="flex items-center">
                    <Zap className="mr-2 h-4 w-4 text-yellow-400" aria-hidden="true" />
                    Hugging Face
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Badge className="glass-surface border-white/10 text-white/80">
              {aiProvider === "gemini" ? "Gemini 1.5 Flash" : "Hugging Face Models"}
            </Badge>
          </div>
        </GlassSurface>
      </ScrollReveal>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="glass-surface border-white/20 p-1">
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" aria-hidden="true" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger
            value="summarize"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Lightbulb className="h-4 w-4 mr-2" aria-hidden="true" />
            Summarize
          </TabsTrigger>
          <TabsTrigger
            value="study-plan"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <BookOpen className="h-4 w-4 mr-2" aria-hidden="true" />
            Study Plan
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <BrainCircuit className="h-4 w-4 mr-2" aria-hidden="true" />
            Flashcards
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="glass-surface border-white/20 text-white hover:bg-white/10"
                        onClick={handleNewChat}
                      >
                        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                        New Chat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="glass-surface border-white/20 text-white hover:bg-white/10"
                        onClick={() => setChatHistory([])}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-2" id="chat-container">
                    {chatHistory.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-12 w-12 text-purple-400 mb-4" aria-hidden="true" />
                        <h3 className="text-xl font-semibold text-white mb-2">Ask me anything!</h3>
                        <p className="text-white/70 max-w-md">
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
                              message.role === "user"
                                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                                : "glass-surface border-white/10"
                            }`}
                          >
                            <div className="flex items-start mb-2">
                              {message.role === "assistant" && (
                                <Avatar className="h-8 w-8 mr-2 border-2 border-purple-500/30">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    AI
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex-1 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                <p className="text-sm font-medium mb-1 text-white/80">
                                  {message.role === "assistant" ? "AI Assistant" : "You"}
                                </p>
                                <div className="whitespace-pre-wrap text-left text-white/90">{message.content}</div>
                              </div>
                              {message.role === "user" && (
                                <Avatar className="h-8 w-8 ml-2 border-2 border-purple-500/30">
                                  <AvatarImage src={user?.profile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
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
                                  className="h-7 text-xs text-white/60 hover:text-white"
                                  onClick={() => copyToClipboard(message.content, index)}
                                >
                                  {copiedIndex === index ? (
                                    <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                                  ) : (
                                    <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
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
                        <div className="glass-surface border-white/10 max-w-[80%] rounded-lg p-4">
                          <div className="flex items-start mb-2">
                            <Avatar className="h-8 w-8 mr-2 border-2 border-purple-500/30">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                AI
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1 text-white/80">AI Assistant</p>
                              <div className="flex items-center space-x-2">
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                                <span className="text-sm text-white/60 ml-1">Thinking...</span>
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
                      className="flex-1 glass-surface border-white/20 text-white placeholder:text-white/40 min-h-[60px] max-h-[200px] resize-none"
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
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                        disabled={loading || !chatInput.trim()}
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Send className="h-5 w-5" aria-hidden="true" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="glass-surface border-white/20 text-white hover:bg-white/10"
                        onClick={handleSaveChat}
                        disabled={chatHistory.length === 0}
                      >
                        <Save className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </div>
                  </form>
                </GlassSurface>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Saved Chats</h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {savedChats.length > 0 ? (
                      savedChats.map((chat) => (
                        <div key={chat.id} className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 justify-start glass-surface border-white/20 text-white hover:bg-white/10 text-left"
                            onClick={() => loadSavedChat(chat.id)}
                          >
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate text-sm">{chat.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-surface border-white/20">
                              <DropdownMenuItem
                                onClick={() => deleteSavedChat(chat.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">No saved chats yet.</p>
                    )}
                  </div>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </TabsContent>

        {/* Summarize Tab */}
        <TabsContent value="summarize">
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Text Summarizer</h2>
              <p className="text-white/70 mb-6">
                Paste any text to get a concise summary. Great for articles, research papers, or long documents.
              </p>
              <div className="mb-4">
                <Label htmlFor="summary-input" className="text-white mb-2 block">
                  Text to Summarize
                </Label>
                <Textarea
                  id="summary-input"
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  placeholder="Paste the text you want to summarize..."
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 min-h-[200px] resize-none"
                />
              </div>

              <div className="flex justify-between mb-6">
                <Button
                  onClick={handleSummarize}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  disabled={loading || !summaryInput.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
                      Generate Summary
                    </>
                  )}
                </Button>

                {summaryResult && (
                  <Button
                    variant="outline"
                    className="glass-surface border-white/20 text-white hover:bg-white/10"
                    onClick={downloadSummary}
                  >
                    <Download className="h-5 w-5 mr-2" aria-hidden="true" />
                    Download
                  </Button>
                )}
              </div>

              {summaryResult && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Summary</h3>
                  <div className="glass-surface border-white/10 p-4 rounded-lg">
                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{summaryResult}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs text-white/60 hover:text-white"
                      onClick={() => copyToClipboard(summaryResult, 0)}
                    >
                      {copiedIndex === 0 ? (
                        <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
                      )}
                      {copiedIndex === 0 ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              )}
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Study Plan Tab */}
        <TabsContent value="study-plan">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-2">Study Plan Generator</h2>
                  <p className="text-white/70 mb-6">
                    Create a personalized study plan for any subject or topic. Includes learning objectives, resources,
                    and a timeline.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="study-subject" className="text-white mb-2 block">
                        Subject
                      </Label>
                      <Input
                        id="study-subject"
                        value={studySubject}
                        onChange={(e) => setStudySubject(e.target.value)}
                        placeholder="e.g., Mathematics, Physics, History"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="study-topic" className="text-white mb-2 block">
                        Specific Topic
                      </Label>
                      <Input
                        id="study-topic"
                        value={studyTopic}
                        onChange={(e) => setStudyTopic(e.target.value)}
                        placeholder="e.g., Calculus, Quantum Mechanics, World War II"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <Button
                      onClick={handleGenerateStudyPlan}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      disabled={loading || !studySubject.trim() || !studyTopic.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-5 w-5 mr-2" aria-hidden="true" />
                          Generate Study Plan
                        </>
                      )}
                    </Button>

                    {studyPlan && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="glass-surface border-white/20 text-white hover:bg-white/10"
                          onClick={downloadStudyPlan}
                        >
                          <Download className="h-5 w-5 mr-2" aria-hidden="true" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="glass-surface border-white/20 text-white hover:bg-white/10"
                          onClick={() => setIsSaveStudyPlanDialogOpen(true)}
                        >
                          <Save className="h-5 w-5 mr-2" aria-hidden="true" />
                          Save Plan
                        </Button>
                      </div>
                    )}
                  </div>

                  {studyPlan && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Your Study Plan</h3>
                      <div className="glass-surface border-white/10 p-6 rounded-lg">
                        <pre className="whitespace-pre-wrap text-white/90 font-mono text-sm leading-relaxed">
                          {studyPlan}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs text-white/60 hover:text-white"
                          onClick={() => copyToClipboard(studyPlan, 0)}
                        >
                          {copiedIndex === 0 ? (
                            <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
                          )}
                          {copiedIndex === 0 ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  )}
                </GlassSurface>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Saved Study Plans</h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {savedStudyPlans.length > 0 ? (
                      savedStudyPlans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 justify-start glass-surface border-white/20 text-white hover:bg-white/10 text-left"
                            onClick={() => loadSavedStudyPlan(plan.id)}
                          >
                            <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate text-sm">{plan.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-surface border-white/20">
                              <DropdownMenuItem
                                onClick={() => deleteSavedStudyPlan(plan.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">No saved study plans yet.</p>
                    )}
                  </div>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-white mb-2">Flashcard Generator</h2>
                  <p className="text-white/70 mb-6">
                    Create flashcards for any topic to help with memorization and quick review.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="flashcard-topic" className="text-white mb-2 block">
                        Topic
                      </Label>
                      <Input
                        id="flashcard-topic"
                        value={flashcardTopic}
                        onChange={(e) => setFlashcardTopic(e.target.value)}
                        placeholder="e.g., Spanish Vocabulary, Chemical Elements, Historical Dates"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="flashcard-count" className="text-white mb-2 block">
                        Number of Cards
                      </Label>
                      <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                        <SelectTrigger className="glass-surface border-white/20 text-white">
                          <SelectValue placeholder="Select count" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-white/20">
                          <SelectItem value="5" className="text-white">5 cards</SelectItem>
                          <SelectItem value="10" className="text-white">10 cards</SelectItem>
                          <SelectItem value="15" className="text-white">15 cards</SelectItem>
                          <SelectItem value="20" className="text-white">20 cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <Button
                      onClick={handleGenerateFlashcards}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      disabled={loading || !flashcardTopic.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="h-5 w-5 mr-2" aria-hidden="true" />
                          Generate Flashcards
                        </>
                      )}
                    </Button>

                    {flashcards.length > 0 && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="glass-surface border-white/20 text-white hover:bg-white/10"
                          onClick={downloadFlashcards}
                        >
                          <Download className="h-5 w-5 mr-2" aria-hidden="true" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="glass-surface border-white/20 text-white hover:bg-white/10"
                          onClick={handleSaveFlashcards}
                        >
                          <Save className="h-5 w-5 mr-2" aria-hidden="true" />
                          Save Set
                        </Button>
                      </div>
                    )}
                  </div>

                  {flashcards.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">
                          Flashcard {activeFlashcard + 1} of {flashcards.length}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass-surface border-white/20 text-white hover:bg-white/10"
                            onClick={() =>
                              getFlashcardExplanation(
                                flashcards[activeFlashcard]?.question,
                                flashcards[activeFlashcard]?.answer,
                              )
                            }
                          >
                            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                            Get AI Explanation
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-surface border-white/20">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingFlashcard({
                                    index: activeFlashcard,
                                    field: "question",
                                    value: flashcards[activeFlashcard]?.question,
                                  })
                                  setIsEditDialogOpen(true)
                                }}
                                className="text-white"
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
                                className="text-white"
                              >
                                Edit Answer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteFlashcard(activeFlashcard)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Card
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flashcard mb-4">
                        <div className={`flashcard-inner ${showAnswer ? "flipped" : ""}`}>
                          <div className="flashcard-front glass-surface border-white/10 rounded-lg p-8 min-h-[250px] flex items-center justify-center">
                            <div>
                              <p className="font-semibold text-white mb-3">Question:</p>
                              <p className="text-white/90 text-lg">{flashcards[activeFlashcard]?.question}</p>
                            </div>
                          </div>
                          <div className="flashcard-back glass-surface border-white/10 rounded-lg p-8 min-h-[250px] flex items-center justify-center">
                            <div>
                              <p className="font-semibold text-white mb-3">Answer:</p>
                              <p className="text-white/90 text-lg">{flashcards[activeFlashcard]?.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-surface border-white/20 text-white"
                          onClick={handlePrevFlashcard}
                          disabled={activeFlashcard === 0}
                        >
                          Previous
                        </Button>
                        <Button
                          className={
                            showAnswer
                              ? "glass-surface border-white/20 text-white"
                              : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                          }
                          onClick={() => setShowAnswer(!showAnswer)}
                        >
                          {showAnswer ? "Hide Answer" : "Show Answer"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-surface border-white/20 text-white"
                          onClick={handleNextFlashcard}
                          disabled={activeFlashcard === flashcards.length - 1}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </GlassSurface>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Saved Flashcards</h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {savedFlashcards.length > 0 ? (
                      savedFlashcards.map((set) => (
                        <div key={set.id} className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 justify-start glass-surface border-white/20 text-white hover:bg-white/10 text-left"
                            onClick={() => loadSavedFlashcards(set.id)}
                          >
                            <BrainCircuit className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate text-sm">{set.title}</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-surface border-white/20">
                              <DropdownMenuItem
                                onClick={() => deleteSavedFlashcardSet(set.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/60">No saved flashcard sets yet.</p>
                    )}
                  </div>
                </GlassSurface>
              </ScrollReveal>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Flashcard Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-surface border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit {editingFlashcard?.field === "question" ? "Question" : "Answer"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editingFlashcard?.value || ""}
              onChange={(e) =>
                setEditingFlashcard(
                  editingFlashcard ? { ...editingFlashcard, value: e.target.value } : null,
                )
              }
              className="glass-surface border-white/20 text-white placeholder:text-white/40 min-h-[100px] resize-none"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="glass-surface border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={handleEditFlashcard}
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Study Plan Dialog */}
      <Dialog open={isSaveStudyPlanDialogOpen} onOpenChange={setIsSaveStudyPlanDialogOpen}>
        <DialogContent className="glass-surface border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Save Study Plan</DialogTitle>
            <DialogDescription className="text-white/70">
              Give your study plan a title to save it for later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={studyPlanTitle}
              onChange={(e) => setStudyPlanTitle(e.target.value)}
              placeholder="Enter a title for your study plan"
              className="glass-surface border-white/20 text-white placeholder:text-white/40"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="glass-surface border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsSaveStudyPlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={handleSaveStudyPlan}
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
