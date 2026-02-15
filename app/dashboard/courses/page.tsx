import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Video, Clock, CheckCircle, XCircle, Loader2, Play } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"

export default async function CoursesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center">
          <p className="text-white/70">Please log in to view your courses.</p>
        </GlassSurface>
      </div>
    )
  }

  // Fetch user's courses
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

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

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">My </span>
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="text-white/70">Create and manage your AI-generated courses</p>
          </div>
          <Link href="/dashboard/courses/new">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any, index: number) => (
            <ScrollReveal key={course.id} direction="up" delay={0.1 * index}>
              <Link href={`/dashboard/courses/${course.id}`}>
                <AnimatedCard variant="glow" delay={0.1 * index}>
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      {getStatusBadge(course.status)}
                      {course.final_video_url && (
                        <Play className="h-4 w-4 text-cyan-400" />
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Course Type & Style */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <Badge variant="outline" className="border-white/20 text-white/70">
                        {course.type?.replace("-", " ")}
                      </Badge>
                      {course.style && (
                        <Badge variant="outline" className="border-white/20 text-white/70">
                          {course.style}
                        </Badge>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="flex items-center text-white/60 text-sm mb-4">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{formatDuration(course.estimated_duration)}</span>
                    </div>

                    {/* Progress Info */}
                    {course.status === "processing" && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-white/50">Generating course content...</p>
                      </div>
                    )}

                    {/* View Course Button */}
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        {course.status === "completed" ? "View Course" : "View Progress"}
                      </Button>
                    </div>
                  </div>
                </AnimatedCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal direction="up">
          <GlassSurface className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-pink-500/20 mb-4">
              <Video className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-white/70 mb-6">
              Create your first AI-generated course to get started
            </p>
            <Link href="/dashboard/courses/new">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Course
              </Button>
            </Link>
          </GlassSurface>
        </ScrollReveal>
      )}
    </div>
  )
}

