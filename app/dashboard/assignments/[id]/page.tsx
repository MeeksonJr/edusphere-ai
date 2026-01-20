import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckSquare, ChevronLeft, Clock, Calendar, Sparkles } from "lucide-react"
import type { Database } from "@/types/supabase"
import { AssignmentActions } from "./assignment-actions"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (error || !assignment) {
    notFound()
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
            className="inline-flex items-center text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Back to Assignments
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">{assignment.title}</span>
            </h1>
            <div className="flex items-center space-x-2">
              <AssignmentActions assignment={assignment} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.subject && (
              <Badge className="glass-surface border-white/10 text-white/80">{assignment.subject}</Badge>
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
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <ScrollReveal direction="up" delay={0.1}>
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {assignment.description || "No description provided."}
              </p>
            </GlassSurface>
          </ScrollReveal>

          {assignment.ai_summary && (
            <ScrollReveal direction="up" delay={0.2}>
              <GlassSurface className="p-6 lg:p-8 border-purple-500/30">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-400" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-white">AI-Generated Approach</h2>
                </div>
                <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{assignment.ai_summary}</p>
              </GlassSurface>
            </ScrollReveal>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ScrollReveal direction="up" delay={0.3}>
            <GlassSurface className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Details</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-white/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Due Date</h3>
                  </div>
                  <p className="text-white font-medium">{formattedDate}</p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckSquare className="h-4 w-4 text-white/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Status</h3>
                  </div>
                  <p className="text-white font-medium">
                    {assignment.status === "completed" ? "Completed" : "Ongoing"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-white/60" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Created</h3>
                  </div>
                  <p className="text-white font-medium">
                    {new Date(assignment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
