import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Video, Clock, CheckCircle, XCircle, Loader2, Play, MoreVertical, Trash2, Edit } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function CoursesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center max-w-md mx-auto mt-20">
          <p className="text-foreground/70">Please log in to view your courses.</p>
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
          <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
            <CheckCircle className="h-3 w-3" />
            <span>Ready</span>
          </div>
        )
      case "processing":
        return (
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20 animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating</span>
          </div>
        )
      case "failed":
        return (
          <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-medium bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </div>
        )
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    // const remainingSeconds = seconds % 60
    return `${minutes} min`
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AmbientBackground />

      <div className="relative z-10 p-6 md:p-8 lg:p-12">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
                My <span className="text-cyan-400">Courses</span>
              </h1>
              <p className="text-foreground/60">Manage your AI-generated learning content</p>
            </div>
            <Link href="/dashboard/courses/new">
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                <Plus className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        {/* Courses Grid */}
        {courses && courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course: any, index: number) => (
              <ScrollReveal key={course.id} direction="up" delay={0.1 * index}>
                <div className="group relative">
                  <Link href={`/dashboard/courses/${course.id}`} className="block h-full">
                    <AnimatedCard variant="glow" delay={0.1 * index} className="h-full flex flex-col">
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Top Row: Icon & Actions */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                            <Video className="h-5 w-5" />
                          </div>
                          <div onClick={(e) => e.preventDefault()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/40 hover:text-foreground">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Title & Meta */}
                        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {course.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-foreground/5 text-foreground/60 border-transparent text-[10px] font-normal">
                            {course.type?.replace("-", " ")}
                          </Badge>
                          {course.style && (
                            <Badge variant="secondary" className="bg-foreground/5 text-foreground/60 border-transparent text-[10px] font-normal">
                              {course.style}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-foreground/5 flex items-center justify-between">
                          {getStatusBadge(course.status)}
                          <span className="text-xs text-foreground/40 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(course.estimated_duration)}
                          </span>
                        </div>

                        {/* Processing Bar */}
                        {course.status === "processing" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/5">
                            <div className="h-full bg-cyan-500 animate-progress"></div>
                          </div>
                        )}
                      </div>
                    </AnimatedCard>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal direction="up">
            <GlassSurface className="py-20 text-center max-w-2xl mx-auto border-dashed border-2 border-foreground/10 bg-transparent shadow-none">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-pink-500/10 mb-6 relative group">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500"></div>
                <Video className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Your library is empty</h3>
              <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                Create your first AI-generated course to start building your personal knowledge base.
              </p>
              <Link href="/dashboard/courses/new">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white shadow-lg shadow-cyan-500/20">
                  <Plus className="mr-2 h-5 w-5" />
                  Start Creating
                </Button>
              </Link>
            </GlassSurface>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}


