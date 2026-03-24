"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, FileText, Calendar, CheckCircle, Clock,
  Send, Loader2, MessageSquare
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

export default function StudentAssignmentsPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<Record<string, any>>({})
  const [classroom, setClassroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [supabase, classroomId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: room } = await supabase.from("classrooms").select("*").eq("id", classroomId).single()
      setClassroom(room)

      const { data: assigns } = await supabase
        .from("classroom_assignments")
        .select("*")
        .eq("classroom_id", classroomId)
        .eq("is_published", true)
        .order("due_date", { ascending: true })
      setAssignments(assigns || [])

      if (assigns && assigns.length > 0) {
        const { data: subs } = await supabase
          .from("classroom_submissions")
          .select("*")
          .eq("student_id", user.id)
          .in("assignment_id", assigns.map(a => a.id))

        const subMap: Record<string, any> = {}
        subs?.forEach(s => { subMap[s.assignment_id] = s })
        setSubmissions(subMap)
      }
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-1">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
            {classroom?.name} — Assignments
          </span>
        </h1>
        <p className="text-foreground/60 mb-8">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</p>
      </ScrollReveal>

      {assignments.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <FileText className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No assignments yet</h2>
            <p className="text-foreground/50">Your teacher hasn&apos;t published any assignments.</p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {assignments.map((a, idx) => {
            const sub = submissions[a.id]
            const isPastDue = a.due_date && new Date(a.due_date) < new Date()
            return (
              <ScrollReveal key={a.id} direction="up" delay={idx * 0.03}>
                <Link href={`/dashboard/classrooms/${classroomId}/assignments/${a.id}`}>
                  <GlassSurface className="p-5 hover:border-cyan-500/20 transition-all cursor-pointer">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{a.title}</p>
                          <div className="flex items-center gap-2 text-xs text-foreground/50">
                            <span>{a.max_points} pts</span>
                            {a.due_date && (
                              <>
                                <span>·</span>
                                <span className={isPastDue ? "text-red-400" : ""}>
                                  <Calendar className="h-3 w-3 inline mr-0.5" />
                                  {new Date(a.due_date).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {sub ? (
                        sub.status === "graded" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" /> {sub.grade}/{a.max_points}
                          </Badge>
                        ) : (
                          <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                            <Clock className="h-3 w-3 mr-1" /> Submitted
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className={isPastDue ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-500"}>
                          {isPastDue ? "Missing" : "Not Started"}
                        </Badge>
                      )}
                    </div>
                  </GlassSurface>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
