"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BrainCircuit,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  ChevronLeft,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

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

export default function NewFlashcardPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [newSet, setNewSet] = useState({
    title: "",
    description: "",
    subject: "none",
    cards: [] as { question: string; answer: string }[],
  })
  const [newCard, setNewCard] = useState({ question: "", answer: "" })
  const [flashcardCount, setFlashcardCount] = useState("10")
  const [flashcardTopic, setFlashcardTopic] = useState("")

  const handleAddCard = () => {
    if (!newCard.question || !newCard.answer) {
      toast({
        title: "Missing fields",
        description: "Please provide both a question and answer",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSet.title || !newSet.cards.length) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and at least one flashcard",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Authentication service is not available",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("You must be logged in to create flashcards")
      }

      const { error } = await supabase.from("flashcard_sets").insert({
        user_id: userData.user.id,
        title: newSet.title,
        description: newSet.description || null,
        subject: newSet.subject === "none" ? null : newSet.subject,
        cards: newSet.cards,
      })

      if (error) throw error

      toast({
        title: "Flashcard Set Created!",
        description: "Your flashcard set has been created successfully.",
      })

      router.push("/dashboard/flashcards")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create flashcard set",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <div className="mb-8">
          <Link href="/dashboard/flashcards">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Flashcards
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Create New Flashcard Set</span>
          </h1>
          <p className="text-white/70">Build a new set of flashcards for studying</p>
        </div>
      </ScrollReveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Flashcard Set Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={newSet.title}
                  onChange={(e) => setNewSet((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Biology Chapter 5"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newSet.description}
                  onChange={(e) => setNewSet((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this flashcard set"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white">
                  Subject
                </Label>
                <Select value={newSet.subject} onValueChange={(value) => setNewSet((prev) => ({ ...prev, subject: value }))}>
                  <SelectTrigger className="glass-surface border-white/20 text-white mt-1">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-white/20">
                    <SelectItem value="none">None</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject} className="text-white">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassSurface>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">AI Generation</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic" className="text-white">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={flashcardTopic}
                  onChange={(e) => setFlashcardTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, World War II, Calculus Derivatives"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="count" className="text-white">
                  Number of Flashcards
                </Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={flashcardCount}
                  onChange={(e) => setFlashcardCount(e.target.value)}
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerateFlashcards}
                disabled={generatingFlashcards || !flashcardTopic}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {generatingFlashcards ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Flashcards with AI
                  </>
                )}
              </Button>
            </div>
          </GlassSurface>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add Flashcards Manually</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question" className="text-white">
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={newCard.question}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter the question"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="answer" className="text-white">
                  Answer
                </Label>
                <Textarea
                  id="answer"
                  value={newCard.answer}
                  onChange={(e) => setNewCard((prev) => ({ ...prev, answer: e.target.value }))}
                  placeholder="Enter the answer"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  rows={3}
                />
              </div>

              <Button
                type="button"
                onClick={handleAddCard}
                disabled={!newCard.question || !newCard.answer}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Flashcard
              </Button>
            </div>
          </GlassSurface>
        </ScrollReveal>

        {newSet.cards.length > 0 && (
          <ScrollReveal direction="up" delay={0.4}>
            <GlassSurface className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Flashcards ({newSet.cards.length})
                </h2>
                <Button
                  type="submit"
                  disabled={loading || !newSet.title || !newSet.cards.length}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Save Flashcard Set
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newSet.cards.map((card, index) => (
                  <div key={index} className="glass-surface border-white/10 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white/60 text-sm">Card {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCard(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-white font-medium mb-1">Q: {card.question}</p>
                    <p className="text-white/70 text-sm">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            </GlassSurface>
          </ScrollReveal>
        )}

        <ScrollReveal direction="up" delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <Link href="/dashboard/flashcards" className="flex-1 sm:flex-initial">
              <Button type="button" variant="ghost" className="text-white/70 hover:text-white w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !newSet.title || !newSet.cards.length}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white flex-1 sm:flex-initial"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Create Flashcard Set
                </>
              )}
            </Button>
          </div>
        </ScrollReveal>
      </form>
    </div>
  )
}

