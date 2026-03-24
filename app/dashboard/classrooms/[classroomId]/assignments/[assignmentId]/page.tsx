"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Send, CheckCircle, Clock, Loader2, MessageSquare
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

export default function StudentAssignmentDetailPage({ params }: { params: Promise<{ classroomId: string; assignmentId: string }> }) {
  const { classroomId, assignmentId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<any>(null)
  const [submission, setSubmission] = useState<any>(null)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!supabase || !content.trim()) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (submission) {
        const { error } = await supabase.from("classroom_submissions").update({
          content: content.trim(),
          submitted_at: new Date().toISOString(),
          status: "submitted",
        }).eq("id", submission.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("classroom_submissions").insert({
          assignment_id: assignmentId,
          student_id: user.id,
          content: content.trim(),
          status: "submitted",
        })
        if (error) throw error
      }
      toast({ title: "Submitted!" })
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
                  <MessageSquare className="h-3 w-3" /> Teacher Feedback
                </p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{submission.feedback}</p>
              </div>
            )}
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Submission Form */}
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
                onClick={handleSubmit}
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
    </div>
  )
}
