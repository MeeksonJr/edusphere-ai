import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, Clock, Plus, Search, Filter, SortAsc, SortDesc, CheckCircle2, Circle } from "lucide-react"
import type { Database } from "@/types/supabase"

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; subject?: string; sort?: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get filter parameters
  const status = searchParams.status || "all"
  const subject = searchParams.subject || "all"
  const sort = searchParams.sort || "due_date-asc"
  const [sortField, sortOrder] = sort.split("-")

  // Build query
  let query = supabase.from("assignments").select("*").eq("user_id", user?.id)

  // Apply filters
  if (status !== "all") {
    query = query.eq("status", status)
  }

  if (subject !== "all") {
    query = query.eq("subject", subject)
  }

  // Apply sorting
  if (sortField && sortOrder) {
    query = query.order(sortField, { ascending: sortOrder === "asc" })
  }

  // Execute query
  const { data: assignments, error } = await query

  // Get unique subjects for filter
  const { data: subjects } = await supabase
    .from("assignments")
    .select("subject")
    .eq("user_id", user?.id)
    .not("subject", "is", null)

  const uniqueSubjects = Array.from(new Set(subjects?.map((item) => item.subject)))

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold neon-text-purple">Assignments</h1>
          <p className="text-gray-400 mt-1">Manage your academic tasks and deadlines</p>
        </div>
        <Link href="/dashboard/assignments/new">
          <Button className="mt-4 md:mt-0 bg-primary hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="glass-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search assignments..."
                className="w-full rounded-md border border-gray-700 bg-gray-900 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/assignments?status=all&subject=${subject}&sort=${sort}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  status === "all" ? "bg-primary/20 text-primary" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                All
              </Link>
              <Link
                href={`/dashboard/assignments?status=ongoing&subject=${subject}&sort=${sort}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  status === "ongoing" ? "bg-primary/20 text-primary" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Circle className="mr-1 h-3 w-3" /> Ongoing
              </Link>
              <Link
                href={`/dashboard/assignments?status=completed&subject=${subject}&sort=${sort}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  status === "completed" ? "bg-primary/20 text-primary" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
              </Link>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="mr-1 h-3 w-3" /> Subject
                </Button>
                {/* Subject dropdown would go here */}
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  {sortOrder === "asc" ? <SortAsc className="mr-1 h-3 w-3" /> : <SortDesc className="mr-1 h-3 w-3" />}{" "}
                  Sort
                </Button>
                {/* Sort dropdown would go here */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {assignments && assignments.length > 0 ? (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
              <Card className="glass-card hover:neon-border-purple transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-md ${
                        assignment.status === "completed" ? "bg-green-900/30" : "bg-gray-800"
                      }`}
                    >
                      <CheckSquare
                        className={`h-5 w-5 ${assignment.status === "completed" ? "text-green-400" : "text-primary"}`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{assignment.description}</p>
                      <div className="flex items-center pt-1">
                        {assignment.subject && (
                          <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{assignment.subject}</span>
                        )}
                        {assignment.priority && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              assignment.priority === "high"
                                ? "bg-red-900/30 text-red-400"
                                : assignment.priority === "medium"
                                  ? "bg-yellow-900/30 text-yellow-400"
                                  : "bg-green-900/30 text-green-400"
                            }`}
                          >
                            {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                          </span>
                        )}
                        {assignment.status === "completed" && (
                          <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No assignments found</h3>
          <p className="text-gray-400 mb-6">
            {status !== "all"
              ? `You don't have any ${status} assignments.`
              : "Start by creating your first assignment."}
          </p>
          <Link href="/dashboard/assignments/new">
            <Button className="bg-primary hover:bg-primary/80">
              <Plus className="mr-2 h-4 w-4" /> Create Assignment
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
