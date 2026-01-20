"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BrainCircuit,
  Plus,
  Search,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Shuffle,
  RotateCcw,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

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

export default function FlashcardsPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [flashcardSets, setFlashcardSets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isStudyDialogOpen, setIsStudyDialogOpen] = useState(false)
  const [currentSet, setCurrentSet] = useState<any>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState<"normal" | "shuffle" | "spaced">("normal")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [newSet, setNewSet] = useState({
    title: "",
    description: "",
    subject: "",
    cards: [] as { question: string; answer: string }[],
  })
  const [newCard, setNewCard] = useState({ question: "", answer: "" })
  const [flashcardCount, setFlashcardCount] = useState("10")
  const [flashcardTopic, setFlashcardTopic] = useState("")

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return

      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        setUser({ ...data.user, profile })
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (user) {
      fetchFlashcardSets()
    }
  }, [user, subjectFilter, searchQuery])

  const fetchFlashcardSets = async () => {
    try {
      setLoading(true)
      let query = supabase.from("flashcard_sets").select("*").eq("user_id", user.id)

      if (subjectFilter !== "all") {
        query = query.eq("subject", subjectFilter)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error

      setFlashcardSets(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch flashcard sets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSet = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSet.title || !newSet.subject || newSet.cards.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields and add at least one flashcard",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase.from("flashcard_sets").insert([
        {
          user_id: user.id,
          title: newSet.title,
          description: newSet.description,
          subject: newSet.subject,
          cards: newSet.cards,
        },
      ])

      if (error) throw error

      toast({
        title: "Flashcard Set Created",
        description: "Your flashcard set has been created successfully.",
      })

      setIsCreateDialogOpen(false)
      setNewSet({
        title: "",
        description: "",
        subject: "",
        cards: [],
      })
      fetchFlashcardSets()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create flashcard set",
        variant: "destructive",
      })
    }
  }

  const handleAddCard = () => {
    if (!newCard.question || !newCard.answer) {
      toast({
        title: "Missing fields",
        description: "Please provide both a question and an answer",
        variant: "destructive",
      })
      return
    }

    setNewSet((prev) => ({
      ...prev,
      cards: [...prev.cards, { ...newCard }],
    }))
    setNewCard({ question: "", answer: "" })
  }

  const handleRemoveCard = (index: number) => {
    setNewSet((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }))
  }

  const handleGenerateFlashcards = async () => {
    if (!flashcardTopic) {
      toast({
        title: "Missing topic",
        description: "Please provide a topic to generate flashcards",
        variant: "destructive",
      })
      return
    }

    try {
      setGeneratingFlashcards(true)

      const count = Number.parseInt(flashcardCount)
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: `Generate ${count} flashcards for studying ${flashcardTopic}. Format each flashcard as a JSON object with 'question' and 'answer' fields, and return a JSON array.`,
          systemPrompt:
            "You are an educational AI assistant that creates effective flashcards for studying. Respond ONLY with a JSON array.",
          maxTokens: 1200,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate flashcards")
      }

      let cards: { question: string; answer: string }[] = []
      try {
        const text: string = result.data?.text || ""
        const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || "[]"
        cards = JSON.parse(jsonStr)
      } catch {
        cards = []
      }

      if (!cards.length) {
        throw new Error("Failed to generate flashcards. Please try again with a different topic.")
      }

      setNewSet((prev) => ({
        ...prev,
        title: flashcardTopic,
        cards: [...prev.cards, ...cards],
      }))

      toast({
        title: "Flashcards Generated",
        description: `Successfully generated ${cards.length} flashcards.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate flashcards",
        variant: "destructive",
      })
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  const handleDeleteSet = async (id: string) => {
    try {
      const { error } = await supabase.from("flashcard_sets").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Flashcard Set Deleted",
        description: "The flashcard set has been deleted successfully.",
      })

      fetchFlashcardSets()
      if (isStudyDialogOpen) {
        setIsStudyDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete flashcard set",
        variant: "destructive",
      })
    }
  }

  const handleStudySet = (set: any) => {
    setCurrentSet(set)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setIsStudyDialogOpen(true)
  }

  const handleNextCard = () => {
    if (currentCardIndex < currentSet.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const shuffleCards = () => {
    setStudyMode("shuffle")
    const shuffled = [...currentSet.cards].sort(() => Math.random() - 0.5)
    setCurrentSet({
      ...currentSet,
      cards: shuffled,
    })
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const resetCards = () => {
    setStudyMode("normal")
    fetchFlashcardSets().then(() => {
      const originalSet = flashcardSets.find((set) => set.id === currentSet.id)
      if (originalSet) {
        setCurrentSet(originalSet)
        setCurrentCardIndex(0)
        setShowAnswer(false)
      }
    })
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

  const downloadFlashcards = (set: any) => {
    const flashcardsText = set.cards
      .map((card: any, index: number) => `Card ${index + 1}:\nQuestion: ${card.question}\nAnswer: ${card.answer}\n`)
      .join("\n")

    const blob = new Blob([flashcardsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `flashcards-${set.title.replace(/\s+/g, "-").toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Flashcards</span>
          </h1>
          <p className="text-white/70">Create and study flashcards to boost your memory</p>
        </div>
      </ScrollReveal>

      {/* Filters and Search */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <Input
                placeholder="Search flashcard sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-surface border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px] glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  <SelectItem value="all" className="text-white">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject} className="text-white">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={() => router.push("/dashboard/flashcards/new")}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Flashcards
              </Button>
            </div>
          </div>
        </GlassSurface>
      </ScrollReveal>

      {/* Flashcard Sets Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-surface p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : flashcardSets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set, index) => (
            <ScrollReveal key={set.id} direction="up" delay={0.05 * index}>
              <AnimatedCard variant="3d" delay={0.05 * index} className="cursor-pointer group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                        {set.title}
                      </h3>
                      <p className="text-sm text-white/60 truncate">{set.subject}</p>
                    </div>
                    <Badge className="glass-surface border-white/10 text-white/80">
                      {set.cards.length} cards
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2 mb-4">
                    {set.description || "Tap to study these flashcards"}
                  </p>
                  <div className="space-y-2 mb-4">
                    {set.cards.slice(0, 2).map((card: any, idx: number) => (
                      <div key={idx} className="glass-surface border-white/10 p-2 rounded text-xs">
                        <p className="font-medium text-white/80">
                          Q: {card.question.substring(0, 40)}
                          {card.question.length > 40 ? "..." : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-surface border-white/20 hover:border-purple-500/50 text-white"
                      onClick={() => handleStudySet(set)}
                    >
                      <BrainCircuit className="mr-2 h-4 w-4" aria-hidden="true" />
                      Study
                    </Button>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/60 hover:text-white"
                        onClick={() => downloadFlashcards(set)}
                        aria-label="Download flashcards"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDeleteSet(set.id)}
                        aria-label="Delete flashcard set"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal direction="up">
          <GlassSurface className="p-12 text-center">
            <BrainCircuit className="mx-auto h-16 w-16 text-white/20 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-white mb-2">No flashcard sets found</h3>
            <p className="text-white/60 mb-6">
              {searchQuery || subjectFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Start by creating your first flashcard set."}
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              onClick={() => router.push("/dashboard/flashcards/new")}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Flashcards
            </Button>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Create Flashcard Set Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-surface border-white/20 sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Flashcard Set</DialogTitle>
            <DialogDescription className="text-white/70">
              Create your own flashcards or let AI generate them for you.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSet} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={newSet.title}
                  onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                  placeholder="e.g., Spanish Vocabulary"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white mb-2 block">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={newSet.subject}
                  onValueChange={(value) => setNewSet({ ...newSet, subject: value })}
                  required
                >
                  <SelectTrigger className="glass-surface border-white/20 text-white">
                    <SelectValue placeholder="Select a subject" />
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
            </div>

            <div>
              <Label htmlFor="description" className="text-white mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={newSet.description}
                onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                placeholder="Brief description of this flashcard set"
                className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Add Flashcards</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="question" className="text-white mb-2 block">
                    Question
                  </Label>
                  <Textarea
                    id="question"
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    placeholder="Enter your question"
                    className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="answer" className="text-white mb-2 block">
                    Answer
                  </Label>
                  <Textarea
                    id="answer"
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    placeholder="Enter the answer"
                    className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddCard}
                  className="w-full glass-surface border-white/20 hover:border-purple-500/50 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Add Card
                </Button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Or Generate with AI</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="flashcard-topic" className="text-white mb-2 block">
                      Topic
                    </Label>
                    <Input
                      id="flashcard-topic"
                      value={flashcardTopic}
                      onChange={(e) => setFlashcardTopic(e.target.value)}
                      placeholder="e.g., Spanish Vocabulary, Chemical Elements"
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

                <Button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={generatingFlashcards || !flashcardTopic}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white disabled:opacity-50"
                >
                  {generatingFlashcards ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                      Generate Flashcards
                    </>
                  )}
                </Button>
              </div>
            </div>

            {newSet.cards.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Cards ({newSet.cards.length})</h3>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {newSet.cards.map((card, index) => (
                    <div key={index} className="glass-surface border-white/10 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-white/60">Card {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-red-400 hover:text-red-300"
                          onClick={() => handleRemoveCard(index)}
                          type="button"
                          aria-label="Remove card"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-white/80">
                        <span className="font-medium">Q:</span> {card.question}
                      </p>
                      <p className="text-sm text-white/80">
                        <span className="font-medium">A:</span> {card.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className="flex-shrink-0 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                className="glass-surface border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                disabled={newSet.cards.length === 0}
              >
                Create Flashcard Set
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Study Flashcards Dialog - Redesigned */}
      {currentSet && (
        <Dialog open={isStudyDialogOpen} onOpenChange={setIsStudyDialogOpen}>
          <DialogContent className="glass-surface border-white/20 sm:max-w-[900px] max-w-[95vw] max-h-[90vh] p-0 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <DialogTitle className="text-white text-2xl mb-1">{currentSet.title}</DialogTitle>
                  <DialogDescription className="text-white/70">
                    {currentSet.subject} • {currentSet.cards.length} cards
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-surface border-white/20 text-white hover:bg-white/10"
                    onClick={shuffleCards}
                    disabled={studyMode === "shuffle"}
                  >
                    <Shuffle className="h-4 w-4 mr-1" aria-hidden="true" />
                    Shuffle
                  </Button>
                  {studyMode !== "normal" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-surface border-white/20 text-white hover:bg-white/10"
                      onClick={resetCards}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2 text-sm text-white/70">
                  <span>Progress</span>
                  <span className="font-medium">
                    {currentCardIndex + 1} / {currentSet.cards.length}
                  </span>
                </div>
                <Progress value={((currentCardIndex + 1) / currentSet.cards.length) * 100} className="h-2" />
              </div>
            </div>

            {/* Card Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="glass-surface border-white/20 rounded-xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center items-center text-center">
                  <div className="w-full space-y-6">
                    <div>
                      <p className="text-sm font-medium text-purple-400 mb-4 uppercase tracking-wide">Question</p>
                      <p className="text-white text-xl md:text-2xl leading-relaxed font-medium">
                        {currentSet.cards[currentCardIndex]?.question}
                      </p>
                    </div>

                    {showAnswer && (
                      <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4">
                        <p className="text-sm font-medium text-green-400 mb-4 uppercase tracking-wide">Answer</p>
                        <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                          {currentSet.cards[currentCardIndex]?.answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="p-6 border-t border-white/10 flex-shrink-0 space-y-4">
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-surface border-white/20 text-white hover:bg-white/10 flex-1"
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-5 w-5 mr-2" aria-hidden="true" />
                  Previous
                </Button>
                <Button
                  size="lg"
                  className={
                    showAnswer
                      ? "glass-surface border-white/20 text-white hover:bg-white/10 flex-1"
                      : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex-1"
                  }
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? "Hide Answer" : "Show Answer"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-surface border-white/20 text-white hover:bg-white/10 flex-1"
                  onClick={handleNextCard}
                  disabled={currentCardIndex === currentSet.cards.length - 1}
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" aria-hidden="true" />
                </Button>
              </div>

              {/* Copy Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => copyToClipboard(currentSet.cards[currentCardIndex]?.question, 0)}
                >
                  {copiedIndex === 0 ? (
                    <>
                      <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
                      Copy Question
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => copyToClipboard(currentSet.cards[currentCardIndex]?.answer, 1)}
                >
                  {copiedIndex === 1 ? (
                    <>
                      <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" aria-hidden="true" />
                      Copy Answer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
