"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, MessageSquare, Volume2, BookOpen, Loader2 } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSupabase } from "@/components/supabase-provider"

interface CourseSidePanelProps {
  isOpen: boolean
  onClose: () => void
  chapter?: any
  slide?: any
  courseTitle?: string
}

export const CourseSidePanel: React.FC<CourseSidePanelProps> = ({
  isOpen,
  onClose,
  chapter,
  slide,
  courseTitle,
}) => {
  const [activeTab, setActiveTab] = useState<"learn" | "qa" | "read">("learn")
  const [learnMoreContent, setLearnMoreContent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [answering, setAnswering] = useState(false)
  const [isReading, setIsReading] = useState(false)

  const { supabase } = useSupabase()

  // Generate "Learn More" content when panel opens
  useEffect(() => {
    if (isOpen && activeTab === "learn" && !learnMoreContent) {
      generateLearnMore()
    }
  }, [isOpen, activeTab])

  const generateLearnMore = async () => {
    if (!chapter && !slide) return

    setLoading(true)
    try {
      const content = slide
        ? `${slide.content?.title || ""}\n\n${slide.content?.body || ""}\n\n${slide.narrationScript || ""}`
        : chapter
        ? `Chapter: ${chapter.title}\n\n${chapter.slides?.map((s: any) => s.content?.body).join("\n\n") || ""}`
        : ""

      const prompt = slide
        ? `Provide a detailed, comprehensive explanation about this slide content. Include context, examples, and related concepts. Make it educational and engaging.`
        : `Provide a detailed, comprehensive overview of this chapter. Include key concepts, learning objectives, and how it fits into the broader course.`

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "groq",
          prompt: `${prompt}\n\nContent:\n${content}`,
          systemPrompt: "You are an expert educational tutor. Provide clear, detailed explanations that help students understand concepts deeply.",
        }),
      })

      const result = await response.json()
      if (result.success) {
        setLearnMoreContent(result.data.text)
      } else {
        setLearnMoreContent("Unable to generate additional content at this time.")
      }
    } catch (error) {
      console.error("Error generating learn more:", error)
      setLearnMoreContent("Unable to generate additional content at this time.")
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    setAnswering(true)
    setAnswer("")
    try {
      const context = slide
        ? `${slide.content?.title || ""}\n\n${slide.content?.body || ""}`
        : chapter
        ? `Chapter: ${chapter.title}\n\n${chapter.slides?.map((s: any) => s.content?.body).join("\n\n") || ""}`
        : ""

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "groq",
          prompt: `Question: ${question}\n\nContext: ${context}\n\nProvide a clear, educational answer based on the context.`,
          systemPrompt: "You are an expert tutor. Answer questions clearly and helpfully based on the provided context.",
        }),
      })

      const result = await response.json()
      if (result.success) {
        setAnswer(result.data.text)
      } else {
        setAnswer("Unable to answer the question at this time.")
      }
    } catch (error) {
      console.error("Error answering question:", error)
      setAnswer("Unable to answer the question at this time.")
    } finally {
      setAnswering(false)
    }
  }

  const handleReadAloud = () => {
    if (isReading) {
      // Stop reading
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsReading(false)
      return
    }

    const textToRead = slide
      ? `${slide.content?.title || ""}\n\n${slide.content?.body || ""}\n\n${slide.narrationScript || ""}`
      : chapter
      ? `${chapter.title}\n\n${chapter.slides?.map((s: any) => `${s.content?.title || ""}\n${s.content?.body || ""}`).join("\n\n") || ""}`
      : ""

    if (!textToRead || !window.speechSynthesis) {
      return
    }

    setIsReading(true)
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => {
      setIsReading(false)
    }

    utterance.onerror = () => {
      setIsReading(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end pointer-events-none">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-white/10 shadow-2xl pointer-events-auto overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {slide ? slide.content?.title || "Slide Details" : chapter ? chapter.title : "Course Details"}
            </h2>
            {courseTitle && (
              <p className="text-white/60 text-sm">{courseTitle}</p>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("learn")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "learn"
                ? "text-white border-b-2 border-purple-500 bg-white/5"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="h-4 w-4 inline-block mr-2" />
            Learn More
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "qa"
                ? "text-white border-b-2 border-purple-500 bg-white/5"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="h-4 w-4 inline-block mr-2" />
            Ask Question
          </button>
          <button
            onClick={() => setActiveTab("read")}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "read"
                ? "text-white border-b-2 border-purple-500 bg-white/5"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Volume2 className="h-4 w-4 inline-block mr-2" />
            Read Aloud
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "learn" && (
            <GlassSurface className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  <span className="ml-3 text-white/70">Generating detailed content...</span>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {learnMoreContent || "Click to generate detailed content..."}
                  </div>
                </div>
              )}
            </GlassSurface>
          )}

          {activeTab === "qa" && (
            <div className="space-y-4">
              <GlassSurface className="p-6">
                <label className="block text-white font-medium mb-2">
                  Ask a question about this {slide ? "slide" : "chapter"}
                </label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Can you explain this concept in simpler terms?"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mb-4 min-h-[100px]"
                  rows={4}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={answering || !question.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {answering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Ask Question
                    </>
                  )}
                </Button>
              </GlassSurface>

              {answer && (
                <GlassSurface className="p-6 bg-blue-500/10 border-blue-500/30">
                  <h3 className="text-white font-semibold mb-3">Answer:</h3>
                  <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {answer}
                  </div>
                </GlassSurface>
              )}
            </div>
          )}

          {activeTab === "read" && (
            <GlassSurface className="p-6">
              <div className="text-center py-8">
                <Volume2 className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <p className="text-white/70 mb-6">
                  {slide
                    ? "Listen to this slide's content read aloud"
                    : "Listen to this chapter's content read aloud"}
                </p>
                <Button
                  onClick={handleReadAloud}
                  className={`${
                    isReading
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  } text-white`}
                >
                  {isReading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Stop Reading
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Start Reading
                    </>
                  )}
                </Button>
              </div>
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  )
}

