"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Download, Users, TrendingUp
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface StudentRow {
  student_id: string
  full_name: string | null
  username: string | null
  grades: Record<string, { grade: number | null; status: string | null }>
}

export default function GradebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [classroom, setClassroom] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [supabase, classroomId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: room } = await supabase.from("classrooms").select("*").eq("id", classroomId).single()
      setClassroom(room)

      const { data: assigns } = await supabase
        .from("classroom_assignments")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: true })
      setAssignments(assigns || [])

      // Get enrolled students
      const { data: enrollments } = await supabase
        .from("classroom_students").select("student_id").eq("classroom_id", classroomId)
      if (!enrollments || enrollments.length === 0) { setStudents([]); return }

      const studentIds = enrollments.map(e => e.student_id)
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name, username").in("id", studentIds)

      // Get all submissions for this classroom's assignments
      const assignmentIds = (assigns || []).map(a => a.id)
      let allSubs: any[] = []
      if (assignmentIds.length > 0) {
        const { data: subs } = await supabase
          .from("classroom_submissions").select("*").in("assignment_id", assignmentIds)
        allSubs = subs || []
      }

      // Build rows
      const rows: StudentRow[] = (profiles || []).map(p => {
        const grades: Record<string, { grade: number | null; status: string | null }> = {}
        ;(assigns || []).forEach(a => {
          const sub = allSubs.find(s => s.student_id === p.id && s.assignment_id === a.id)
          grades[a.id] = sub ? { grade: sub.grade, status: sub.status } : { grade: null, status: null }
        })
        return { student_id: p.id, full_name: p.full_name, username: p.username, grades }
      })
      setStudents(rows)
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const exportCSV = () => {
    if (assignments.length === 0 || students.length === 0) return
    const headers = ["Student", ...assignments.map(a => a.title), "Average"]
    const rows = students.map(s => {
      const grades = assignments.map(a => {
        const g = s.grades[a.id]
        return g?.grade !== null && g?.grade !== undefined ? g.grade.toString() : ""
      })
      const numericGrades = assignments.map(a => s.grades[a.id]?.grade).filter(g => g !== null && g !== undefined) as number[]
      const avg = numericGrades.length > 0 ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1) : ""
      return [s.full_name || s.username || "Unknown", ...grades, avg]
    })
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${classroom?.name || "gradebook"}_grades.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exported!" })
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {classroom?.name || "Classroom"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text">Gradebook</span>
            </h1>
            <p className="text-foreground/60">{students.length} students · {assignments.length} assignments</p>
          </div>
          <Button onClick={exportCSV} variant="outline" className="mt-4 md:mt-0 border-violet-500/20 text-violet-400 hover:bg-violet-500/10">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </ScrollReveal>

      {assignments.length === 0 || students.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <TrendingUp className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No data to display</h2>
            <p className="text-foreground/50">Create assignments and enroll students to see the gradebook.</p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-left p-3 font-semibold text-foreground/70 sticky left-0 bg-background/80 backdrop-blur-sm z-10">Student</th>
                  {assignments.map(a => (
                    <th key={a.id} className="text-center p-3 font-medium text-foreground/60 min-w-[100px]">
                      <div className="truncate max-w-[120px] mx-auto" title={a.title}>{a.title}</div>
                      <div className="text-xs text-foreground/40 font-normal">{a.max_points} pts</div>
                    </th>
                  ))}
                  <th className="text-center p-3 font-semibold text-violet-400">Avg</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, sIdx) => {
                  const numericGrades = assignments.map(a => student.grades[a.id]?.grade).filter(g => g !== null && g !== undefined) as number[]
                  const avg = numericGrades.length > 0 ? numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length : null
                  return (
                    <tr key={student.student_id} className="border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                      <td className="p-3 sticky left-0 bg-background/80 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(student.full_name || student.username || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground truncate max-w-[140px]">
                            {student.full_name || student.username}
                          </span>
                        </div>
                      </td>
                      {assignments.map(a => {
                        const g = student.grades[a.id]
                        const pct = g?.grade !== null && g?.grade !== undefined ? (g.grade / a.max_points) * 100 : null
                        return (
                          <td key={a.id} className="text-center p-3">
                            {g?.grade !== null && g?.grade !== undefined ? (
                              <span className={`font-mono font-medium ${pct !== null && pct >= 70 ? "text-emerald-400" : pct !== null && pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                                {g.grade}
                              </span>
                            ) : g?.status === "submitted" ? (
                              <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-500">Pending</Badge>
                            ) : (
                              <span className="text-foreground/20">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-center p-3">
                        {avg !== null ? (
                          <span className={`font-mono font-bold ${avg >= 70 ? "text-emerald-400" : avg >= 50 ? "text-amber-400" : "text-red-400"}`}>
                            {avg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-foreground/20">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </GlassSurface>
        </ScrollReveal>
      )}
    </div>
  )
}
