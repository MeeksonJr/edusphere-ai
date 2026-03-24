"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Users, CheckCircle, Clock, AlertCircle,
  Sparkles, Loader2, MessageSquare
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface Submission {
  id: string
  student_id: string
  content: string | null
  status: string | null
  grade: number | null
  feedback: string | null
  submitted_at: string | null
  profile: { full_name: string | null; username: string | null }
}

export default function AssignmentSubmissionsPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id: classroomId, assignmentId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState<string | null>(null)
  const [autoGrading, setAutoGrading] = useState<string | null>(null)
  const [editGrade, setEditGrade] = useState<Record<string, { grade: string; feedback: string }>>({})

  useEffect(() => { loadData() }, [supabase, assignmentId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: a } = await supabase.from("classroom_assignments").select("*").eq("id", assignmentId).single()
      setAssignment(a)

      const { data: subs } = await supabase.from("classroom_submissions").select("*").eq("assignment_id", assignmentId)
      if (subs && subs.length > 0) {
        const studentIds = subs.map(s => s.student_id)
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, username").in("id", studentIds)
        const enriched = subs.map(s => ({
          ...s,
          profile: profiles?.find(p => p.id === s.student_id) || { full_name: null, username: null }
        }))
        setSubmissions(enriched)
        const grades: Record<string, { grade: string; feedback: string }> = {}
        enriched.forEach(s => {
          grades[s.id] = { grade: s.grade?.toString() || "", feedback: s.feedback || "" }
        })
        setEditGrade(grades)
      }
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSaveGrade = async (submissionId: string) => {
    if (!supabase) return
    setGrading(submissionId)
    try {
      const edit = editGrade[submissionId]
      const { error } = await supabase.from("classroom_submissions").update({
        grade: parseInt(edit.grade) || null,
        feedback: edit.feedback || null,
        status: "graded",
        graded_at: new Date().toISOString(),
      }).eq("id", submissionId)
      if (error) throw error
      toast({ title: "Grade saved!" })
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setGrading(null) }
  }

  const handleAutoGrade = async (submissionId: string) => {
    if (!assignment) return
    setAutoGrading(submissionId)
    try {
      const sub = submissions.find(s => s.id === submissionId)
      const res = await fetch("/api/grading/auto-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_title: assignment.title,
          assignment_description: assignment.description,
          max_points: assignment.max_points,
          student_submission: sub?.content || "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEditGrade(prev => ({
        ...prev,
        [submissionId]: { grade: data.score.toString(), feedback: data.feedback }
      }))
      toast({ title: "AI grading complete!", description: "Review the suggested grade and feedback below." })
    } catch (err: any) {
      toast({ title: "AI grading failed", description: err.message, variant: "destructive" })
    } finally { setAutoGrading(null) }
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}/assignments`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </Link>
        <h1 className="text-2xl font-bold mb-1">
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 text-transparent bg-clip-text">{assignment?.title}</span>
        </h1>
        <p className="text-foreground/50 text-sm mb-6">
          {assignment?.max_points} pts · {assignment?.assignment_type} · {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </p>
      </ScrollReveal>

      {submissions.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <Users className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No submissions yet</h2>
            <p className="text-foreground/50">Students haven&apos;t submitted work for this assignment.</p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="space-y-6">
          {submissions.map((sub, idx) => {
            const edit = editGrade[sub.id] || { grade: "", feedback: "" }
            return (
              <ScrollReveal key={sub.id} direction="up" delay={idx * 0.03}>
                <GlassSurface className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {(sub.profile.full_name || sub.profile.username || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{sub.profile.full_name || sub.profile.username}</p>
                        <p className="text-xs text-foreground/50">
                          Submitted {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "—"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={sub.status === "graded" ? "border-emerald-500/30 text-emerald-500" : "border-cyan-500/30 text-cyan-500"}>
                      {sub.status === "graded" ? <><CheckCircle className="h-3 w-3 mr-1" />Graded</> : <><Clock className="h-3 w-3 mr-1" />Submitted</>}
                    </Badge>
                  </div>

                  {/* Student content */}
                  {sub.content && (
                    <div className="p-3 mb-4 rounded-lg bg-foreground/5 text-sm text-foreground/80 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {sub.content}
                    </div>
                  )}

                  {/* Grading form */}
                  <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-3 items-start">
                    <div>
                      <Label className="text-xs text-foreground/50">Grade</Label>
                      <Input
                        type="number"
                        placeholder={`/ ${assignment?.max_points}`}
                        value={edit.grade}
                        onChange={e => setEditGrade(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], grade: e.target.value } }))}
                        className="bg-background/50"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-foreground/50">Feedback</Label>
                      <Textarea
                        placeholder="Write feedback…"
                        value={edit.feedback}
                        onChange={e => setEditGrade(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], feedback: e.target.value } }))}
                        rows={2}
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" onClick={() => handleSaveGrade(sub.id)} disabled={grading === sub.id} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      {grading === sub.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Save Grade
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAutoGrade(sub.id)} disabled={autoGrading === sub.id} className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                      {autoGrading === sub.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                      AI Auto-Grade
                    </Button>
                  </div>
                </GlassSurface>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
