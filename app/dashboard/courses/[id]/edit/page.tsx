"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2, X, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import dynamic from "next/dynamic"

// Dynamically import Remotion Player for editing
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

function CourseEditContent() {
  const params = useParams()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          title: "Error",
          description: "Failed to load course. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [supabase, params.id, toast])

  const handleSave = async () => {
    if (!supabase || !course) return

    setSaving(true)
    try {
      const { error: updateError } = await supabase
        .from("courses")
        .update({
          title: course.title,
          layout: course.layout,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Course saved successfully!",
      })

      router.push(`/dashboard/courses/${course.id}`)
    } catch (err: any) {
      console.error("Error saving course:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to save course",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSlide = (chapterIndex: number, slideIndex: number, field: string, value: any) => {
    if (!course) return

    const updatedCourse = { ...course }
    const layout = { ...updatedCourse.layout }
    const chapters = [...(layout.chapters || [])]
    const chapter = { ...chapters[chapterIndex] }
    const slides = [...(chapter.slides || [])]
    const slide = { ...slides[slideIndex] }

    if (field === "title") {
      slide.content = { ...slide.content, title: value }
    } else if (field === "body") {
      slide.content = { ...slide.content, body: value }
    } else if (field === "narration") {
      slide.narrationScript = value
    }

    slides[slideIndex] = slide
    chapter.slides = slides
    chapters[chapterIndex] = chapter
    layout.chapters = chapters
    updatedCourse.layout = layout

    setCourse(updatedCourse)
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
  const totalFrames = course.estimated_duration ? course.estimated_duration * 30 : 1800

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-6">
          <Link href={`/dashboard/courses/${course.id}`}>
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Edit Course</h1>
              <p className="text-white/70">{course.title}</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Live Preview</h2>
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
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

        {/* Editor */}
        <ScrollReveal direction="up" delay={0.2}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Content</h2>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {layout?.chapters?.map((chapter: any, chapterIndex: number) => (
                <div key={chapter.chapterId || chapterIndex} className="border-b border-white/10 pb-6 last:border-0">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Chapter {chapter.order || chapterIndex + 1}: {chapter.title}
                  </h3>
                  <div className="space-y-4">
                    {chapter.slides?.map((slide: any, slideIndex: number) => (
                      <div
                        key={slide.slideId || slideIndex}
                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                            {slide.type?.replace("-", " ") || "slide"}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`slide-${slideIndex}-title`} className="text-white/70 text-sm">
                              Title
                            </Label>
                            <Input
                              id={`slide-${slideIndex}-title`}
                              value={slide.content?.title || ""}
                              onChange={(e) =>
                                handleUpdateSlide(chapterIndex, slideIndex, "title", e.target.value)
                              }
                              className="mt-1 glass-surface border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`slide-${slideIndex}-body`} className="text-white/70 text-sm">
                              Content
                            </Label>
                            <Textarea
                              id={`slide-${slideIndex}-body`}
                              value={slide.content?.body || ""}
                              onChange={(e) =>
                                handleUpdateSlide(chapterIndex, slideIndex, "body", e.target.value)
                              }
                              className="mt-1 glass-surface border-white/20 text-white min-h-[100px]"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`slide-${slideIndex}-narration`} className="text-white/70 text-sm">
                              Narration Script
                            </Label>
                            <Textarea
                              id={`slide-${slideIndex}-narration`}
                              value={slide.narrationScript || ""}
                              onChange={(e) =>
                                handleUpdateSlide(chapterIndex, slideIndex, "narration", e.target.value)
                              }
                              className="mt-1 glass-surface border-white/20 text-white min-h-[80px]"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassSurface>
        </ScrollReveal>
      </div>
    </div>
  )
}

export default function CourseEditPage() {
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
      <CourseEditContent />
    </Suspense>
  )
}

