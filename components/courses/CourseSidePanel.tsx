"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, MessageSquare, Volume2, BookOpen, Loader2, Pause, Play, VolumeX } from "lucide-react"
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
  const [isPaused, setIsPaused] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [speechRate, setSpeechRate] = useState(0.9)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  const { supabase } = useSupabase()

  // Generate "Learn More" content when panel opens
  useEffect(() => {
    if (isOpen && activeTab === "learn" && !learnMoreContent) {
      generateLearnMore()
    }
  }, [isOpen, activeTab])

  // Load available voices when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
        if (voices.length > 0 && !selectedVoice) {
          // Default to first English voice or first available
          const englishVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0]
          setSelectedVoice(englishVoice?.name || voices[0].name)
        }
      }
      
      loadVoices()
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

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
          provider: "gemini", // Will automatically fallback if not available
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
          provider: "gemini", // Will automatically fallback if not available
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
    if (!window.speechSynthesis) {
      return
    }

    if (isReading && !isPaused) {
      // Pause reading
      window.speechSynthesis.pause()
      setIsPaused(true)
      return
    }

    if (isPaused) {
      // Resume reading
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    if (isReading) {
      // Stop reading
      window.speechSynthesis.cancel()
      setIsReading(false)
      setIsPaused(false)
      setCurrentUtterance(null)
      return
    }

    const textToRead = slide
      ? `${slide.content?.title || ""}\n\n${slide.content?.body || ""}\n\n${slide.narrationScript || ""}`
      : chapter
      ? `${chapter.title}\n\n${chapter.slides?.map((s: any) => `${s.content?.title || ""}\n${s.content?.body || ""}`).join("\n\n") || ""}`
      : ""

    if (!textToRead) {
      return
    }

    setIsReading(true)
    setIsPaused(false)
    
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.rate = speechRate
    utterance.pitch = speechPitch
    utterance.volume = 1

    // Set voice if selected
    if (selectedVoice) {
      const voice = availableVoices.find((v) => v.name === selectedVoice)
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onend = () => {
      setIsReading(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    utterance.onerror = () => {
      setIsReading(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }

    setCurrentUtterance(utterance)
    window.speechSynthesis.speak(utterance)
  }

  const handleStopReading = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      setIsPaused(false)
      setCurrentUtterance(null)
    }
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
              <div className="space-y-6">
                <div className="text-center">
                  <Volume2 className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-white/70 mb-6">
                    {slide
                      ? "Listen to this slide's content read aloud"
                      : "Listen to this chapter's content read aloud"}
                  </p>
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isReading}
                    aria-label="Voice selection"
                    className="w-full glass-surface border border-white/20 text-white bg-white/5 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {availableVoices.length === 0 ? (
                      <option value="">Loading voices...</option>
                    ) : (
                      availableVoices.map((voice) => (
                        <option key={voice.name} value={voice.name} className="bg-gray-800">
                          {voice.name} ({voice.lang})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Speed Control */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Speed: {speechRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    disabled={isReading}
                    aria-label="Speech speed control"
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>

                {/* Pitch Control */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Pitch: {speechPitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    disabled={isReading}
                    aria-label="Speech pitch control"
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>Lower</span>
                    <span>Normal</span>
                    <span>Higher</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleReadAloud}
                    disabled={!window.speechSynthesis}
                    className={`flex-1 ${
                      isReading && !isPaused
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : isPaused
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    } text-white border-0`}
                  >
                    {isReading && !isPaused ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : isPaused ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Start Reading
                      </>
                    )}
                  </Button>
                  {isReading && (
                    <Button
                      onClick={handleStopReading}
                      className="bg-red-500 hover:bg-red-600 text-white border-0"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {!window.speechSynthesis && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Text-to-speech is not supported in your browser.
                    </p>
                  </div>
                )}
              </div>
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  )
}

