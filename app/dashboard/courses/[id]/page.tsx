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
} from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import dynamic from "next/dynamic"
import { CourseSidePanel } from "@/components/courses/CourseSidePanel"

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
  const params = useParams()
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

  useEffect(() => {
    const fetchCourse = async () => {
      if (!supabase || !params.id) return

      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", params.id)
          .single()

        if (fetchError) throw fetchError

        if (!data) {
          setError("Course not found")
          return
        }

        setCourse(data)
      } catch (err: any) {
        console.error("Error fetching course:", err)
        setError(err.message || "Failed to load course")
        toast({
          id: `course-error-${Date.now()}`,
          title: "Error",
          description: "Failed to load course. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()

    // Poll for updates if course is pending or processing
    const pollInterval = setInterval(() => {
      if (!supabase || !params.id) return
      
      supabase
        .from("courses")
        .select("*")
        .eq("id", params.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setCourse((prevCourse: any) => {
              // Only update if status changed or layout was updated
              if (!prevCourse || prevCourse.status !== data.status || 
                  JSON.stringify(prevCourse.layout) !== JSON.stringify(data.layout)) {
                return data
              }
              return prevCourse
            })
            
            // Stop polling if course is completed or failed
            if (data.status === "completed" || data.status === "failed") {
              clearInterval(pollInterval)
            }
          }
        })
        .catch((err) => console.error("Polling error:", err))
    }, 3000) // Poll every 3 seconds

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

        // Fetch progress
        const { data: progressData } = await supabase
          .from("course_progress")
          .select("*")
          .eq("course_id", params.id)
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)

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
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-white/70 mb-6">{error || "The course you're looking for doesn't exist."}</p>
          <Link href="/dashboard/courses">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
              className="text-white/70 hover:text-white mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(course.status)}
                <Badge variant="outline" className="border-white/20 text-white/70">
                  {course.type?.replace("-", " ")}
                </Badge>
                {course.style && (
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    {course.style}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 text-white/60 text-sm">
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
                  className="border-white/20 text-white hover:bg-white/10"
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
            <h2 className="text-xl font-bold text-white mb-4">Course Preview</h2>
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
            <h2 className="text-xl font-bold text-white mb-4">Course Structure</h2>
            <div className="space-y-4">
              {layout.chapters.map((chapter: any, chapterIndex: number) => (
                <div
                  key={chapter.chapterId || chapterIndex}
                  className="p-4 rounded-lg glass-surface border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Chapter {chapter.order || chapterIndex + 1}: {chapter.title}
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        {chapter.slides?.length || 0} slides
                      </p>
                    </div>
                  </div>
                  {chapter.slides && chapter.slides.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {chapter.slides.map((slide: any, slideIndex: number) => (
                        <div
                          key={slide.slideId || slideIndex}
                          className="p-3 rounded bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                                  {slide.type?.replace("-", " ") || "slide"}
                                </Badge>
                                <span className="text-white/90 font-medium text-sm">
                                  {slide.content?.title || `Slide ${slideIndex + 1}`}
                                </span>
                              </div>
                              {slide.content?.body && (
                                <p className="text-white/60 text-xs line-clamp-2 mt-1">
                                  {slide.content.body.replace(/[#*`]/g, "").substring(0, 100)}...
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <div className="text-white/50 text-xs">
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10 h-7 px-2"
                              >
                                <Sparkles className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <Button
                      onClick={() => {
                        setSelectedChapter(chapter)
                        setSelectedSlide(null)
                        setSidePanelOpen(true)
                      }}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 text-sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Learn More About This Chapter
                    </Button>
                  </div>
                </div>
              ))}
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
                <p className="text-white/70 text-sm mt-1">
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

