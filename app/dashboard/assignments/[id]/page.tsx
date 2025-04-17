import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, ChevronLeft, Clock } from "lucide-react"
import type { Database } from "@/types/supabase"
import { AssignmentActions } from "./assignment-actions"

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get assignment details
  const { data: assignment, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (error || !assignment) {
    notFound()
  }

  // Format date
  const formattedDate = assignment.due_date
    ? new Date(assignment.due_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No due date"

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Link href="/dashboard/assignments" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Assignments
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold neon-text-purple">{assignment.title}</h1>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <AssignmentActions assignment={assignment} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {assignment.subject && (
            <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">{assignment.subject}</span>
          )}
          {assignment.priority && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                assignment.priority === "high"
                  ? "bg-red-900/30 text-red-400"
                  : assignment.priority === "medium"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-green-900/30 text-green-400"
              }`}
            >
              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)} Priority
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              assignment.status === "completed" ? "bg-green-900/30 text-green-400" : "bg-blue-900/30 text-blue-400"
            }`}
          >
            {assignment.status === "completed" ? "Completed" : "Ongoing"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{assignment.description || "No description provided."}</p>
            </CardContent>
          </Card>

          {assignment.ai_summary && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>AI-Generated Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{assignment.ai_summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400">Due Date</h3>
                <p className="flex items-center mt-1">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  {formattedDate}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">Status</h3>
                <p className="flex items-center mt-1">
                  <CheckSquare className="mr-2 h-4 w-4 text-gray-400" />
                  {assignment.status === "completed" ? "Completed" : "Ongoing"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400">Created</h3>
                <p className="mt-1 text-sm">
                  {new Date(assignment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
