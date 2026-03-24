"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, BarChart3, CheckCircle2, XCircle, Users, TrendingUp
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { cn } from "@/lib/utils"

interface QuestionResult {
  id: string
  question_text: string
  question_type: string
  correct_answer: string
  points: number
  correct_count: number
  total_count: number
}

interface StudentResult {
  student_id: string
  full_name: string | null
  username: string | null
  total_score: number
  max_score: number
  responses: { question_id: string; is_correct: boolean; student_answer: string }[]
}

export default function QuizResultsPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id: classroomId, assignmentId } = use(params)
  const { supabase } = useSupabase()
  const [questions, setQuestions] = useState<QuestionResult[]>([])
  const [students, setStudents] = useState<StudentResult[]>([])
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [supabase, assignmentId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: asn } = await supabase.from("classroom_assignments").select("*").eq("id", assignmentId).single()
      setAssignment(asn)

      const { data: qs } = await supabase.from("quiz_questions").select("*").eq("assignment_id", assignmentId).order("order_num", { ascending: true })

      const { data: subs } = await supabase.from("classroom_submissions").select("*").eq("assignment_id", assignmentId)
      if (!qs || !subs || subs.length === 0) {
        setQuestions((qs || []).map(q => ({
          ...q,
          question_type: q.question_type || "multiple_choice",
          points: q.points || 0,
          correct_count: 0,
          total_count: 0,
        })))
        setStudents([])
        setLoading(false)
        return
      }

      const subIds = subs.map(s => s.id)
      const { data: responses } = await supabase.from("quiz_responses").select("*").in("submission_id", subIds)

      // Student profiles
      const studentIds = [...new Set(subs.map(s => s.student_id))]
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, username").in("id", studentIds)

      // Build question-level stats
      const qResults: QuestionResult[] = (qs || []).map(q => {
        const qResponses = (responses || []).filter(r => r.question_id === q.id)
        return {
          ...q,
          question_type: q.question_type || "multiple_choice",
          points: q.points || 0,
          correct_count: qResponses.filter(r => r.is_correct).length,
          total_count: qResponses.length,
        }
      })

      // Build student-level results
      const sResults: StudentResult[] = subs.map(s => {
        const profile = profiles?.find(p => p.id === s.student_id)
        const studentResponses = (responses || []).filter(r => r.submission_id === s.id)
        const totalScore = studentResponses.reduce((sum, r) => sum + (r.points_earned || 0), 0)
        const maxScore = (qs || []).reduce((sum, q) => sum + (q.points || 0), 0)
        return {
          student_id: s.student_id,
          full_name: profile?.full_name || null,
          username: profile?.username || null,
          total_score: totalScore,
          max_score: maxScore,
          responses: studentResponses.map(r => ({
            question_id: r.question_id,
            is_correct: r.is_correct || false,
            student_answer: r.student_answer || "",
          })),
        }
      })

      setQuestions(qResults)
      setStudents(sResults.sort((a, b) => b.total_score - a.total_score))
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const avgScore = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.total_score, 0) / students.length)
    : 0
  const maxPossible = questions.reduce((s, q) => s + q.points, 0)

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}/assignments/${assignmentId}`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Assignment
        </Link>
        <h1 className="text-3xl font-bold mb-1">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Quiz Results</span>
        </h1>
        <p className="text-foreground/60 mb-6">{assignment?.title}</p>
      </ScrollReveal>

      {/* Summary Stats */}
      <ScrollReveal direction="up" delay={0.05}>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <GlassSurface className="p-4 text-center">
            <Users className="h-5 w-5 text-violet-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{students.length}</p>
            <p className="text-xs text-foreground/50">Submissions</p>
          </GlassSurface>
          <GlassSurface className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{avgScore}<span className="text-sm text-foreground/50">/{maxPossible}</span></p>
            <p className="text-xs text-foreground/50">Average Score</p>
          </GlassSurface>
          <GlassSurface className="p-4 text-center">
            <BarChart3 className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{maxPossible > 0 ? Math.round((avgScore / maxPossible) * 100) : 0}%</p>
            <p className="text-xs text-foreground/50">Average %</p>
          </GlassSurface>
        </div>
      </ScrollReveal>

      {/* Per-Question Breakdown */}
      <ScrollReveal direction="up" delay={0.1}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Question Breakdown</h2>
        <div className="space-y-3 mb-8">
          {questions.map((q, idx) => {
            const pct = q.total_count > 0 ? Math.round((q.correct_count / q.total_count) * 100) : 0
            return (
              <GlassSurface key={q.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-sm font-bold text-purple-400 flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-2">{q.question_text}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-mono text-foreground/60 min-w-[60px] text-right">{pct}% correct</span>
                    </div>
                  </div>
                </div>
              </GlassSurface>
            )
          })}
        </div>
      </ScrollReveal>

      {/* Per-Student Results */}
      <ScrollReveal direction="up" delay={0.15}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Student Scores</h2>
        <div className="space-y-2">
          {students.map((st, idx) => (
            <GlassSurface key={st.student_id} className="p-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono text-sm text-foreground/50">{idx + 1}</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0">
                  {(st.full_name || st.username || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{st.full_name || st.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  {questions.map(q => {
                    const resp = st.responses.find(r => r.question_id === q.id)
                    return resp ? (
                      resp.is_correct
                        ? <CheckCircle2 key={q.id} className="h-4 w-4 text-emerald-400" />
                        : <XCircle key={q.id} className="h-4 w-4 text-red-400" />
                    ) : <div key={q.id} className="w-4 h-4 rounded-full bg-foreground/10" />
                  })}
                </div>
                <Badge variant="outline" className={cn(
                  "min-w-[60px] text-right",
                  st.max_score > 0 && (st.total_score / st.max_score) >= 0.7
                    ? "text-emerald-400 border-emerald-500/30"
                    : "text-foreground/60"
                )}>
                  {st.total_score}/{st.max_score}
                </Badge>
              </div>
            </GlassSurface>
          ))}
        </div>
      </ScrollReveal>
    </div>
  )
}
