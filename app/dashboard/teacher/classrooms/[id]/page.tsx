"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Users, Copy, TrendingUp, Flame, BookOpen, 
  UserMinus, GraduationCap, Loader2, ClipboardList, BarChart3, Megaphone
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface EnrolledStudent {
  student_id: string
  joined_at: string
  profile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
    total_xp: number | null
    current_streak: number | null
    level: number | null
  }
}

export default function ClassroomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [classroom, setClassroom] = useState<any>(null)
  const [students, setStudents] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClassroomData()
  }, [supabase, id])

  const loadClassroomData = async () => {
    if (!supabase) return
    try {
      setLoading(true)

      // Fetch classroom
      const { data: room, error: roomError } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", id)
        .single()

      if (roomError) throw roomError
      setClassroom(room)

      // Fetch enrolled students
      const { data: enrollments } = await supabase
        .from("classroom_students")
        .select("*")
        .eq("classroom_id", id)

      if (enrollments && enrollments.length > 0) {
        const studentIds = enrollments.map(e => e.student_id)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, total_xp, current_streak, level")
          .in("id", studentIds)

        const enriched = enrollments.map(e => ({
          ...e,
          profile: profiles?.find(p => p.id === e.student_id) || {
            full_name: null, username: null, avatar_url: null,
            total_xp: null, current_streak: null, level: null
          }
        }))
        setStudents(enriched)
      }
    } catch (err: any) {
      console.error("Error:", err)
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const removeStudent = async (studentId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("classroom_students")
        .delete()
        .eq("classroom_id", id)
        .eq("student_id", studentId)

      if (error) throw error
      toast({ title: "Student removed" })
      loadClassroomData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const copyInviteCode = () => {
    if (!classroom) return
    navigator.clipboard.writeText(classroom.invite_code)
    toast({ title: "Copied!", description: `Invite code ${classroom.invite_code} copied.` })
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="p-6 md:p-8 lg:p-12 text-center">
        <p className="text-foreground/50">Classroom not found.</p>
      </div>
    )
  }

  // Calculate classroom averages
  const avgXP = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.profile.total_xp || 0), 0) / students.length)
    : 0
  const avgStreak = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.profile.current_streak || 0), 0) / students.length)
    : 0

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard/teacher" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Teacher Portal
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 text-transparent bg-clip-text">
                {classroom.name}
              </span>
            </h1>
            {classroom.description && (
              <p className="text-foreground/60">{classroom.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0 p-3 rounded-xl bg-foreground/5">
            <span className="text-sm text-foreground/50">Invite Code:</span>
            <code className="font-mono text-violet-400 tracking-widest font-bold">{classroom.invite_code}</code>
            <Button variant="ghost" size="sm" onClick={copyInviteCode} className="h-8 w-8 p-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Aggregate Stats */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <GlassSurface className="p-4 text-center">
            <Users className="h-5 w-5 text-violet-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-xs text-foreground/50">Students</p>
          </GlassSurface>
          <GlassSurface className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{avgXP}</p>
            <p className="text-xs text-foreground/50">Avg XP</p>
          </GlassSurface>
          <GlassSurface className="p-4 text-center">
            <Flame className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{avgStreak}</p>
            <p className="text-xs text-foreground/50">Avg Streak</p>
          </GlassSurface>
        </div>
      </ScrollReveal>

      {/* Quick Actions */}
      <ScrollReveal direction="up" delay={0.07}>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link href={`/dashboard/teacher/classrooms/${id}/assignments`}>
            <GlassSurface className="p-4 text-center hover:border-violet-500/20 transition-all cursor-pointer">
              <ClipboardList className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <p className="font-semibold text-foreground text-sm">Assignments</p>
              <p className="text-xs text-foreground/50">Create & manage</p>
            </GlassSurface>
          </Link>
          <Link href={`/dashboard/teacher/classrooms/${id}/gradebook`}>
            <GlassSurface className="p-4 text-center hover:border-fuchsia-500/20 transition-all cursor-pointer">
              <BarChart3 className="h-6 w-6 text-fuchsia-400 mx-auto mb-2" />
              <p className="font-semibold text-foreground text-sm">Gradebook</p>
              <p className="text-xs text-foreground/50">View all grades</p>
            </GlassSurface>
          </Link>
          <Link href={`/dashboard/teacher/classrooms/${id}/announcements`}>
            <GlassSurface className="p-4 text-center hover:border-amber-500/20 transition-all cursor-pointer">
              <Megaphone className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="font-semibold text-foreground text-sm">Announcements</p>
              <p className="text-xs text-foreground/50">Post updates</p>
            </GlassSurface>
          </Link>
        </div>
      </ScrollReveal>

      {/* Student Roster */}
      <ScrollReveal direction="up" delay={0.1}>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-400" />
          Student Roster
        </h2>
      </ScrollReveal>

      {students.length === 0 ? (
        <ScrollReveal direction="up" delay={0.15}>
          <GlassSurface className="p-12 text-center">
            <GraduationCap className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No students enrolled</h3>
            <p className="text-foreground/50 max-w-md mx-auto">
              Share the invite code <code className="text-violet-400 font-mono">{classroom.invite_code}</code> with your students so they can join.
            </p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="space-y-3">
          {students.map((student, idx) => (
            <ScrollReveal key={student.student_id} direction="up" delay={0.1 + idx * 0.03}>
              <GlassSurface className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {(student.profile.full_name || student.profile.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.profile.full_name || student.profile.username || "Student"}</p>
                      <p className="text-sm text-foreground/50">@{student.profile.username || "unknown"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-foreground/60">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                      <span>{student.profile.total_xp || 0} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-foreground/60">
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                      <span>{student.profile.current_streak || 0}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Lv.{student.profile.level || 1}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStudent(student.student_id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
