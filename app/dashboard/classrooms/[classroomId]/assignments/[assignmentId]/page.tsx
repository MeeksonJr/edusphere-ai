"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Send, CheckCircle, CheckCircle2, XCircle, Clock,
  Loader2, MessageSquare, CircleDot
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
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  question_text: string
  question_type: string
  options: string[]
  correct_answer: string
  points: number
  order_num: number
}

export default function StudentAssignmentDetailPage({ params }: { params: Promise<{ classroomId: string; assignmentId: string }> }) {
  const { classroomId, assignmentId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizResults, setQuizResults] = useState<any[]>([])
  const isQuiz = assignment?.assignment_type === "quiz"

  useEffect(() => { loadData() }, [supabase, assignmentId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: a } = await supabase.from("classroom_assignments").select("*").eq("id", assignmentId).single()
      setAssignment(a)

      const { data: sub } = await supabase
        .from("classroom_submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("student_id", user.id)
        .maybeSingle()
      setSubmission(sub)
      if (sub?.content) setContent(sub.content)

      // Load quiz questions if it's a quiz
      if (a?.assignment_type === "quiz") {
        const { data: qs } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("assignment_id", assignmentId)
          .order("order_num", { ascending: true })
        
        setQuestions((qs || []).map(q => ({
          ...q,
          question_type: q.question_type || "multiple_choice",
          points: q.points || 0,
          order_num: q.order_num || 0,
          options: (q.options as string[]) || []
        })))

        // Load existing responses if submitted
        if (sub) {
          const { data: responses } = await supabase
            .from("quiz_responses")
            .select("*")
            .eq("submission_id", sub.id)
          setQuizResults(responses || [])
          const ansMap: Record<string, string> = {}
          responses?.forEach(r => { ansMap[r.question_id] = r.student_answer || "" })
          setAnswers(ansMap)
        }
      }
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleTextSubmit = async () => {
    if (!supabase || !content.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (submission) {
        await supabase.from("classroom_submissions").update({
          content: content.trim(), submitted_at: new Date().toISOString(), status: "submitted",
        }).eq("id", submission.id)
      } else {
        await supabase.from("classroom_submissions").insert({
          assignment_id: assignmentId, student_id: user.id, content: content.trim(), status: "submitted",
        })
      }
      toast({ title: "Submitted!" })
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const handleQuizSubmit = async () => {
    if (!supabase || questions.length === 0) return
    const unanswered = questions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      toast({ title: `Please answer all questions (${unanswered.length} remaining)`, variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Score the quiz
      let totalEarned = 0
      const responses = questions.map(q => {
        let isCorrect = false
        if (q.question_type === "multiple_choice") {
          isCorrect = answers[q.id] === q.correct_answer
        } else {
          isCorrect = answers[q.id] === q.correct_answer
        }
        const earned = isCorrect ? q.points : 0
        totalEarned += earned
        return { question_id: q.id, student_answer: answers[q.id], is_correct: isCorrect, points_earned: earned }
      })

      const totalPossible = questions.reduce((s, q) => s + q.points, 0)

      // Create or update submission
      let subId = submission?.id
      if (submission) {
        await supabase.from("classroom_submissions").update({
          content: JSON.stringify(answers),
          submitted_at: new Date().toISOString(),
          status: "graded",
          grade: totalEarned,
          feedback: `Auto-scored: ${totalEarned}/${totalPossible} (${Math.round((totalEarned / totalPossible) * 100)}%)`,
        }).eq("id", submission.id)
      } else {
        const { data: newSub } = await supabase.from("classroom_submissions").insert({
          assignment_id: assignmentId, student_id: user.id,
          content: JSON.stringify(answers), status: "graded",
          grade: totalEarned,
          feedback: `Auto-scored: ${totalEarned}/${totalPossible} (${Math.round((totalEarned / totalPossible) * 100)}%)`,
        }).select("id").single()
        subId = newSub?.id
      }

      if (subId) {
        // Delete old responses and insert new
        await supabase.from("quiz_responses").delete().eq("submission_id", subId)
        await supabase.from("quiz_responses").insert(
          responses.map(r => ({ submission_id: subId, ...r }))
        )
      }

      toast({ title: `Quiz submitted! Score: ${totalEarned}/${totalPossible}` })
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>
  if (!assignment) return <div className="p-8 text-center text-foreground/50">Assignment not found.</div>

  const isPastDue = assignment.due_date && new Date(assignment.due_date) < new Date()
  const isGraded = submission?.status === "graded"

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/classrooms/${classroomId}/assignments`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </Link>

        <GlassSurface className="p-6 mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">{assignment.title}</h1>
          <div className="flex items-center gap-3 text-sm text-foreground/50 mb-4">
            <span>{assignment.max_points} pts</span>
            <span>·</span>
            <span className="capitalize">{assignment.assignment_type}</span>
            {assignment.due_date && (
              <>
                <span>·</span>
                <span className={isPastDue ? "text-red-400" : ""}>
                  Due {new Date(assignment.due_date).toLocaleString()}
                </span>
              </>
            )}
          </div>
          {assignment.description && (
            <div className="p-3 rounded-lg bg-foreground/5 text-sm text-foreground/70 whitespace-pre-wrap">
              {assignment.description}
            </div>
          )}
        </GlassSurface>
      </ScrollReveal>

      {/* Graded Feedback */}
      {isGraded && (
        <ScrollReveal direction="up" delay={0.05}>
          <GlassSurface className="p-6 mb-6 border border-emerald-500/20">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" /> Graded
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-3xl font-bold text-emerald-400">
                {submission.grade}<span className="text-lg text-foreground/40">/{assignment.max_points}</span>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                {Math.round((submission.grade / assignment.max_points) * 100)}%
              </Badge>
            </div>
            {submission.feedback && (
              <div className="p-3 rounded-lg bg-foreground/5">
                <p className="text-xs text-foreground/50 mb-1 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" /> Feedback
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Quiz UI */}
      {isQuiz ? (
        <ScrollReveal direction="up" delay={0.1}>
          {questions.length === 0 ? (
            <GlassSurface className="p-8 text-center">
              <CircleDot className="h-12 w-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/50">No questions have been added to this quiz yet.</p>
            </GlassSurface>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const result = quizResults.find(r => r.question_id === q.id)
                return (
                  <GlassSurface key={q.id} className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{q.question_text}</p>
                        <span className="text-xs text-foreground/40">{q.points} pts</span>
                      </div>
                      {isGraded && result && (
                        result.is_correct
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                          : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="space-y-2 ml-10">
                      {q.options.map((opt, oi) => {
                        const letter = q.question_type === "multiple_choice" ? String.fromCharCode(65 + oi) : opt
                        const isSelected = answers[q.id] === letter
                        const isCorrectAnswer = isGraded && (
                          (q.question_type === "multiple_choice" && q.correct_answer === letter) ||
                          (q.question_type === "true_false" && q.correct_answer === opt)
                        )
                        return (
                          <button
                            key={oi}
                            disabled={isGraded}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: letter }))}
                            className={cn(
                              "w-full text-left p-3 rounded-lg border transition-all text-sm flex items-center gap-3",
                              isGraded && isCorrectAnswer
                                ? "border-emerald-500/30 bg-emerald-500/10"
                                : isGraded && isSelected && !isCorrectAnswer
                                  ? "border-red-500/30 bg-red-500/10"
                                  : isSelected
                                    ? "border-cyan-500/30 bg-cyan-500/10"
                                    : "border-foreground/10 hover:border-foreground/20"
                            )}
                          >
                            <span className={cn(
                              "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0",
                              isSelected ? "bg-cyan-500 border-cyan-500 text-white" : "border-foreground/20"
                            )}>
                              {q.question_type === "multiple_choice" ? letter : (opt === "True" ? "T" : "F")}
                            </span>
                            <span className="text-foreground/80">{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                  </GlassSurface>
                )
              })}

              {!isGraded && (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-6 text-lg"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                  Submit Quiz
                </Button>
              )}
            </div>
          )}
        </ScrollReveal>
      ) : (
        /* Text Submission Form */
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Send className="h-5 w-5 text-cyan-400" />
              {submission ? "Your Submission" : "Submit Your Work"}
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="submission-content" className="text-sm text-foreground/50">Response</Label>
                <Textarea
                  id="submission-content"
                  placeholder="Write your answer here…"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={8}
                  className="bg-background/50"
                  disabled={isGraded}
                />
              </div>
              {!isGraded && (
                <Button
                  onClick={handleTextSubmit}
                  disabled={submitting || !content.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  {submission ? "Update Submission" : "Submit"}
                </Button>
              )}
              {submission && !isGraded && (
                <p className="text-xs text-foreground/40 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Last submitted {new Date(submission.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          </GlassSurface>
        </ScrollReveal>
      )}
    </div>
  )
}
