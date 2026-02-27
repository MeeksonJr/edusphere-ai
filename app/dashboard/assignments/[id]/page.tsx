"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { CheckSquare, ChevronLeft, Clock, Calendar, Sparkles, FileText, Award } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { AssignmentActions } from "./assignment-actions"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { SubmissionForm } from "@/components/submission-form"
import { GradeDisplay } from "@/components/grade-display"

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { supabase } = useSupabase()
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [latestGrade, setLatestGrade] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const { data: { user } } = await supabase!.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        const assignmentId = params.id as string
        const { data, error } = await supabase!
          .from("assignments")
          .select("*")
          .eq("id", assignmentId)
          .eq("user_id", user.id)
          .single()

        if (error || !data) {
          router.push("/dashboard/assignments")
          return
        }

        setAssignment(data)

        // Fetch existing submissions
        const { data: subs } = await (supabase! as any)
          .from("assignment_submissions")
          .select("*")
          .eq("assignment_id", assignmentId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (subs && subs.length > 0) {
          setSubmissions(subs)
          // Parse the latest grade
          try {
            const latest = subs[0]
            const parsed = typeof latest.feedback === "string"
              ? JSON.parse(latest.feedback)
              : latest.feedback
            setLatestGrade({
              ...parsed,
              grade: latest.grade,
            })
          } catch {
            // feedback might not be valid JSON
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error)
        router.push("/dashboard/assignments")
      } finally {
        setLoading(false)
      }
    }

    if (supabase && params.id) {
      fetchAssignment()
    }
  }, [supabase, params.id, router])

  const handleGraded = (result: any) => {
    setLatestGrade(result)
    setSubmissions((prev) => [result, ...prev])
  }

  if (loading || !assignment) {
    return (
      <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const formattedDate = assignment.due_date
    ? new Date(assignment.due_date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "No due date"

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <Link
            href="/dashboard/assignments"
            className="inline-flex items-center text-foreground/70 hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Back to Assignments
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-foreground">{assignment.title}</span>
            </h1>
            <div className="flex items-center space-x-2">
              <AssignmentActions assignment={assignment} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.subject && (
              <Badge className="glass-surface border-foreground/10 text-foreground/80">{assignment.subject}</Badge>
            )}
            {assignment.priority && (
              <Badge
                className={
                  assignment.priority === "high"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : assignment.priority === "medium"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                }
              >
                {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
              </Badge>
            )}
            <Badge
              className={
                assignment.status === "completed"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }
            >
              {assignment.status === "completed" ? "Completed" : "Ongoing"}
            </Badge>
            {assignment.max_points && (
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {assignment.max_points} pts
              </Badge>
            )}
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <ScrollReveal direction="up" delay={0.1}>
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Description</h2>
              <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {assignment.description || "No description provided."}
              </p>
            </GlassSurface>
          </ScrollReveal>

          {assignment.grading_criteria && (
            <ScrollReveal direction="up" delay={0.15}>
              <GlassSurface className="p-6 lg:p-8 border-indigo-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground">Grading Criteria</h2>
                </div>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {assignment.grading_criteria}
                </p>
              </GlassSurface>
            </ScrollReveal>
          )}

          {assignment.ai_summary && (
            <ScrollReveal direction="up" delay={0.2}>
              <GlassSurface className="p-6 lg:p-8 border-cyan-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-cyan-400" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground">AI-Generated Approach</h2>
                </div>
                <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">{assignment.ai_summary}</p>
              </GlassSurface>
            </ScrollReveal>
          )}

          {/* Submit & Grade section */}
          <ScrollReveal direction="up" delay={0.25}>
            <GlassSurface className="p-6 lg:p-8">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                <h2 className="text-xl font-bold text-foreground">Submit Your Work</h2>
              </div>
              <SubmissionForm
                assignmentId={assignment.id}
                onGraded={handleGraded}
              />
            </GlassSurface>
          </ScrollReveal>

          {/* Latest Grade */}
          {latestGrade && (
            <ScrollReveal direction="up" delay={0.3}>
              <GlassSurface className="p-6 lg:p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Award className="h-5 w-5 text-purple-400" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-foreground">
                    {submissions.length > 1 ? "Latest Grade" : "Your Grade"}
                  </h2>
                </div>
                <GradeDisplay
                  result={latestGrade}
                  maxPoints={assignment.max_points || 100}
                />
              </GlassSurface>
            </ScrollReveal>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ScrollReveal direction="up" delay={0.3}>
            <GlassSurface className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Details</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-foreground/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Due Date</h3>
                  </div>
                  <p className="text-white font-medium">{formattedDate}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-foreground/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Status</h3>
                  </div>
                  <p className="text-white font-medium">
                    {assignment.status === "completed" ? "Completed" : "Ongoing"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-foreground/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Created</h3>
                  </div>
                  <p className="text-white font-medium">
                    {new Date(assignment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {submissions.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-foreground/60" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">Submissions</h3>
                    </div>
                    <p className="text-white font-medium">{submissions.length} submitted</p>
                  </div>
                )}
              </div>
            </GlassSurface>
          </ScrollReveal>

          {/* Submission History */}
          {submissions.length > 1 && (
            <ScrollReveal direction="up" delay={0.4}>
              <GlassSurface className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Submission History</h2>
                <div className="space-y-3">
                  {submissions.map((sub: any, idx: number) => {
                    let parsed: any = {}
                    try {
                      parsed = typeof sub.feedback === "string" ? JSON.parse(sub.feedback) : sub.feedback || {}
                    } catch { }
                    return (
                      <div
                        key={sub.id || idx}
                        className={`rounded-lg p-3 border text-sm ${idx === 0
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/5 border-white/10"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-foreground/70">
                            {sub.created_at
                              ? new Date(sub.created_at).toLocaleDateString()
                              : `Attempt ${submissions.length - idx}`}
                          </span>
                          <span className="font-bold text-foreground">
                            {sub.grade ?? parsed.grade ?? "—"}/{assignment.max_points || 100}
                          </span>
                        </div>
                        {parsed.letter_grade && (
                          <span className="text-xs text-foreground/50">{parsed.letter_grade}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </GlassSurface>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  )
}
