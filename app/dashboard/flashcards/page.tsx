"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { generateFlashcards, trackAIUsage } from "@/lib/ai-service"
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

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Generate flashcards
      const cards = await generateFlashcards(flashcardTopic, Number.parseInt(flashcardCount))

      if (cards.length === 0) {
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
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-pink">Flashcards</h1>
        <p className="text-gray-400 mt-1">Create and study flashcards to boost your memory</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search flashcard sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Flashcards
          </Button>
        </div>
      </div>

      {/* Flashcard Sets Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-800 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : flashcardSets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set) => (
            <Card key={set.id} className="glass-card hover:neon-border-pink transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{set.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{set.subject}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-gray-800 text-gray-300">
                    {set.cards.length} cards
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {set.description || "Tap to study these flashcards"}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Sample cards:</span>
                    <span>
                      {Math.min(3, set.cards.length)} of {set.cards.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {set.cards.slice(0, 3).map((card: any, index: number) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-xs">
                        <p className="font-medium">
                          Q: {card.question.substring(0, 50)}
                          {card.question.length > 50 ? "..." : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-gray-700" onClick={() => handleStudySet(set)}>
                  <BrainCircuit className="mr-2 h-4 w-4" /> Study
                </Button>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => downloadFlashcards(set)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteSet(set.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BrainCircuit className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No flashcard sets found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || subjectFilter !== "all"
              ? "Try adjusting your filters or search query."
              : "Start by creating your first flashcard set."}
          </p>
          <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Flashcards
          </Button>
        </div>
      )}

      {/* Create Flashcard Set Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Flashcard Set</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create your own flashcards or let AI generate them for you.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSet} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  value={newSet.title}
                  onChange={(e) => setNewSet({ ...newSet, title: e.target.value })}
                  placeholder="e.g., Spanish Vocabulary"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <Select
                  value={newSet.subject}
                  onValueChange={(value) => setNewSet({ ...newSet, subject: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
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
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newSet.description}
                onChange={(e) => setNewSet({ ...newSet, description: e.target.value })}
                placeholder="Brief description of this flashcard set"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="border-t border-gray-800 pt-4">
              <h3 className="text-lg font-medium mb-4">Add Flashcards</h3>

              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">
                    Question
                  </label>
                  <Textarea
                    id="question"
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    placeholder="Enter your question"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium">
                    Answer
                  </label>
                  <Textarea
                    id="answer"
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    placeholder="Enter the answer"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <Button type="button" onClick={handleAddCard} className="w-full bg-gray-800 hover:bg-gray-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <h3 className="text-lg font-medium mb-4">Or Generate with AI</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="flashcard-topic" className="text-sm font-medium">
                      Topic
                    </label>
                    <Input
                      id="flashcard-topic"
                      value={flashcardTopic}
                      onChange={(e) => setFlashcardTopic(e.target.value)}
                      placeholder="e.g., Spanish Vocabulary, Chemical Elements"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="flashcard-count" className="text-sm font-medium">
                      Number of Cards
                    </label>
                    <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
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

                <Button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={generatingFlashcards || !flashcardTopic}
                  className="w-full bg-primary hover:bg-primary/80"
                >
                  {generatingFlashcards ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {generatingFlashcards ? "Generating..." : "Generate Flashcards"}
                </Button>
              </div>
            </div>

            {newSet.cards.length > 0 && (
              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Cards ({newSet.cards.length})</h3>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {newSet.cards.map((card, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Card {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-red-400 hover:text-red-300"
                          onClick={() => handleRemoveCard(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Q:</span> {card.question}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">A:</span> {card.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-gray-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80" disabled={newSet.cards.length === 0}>
                Create Flashcard Set
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Study Flashcards Dialog */}
      {currentSet && (
        <Dialog open={isStudyDialogOpen} onOpenChange={setIsStudyDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[700px]">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle>{currentSet.title}</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    {currentSet.subject} • {currentSet.cards.length} cards
                  </DialogDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-700"
                    onClick={shuffleCards}
                    disabled={studyMode === "shuffle"}
                  >
                    <Shuffle className="h-4 w-4 mr-1" /> Shuffle
                  </Button>
                  {studyMode !== "normal" && (
                    <Button variant="outline" size="sm" className="border-gray-700" onClick={resetCards}>
                      <RotateCcw className="h-4 w-4 mr-1" /> Reset
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                <span>Progress</span>
                <span>
                  {currentCardIndex + 1} of {currentSet.cards.length}
                </span>
              </div>
              <Progress value={((currentCardIndex + 1) / currentSet.cards.length) * 100} className="h-2" />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 min-h-[250px] flex flex-col justify-between">
              <div>
                <p className="font-medium mb-2">Question:</p>
                <p className="text-gray-300 mb-6">{currentSet.cards[currentCardIndex]?.question}</p>

                {showAnswer && (
                  <>
                    <p className="font-medium mb-2">Answer:</p>
                    <p className="text-gray-300">{currentSet.cards[currentCardIndex]?.answer}</p>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  className="border-gray-700"
                  onClick={handlePrevCard}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
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
                  className="border-gray-700"
                  onClick={handleNextCard}
                  disabled={currentCardIndex === currentSet.cards.length - 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => copyToClipboard(currentSet.cards[currentCardIndex]?.question, 0)}
              >
                {copiedIndex === 0 ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                Copy Question
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => copyToClipboard(currentSet.cards[currentCardIndex]?.answer, 1)}
              >
                {copiedIndex === 1 ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                Copy Answer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
