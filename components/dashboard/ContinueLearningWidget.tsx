"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Loader2, PlayCircle, BookOpen } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export function ContinueLearningWidget() {
  const { supabase } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return

    const getSessionAndFetch = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setLoading(false)
        return
      }
      setUser(data.user)
      fetchProgress(data.user.id)
    }
    
    const fetchProgress = async (userId: string) => {
      try {
        // 1. Get recent active courses
        const { data: recentCourses } = await (supabase as any)
          .from("courses")
          .select("id, title, created_at")
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(3)

        if (!recentCourses || recentCourses.length === 0) {
          setLoading(false)
          return
        }

        const coursesWithProgress = []
        for (const course of recentCourses) {
           const { count: totalSlides } = await (supabase as any)
             .from("course_slides")
             .select("id", { count: "exact", head: true })
             .eq("course_id", course.id)

           const { count: completedSlides } = await (supabase as any)
             .from("course_progress")
             .select("id", { count: "exact", head: true })
             .eq("course_id", course.id)
             .eq("user_id", userId)
             .eq("completed", true)

           const progressPercent = totalSlides ? Math.round(((completedSlides || 0) / totalSlides) * 100) : 0
           if (progressPercent < 100 && progressPercent >= 0) {
              coursesWithProgress.push({
                ...course,
                progress: progressPercent,
                completedSlides: completedSlides || 0,
                totalSlides: totalSlides || 0
              })
           }
        }
        
        setCourses(coursesWithProgress)
      } catch (e) {
        console.error("Error fetching Continue Learning", e)
      } finally {
        setLoading(false)
      }
    }
    
    getSessionAndFetch()
  }, [supabase])

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-blue-500/30 h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (courses.length === 0) {
    return null // Only render if there's actually a course to continue
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] relative overflow-hidden bg-gradient-to-br from-blue-900/10 to-transparent">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
          <BookOpen className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <Link href={`/dashboard/courses/${course.id}`} key={course.id}>
             <div className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <PlayCircle className="h-5 w-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </div>
                <div className="flex items-end justify-between mt-3 gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-foreground/50 mb-1.5">
                      <span>{course.progress}% Completed</span>
                      <span>{course.completedSlides} / {course.totalSlides}</span>
                    </div>
                    <Progress value={course.progress} className="h-1.5 bg-blue-950" indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>
                </div>
             </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
