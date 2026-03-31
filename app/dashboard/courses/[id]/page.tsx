"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Play,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  Edit,
  Download,
  HelpCircle,
  BookOpen,
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Music,
} from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import dynamic from "next/dynamic"
import { CourseSidePanel } from "@/components/courses/CourseSidePanel"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Dynamically import Remotion Player to avoid SSR issues
const RemotionPlayer = dynamic(
  () =>
    import("@remotion/player").then((mod) => {
      return ({ inputProps, ...props }: any) => {
        const { Player } = mod
        const { CourseVideo } = require("@/remotion/components/CourseVideo")
        return <Player component={CourseVideo} inputProps={inputProps} {...props} />
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <LoadingSpinner />
      </div>
    ),
  }
)

function CourseDetailContent() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [progress, setProgress] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [generatingQuestions, setGeneratingQuestions] = useState<string | null>(null)
  const [enhancing, setEnhancing] = useState(false)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<any>(null)
  const [selectedSlide, setSelectedSlide] = useState<any>(null)

  // Add Chapter Modal State
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false)
  const [newChapterCount, setNewChapterCount] = useState(1)
  const [newChapterContext, setNewChapterContext] = useState("")
  const [isGeneratingChapters, setIsGeneratingChapters] = useState(false)

  useEffect(() => {
    const fetchCourse = async (silent = false) => {
      if (!supabase || !params.id) return null

      try {
        if (!silent) setLoading(true)
        const { data, error: fetchError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", params.id)
          .single()

        if (fetchError) throw fetchError

        if (!data) {
          setError("Course not found")
          return null
        }

        // Fetch slides to get audio URLs
        const { data: slides } = await supabase
          .from("course_slides")
          .select("chapter_id, slide_id, audio_url, audio_duration, caption_data")
          .eq("course_id", params.id)
          
        let finalData = { ...data }
          
        if (slides && (finalData.layout as any)?.chapters) {
          (finalData.layout as any).chapters = (finalData.layout as any).chapters.map((chapter: any) => ({
            ...chapter,
            slides: chapter.slides?.map((slide: any) => {
              const dbSlide = slides.find((s: any) => s.slide_id === slide.slideId && s.chapter_id === chapter.chapterId)
              if (dbSlide) {
                return {
                  ...slide,
                  audioUrl: dbSlide.audio_url,
                  audioDuration: dbSlide.audio_duration,
                  captionData: dbSlide.caption_data
                }
              }
              return slide
            })
          }))
        }

        setCourse((prevCourse: any) => {
          if (silent && prevCourse) {
            // Only update state if status or fully mapped layout changed to prevent video remounts
            if (prevCourse.status === finalData.status && 
                JSON.stringify(prevCourse.layout) === JSON.stringify(finalData.layout)) {
              return prevCourse
            }
          }
          return finalData
        })
        
        return finalData
      } catch (err: any) {
        console.error("Error fetching course:", err)
        if (!silent) {
          setError(err.message || "Failed to load course")
          toast({
            id: `course-error-${Date.now()}`,
            title: "Error",
            description: "Failed to load course. Please try again.",
            variant: "destructive",
          })
        }
        return null
      } finally {
        if (!silent) setLoading(false)
      }
    }

    fetchCourse()

    // Poll for updates if course is pending/processing OR if audio is still generating
    const pollInterval = setInterval(async () => {
      try {
        const updatedCourse = await fetchCourse(true)
        if (updatedCourse) {
          const courseDone = updatedCourse.status === "completed" || updatedCourse.status === "failed"
          const audioDone = updatedCourse.audio_status === "completed" || updatedCourse.audio_status === "failed"
          // Stop polling only when BOTH course layout AND audio are done
          if (courseDone && audioDone) {
            clearInterval(pollInterval)
          }
        }
      } catch (err) {
        console.error("Polling error:", err)
      }
    }, 5000) // Poll every 5 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }, [supabase, params.id, toast])

  // Fetch questions, progress, and resources
  useEffect(() => {
    if (!supabase || !params.id || !course || course.status !== "completed") return

    const fetchAdditionalData = async () => {
      try {
        // Fetch questions
        const { data: questionsData } = await supabase
          .from("course_questions")
          .select("*")
          .eq("course_id", params.id)
          .order("order_index", { ascending: true })

        if (questionsData) {
          setQuestions(questionsData)
        }

        const userId = (await supabase.auth.getUser()).data.user?.id
        if (!userId) return

        // Fetch progress
        const { data: progressData } = await supabase
          .from("course_progress")
          .select("*")
          .eq("course_id", params.id)
          .eq("user_id", userId)

        if (progressData && progressData.length > 0) {
          const totalSlides = course.layout?.chapters?.reduce(
            (total: number, ch: any) => total + (ch.slides?.length || 0),
            0
          ) || 0
          const completedSlides = progressData.filter((p) => p.completed).length
          setProgress({
            totalSlides,
            completedSlides,
            progressPercentage: totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0,
            data: progressData,
          })
        }

        // Fetch resources
        const { data: resourcesData } = await supabase
          .from("course_resources")
          .select("*")
          .eq("course_id", params.id)
          .order("order_index", { ascending: true })

        if (resourcesData) {
          setResources(resourcesData)
        }
      } catch (err) {
        console.error("Error fetching additional data:", err)
      }
    }

    fetchAdditionalData()
  }, [supabase, params.id, course])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleGenerateQuestions = async (slideId: string, chapterId: string, content: string) => {
    if (!supabase || !params.id) return

    setGeneratingQuestions(slideId)
    try {
      const response = await fetch(`/api/courses/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          slideId,
          chapterId,
          content,
          count: 3,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate questions")
      }

      toast({
        id: `questions-generated-${Date.now()}`,
        title: "Questions Generated",
        description: `Generated ${result.questions?.length || 0} questions for this slide.`,
      })

      // Refresh questions
      const { data: questionsData } = await supabase
        .from("course_questions")
        .select("*")
        .eq("course_id", params.id)
        .order("order_index", { ascending: true })

      if (questionsData) {
        setQuestions(questionsData)
      }
    } catch (err: any) {
      toast({
        id: `questions-error-${Date.now()}`,
        title: "Error",
        description: err.message || "Failed to generate questions",
        variant: "destructive",
      })
    } finally {
      setGeneratingQuestions(null)
    }
  }

  const handleUpdateProgress = async (slideId: string, completed: boolean, timeSpent: number) => {
    if (!supabase || !params.id) return

    try {
      if (params.id) {
        await fetch(`/api/courses/${params.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slideId,
            completed,
            timeSpent,
          }),
        })

        // Track analytics
        await fetch(`/api/courses/${params.id}/analytics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: completed ? "complete" : "view",
            eventData: { slideId, timeSpent },
          }),
        })
      }
    } catch (err) {
      console.error("Error updating progress:", err)
    }
  }

  const handleEnhanceCourse = async () => {
    if (!supabase || !params.id || enhancing) return

    setEnhancing(true)
    try {
      const response = await fetch(`/api/courses/${params.id}/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to enhance course")
      }

      toast({
        id: `course-enhanced-${Date.now()}`,
        title: "Course Enhanced!",
        description: `Added ${result.totalSlides} slides across ${result.chapters} chapters.`,
      })

      // Refresh course data
      router.refresh()
      
      // Reload the page to show updated content
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      console.error("Error enhancing course:", err)
      toast({
        id: `course-enhance-error-${Date.now()}`,
        title: "Error",
        description: err.message || "Failed to enhance course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnhancing(false)
    }
  }

  const handleGenerateChapters = async () => {
    if (!supabase || !params.id) return
    setIsGeneratingChapters(true)
    try {
      const response = await fetch(`/api/courses/${params.id}/chapters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: newChapterCount, context: newChapterContext }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to add chapters")
      
      toast({
        id: `chapters-added-${Date.now()}`,
        title: "Success",
        description: result.message || `Added ${newChapterCount} new chapters.`,
      })
      
      setIsAddChapterModalOpen(false)
      setNewChapterContext("")
      setNewChapterCount(1)
      
      // Refresh course data
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsGeneratingChapters(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Course Not Found</h2>
          <p className="text-foreground/70 mb-6">{error || "The course you're looking for doesn't exist."}</p>
          <Link href="/dashboard/courses">
            <Button variant="outline" className="border-foreground/20 text-white hover:bg-foreground/10">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </GlassSurface>
      </div>
    )
  }

  const layout = course.layout as any
  const totalFrames = course.estimated_duration ? course.estimated_duration * 30 : 1800 // 30 fps

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-6">
          <Link href="/dashboard/courses">
            <Button
              variant="ghost"
              className="text-foreground/70 hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                {getStatusBadge(course.status)}
                <Badge variant="outline" className="border-foreground/20 text-foreground/70">
                  {course.type?.replace("-", " ")}
                </Badge>
                {course.style && (
                  <Badge variant="outline" className="border-foreground/20 text-foreground/70">
                    {course.style}
                  </Badge>
                )}
                {/* Audio Status Badge */}
                {course.status === "completed" && (
                  course.audio_status === "completed" ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                      <Volume2 className="h-3 w-3" />
                      Audio Ready
                    </Badge>
                  ) : course.audio_status === "processing" ? (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating Audio...
                    </Badge>
                  ) : course.audio_status === "failed" ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                      <VolumeX className="h-3 w-3" />
                      Audio Failed
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 flex items-center gap-1">
                      <Music className="h-3 w-3 animate-pulse" />
                      Audio Queued
                    </Badge>
                  )
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 text-foreground/60 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.estimated_duration)}</span>
                </div>
                {layout?.chapters && (
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>{layout.chapters.length} chapters</span>
                  </div>
                )}
              </div>
            </div>
            {course.status === "completed" && (
              <Link href={`/dashboard/courses/${course.id}/edit`}>
                <Button
                  variant="outline"
                  className="border-foreground/20 text-white hover:bg-foreground/10"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Video Player */}
      {course.status === "completed" || course.status === "processing" ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Course Preview</h2>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <RemotionPlayer
                durationInFrames={totalFrames}
                compositionWidth={1920}
                compositionHeight={1080}
                fps={30}
                controls
                loop={false}
                inputProps={{
                  courseId: course.id,
                  chapters: layout?.chapters || [],
                  style: course.style || "professional",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </GlassSurface>
        </ScrollReveal>
      ) : null}

      {/* Course Structure */}
      {layout?.chapters && layout.chapters.length > 0 && (
        <ScrollReveal direction="up" delay={0.2}>
          <GlassSurface className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Course Structure</h2>
              <Button
                onClick={() => setIsAddChapterModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-foreground/20 text-white hover:bg-foreground/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Chapter
              </Button>
            </div>
            <div className="space-y-4">
              {layout.chapters.map((chapter: any, chapterIndex: number) => {
                const chapterKey = chapter.chapterId || `chapter-${chapterIndex}`
                const isExpanded = expandedSections[chapterKey] ?? true // Default to expanded

                return (
                  <div
                    key={chapterKey}
                    className="p-4 rounded-lg glass-surface border border-foreground/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => toggleSection(chapterKey)}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <h3 className="text-lg font-semibold text-foreground">
                            Chapter {chapter.order || chapterIndex + 1}: {chapter.title}
                          </h3>
                        </div>
                        <p className="text-foreground/60 text-sm mt-1 ml-8">
                          {chapter.slides?.length || 0} slides
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => {
                            // TODO: Edit chapter functionality
                            toast({
                              id: `edit-chapter-${Date.now()}`,
                              title: "Coming Soon",
                              description: "Chapter editing feature will be available soon.",
                            })
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <>
                        {chapter.slides && chapter.slides.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {chapter.slides.map((slide: any, slideIndex: number) => (
                              <div
                                key={slide.slideId || slideIndex}
                                className="p-3 rounded bg-white/5 border border-foreground/5 hover:border-cyan-500/30 transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="border-foreground/20 text-foreground/70 text-xs">
                                        {slide.type?.replace("-", " ") || "slide"}
                                      </Badge>
                                      <span className="text-white/90 font-medium text-sm">
                                        {slide.content?.title || `Slide ${slideIndex + 1}`}
                                      </span>
                                    </div>
                                    {slide.content?.body && (
                                      <p className="text-foreground/60 text-xs line-clamp-2 mt-1">
                                        {slide.content.body.replace(/[#*`]/g, "").substring(0, 100)}...
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <div className="text-foreground/50 text-xs">
                                      {slide.estimatedDuration || 30}s
                                    </div>
                                    <Button
                                      onClick={() => {
                                        setSelectedSlide(slide)
                                        setSelectedChapter(chapter)
                                        setSidePanelOpen(true)
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground/70 hover:text-foreground hover:bg-foreground/10 h-7 px-2"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-foreground/10">
                          <Button
                            onClick={() => {
                              setSelectedChapter(chapter)
                              setSelectedSlide(null)
                              setSidePanelOpen(true)
                            }}
                            variant="outline"
                            className="w-full border-foreground/20 text-white hover:bg-foreground/10 text-sm"
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Learn More About This Chapter
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Processing Status */}
      {course.status === "processing" && (
        <ScrollReveal direction="up" delay={0.3}>
          <GlassSurface className="p-6 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-blue-400 font-semibold">Course is being generated</p>
                <p className="text-foreground/70 text-sm mt-1">
                  This may take a few minutes. The course will be ready for preview shortly.
                </p>
              </div>
            </div>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Interactive Side Panel */}
      <CourseSidePanel
        isOpen={sidePanelOpen}
        onClose={() => {
          setSidePanelOpen(false)
          setSelectedChapter(null)
          setSelectedSlide(null)
        }}
        chapter={selectedChapter}
        slide={selectedSlide}
        courseTitle={course?.title}
      />

      {/* Add Chapter Dialog */}
      <Dialog open={isAddChapterModalOpen} onOpenChange={setIsAddChapterModalOpen}>
        <DialogContent className="glass-surface border-foreground/20 text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Add AI Chapters
            </DialogTitle>
            <DialogDescription className="text-foreground/70">
              Our AI will analyze the existing course content and intelligently generate continuation chapters.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="count" className="text-right">
                Chapters
              </Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={3}
                value={newChapterCount}
                onChange={(e) => setNewChapterCount(parseInt(e.target.value) || 1)}
                className="col-span-3 glass-surface border-foreground/20 text-white"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="context" className="text-right mt-2">
                Instructions
              </Label>
              <Textarea
                id="context"
                placeholder="What should the AI focus on next? (Optional)"
                value={newChapterContext}
                onChange={(e) => setNewChapterContext(e.target.value)}
                className="col-span-3 glass-surface border-foreground/20 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChapterModalOpen(false)} disabled={isGeneratingChapters}>
              Cancel
            </Button>
            <Button onClick={handleGenerateChapters} disabled={isGeneratingChapters} className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 text-white">
              {isGeneratingChapters ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Chapters"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 md:p-8 lg:p-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      }
    >
      <CourseDetailContent />
    </Suspense>
  )
}

