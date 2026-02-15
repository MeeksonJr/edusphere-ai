import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, Plus, Search, Filter, SortAsc, SortDesc, CheckCircle2, Circle, Calendar } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; subject?: string; sort?: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center">
          <p className="text-white/70">Please log in to view your assignments.</p>
        </GlassSurface>
      </div>
    )
  }

  // Get filter parameters
  const status = searchParams.status || "all"
  const subject = searchParams.subject || "all"
  const sort = searchParams.sort || "due_date-asc"
  const [sortField, sortOrder] = sort.split("-")

  // Build query
  let query = supabase.from("assignments").select("*").eq("user_id", user.id)

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
    .eq("user_id", user.id)
    .not("subject", "is", null)

  const uniqueSubjects = Array.from(new Set(subjects?.map((item: any) => item.subject) || []))

  const statusFilters = [
    { value: "all", label: "All", icon: CheckSquare },
    { value: "ongoing", label: "Ongoing", icon: Circle },
    { value: "completed", label: "Completed", icon: CheckCircle2 },
  ]

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">Assignments</span>
            </h1>
            <p className="text-white/70">Manage your academic tasks and deadlines</p>
          </div>
          <Link href="/dashboard/assignments/new" className="mt-4 md:mt-0">
            <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              New Assignment
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Filters */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search assignments..."
                className="pl-10 glass-surface border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => {
                const Icon = filter.icon
                const isActive = status === filter.value
                return (
                  <Link
                    key={filter.value}
                    href={`/dashboard/assignments?status=${filter.value}&subject=${subject}&sort=${sort}`}
                  >
                    <Badge
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white border-cyan-500/30"
                          : "glass-surface border-white/20 text-white/70 hover:text-white hover:border-white/40"
                      }`}
                    >
                      <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      {filter.label}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Subject & Sort Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white/60" aria-hidden="true" />
              <span className="text-sm text-white/60">Subject:</span>
              <Link
                href={`/dashboard/assignments?status=${status}&subject=all&sort=${sort}`}
                className={`text-sm px-2 py-1 rounded ${
                  subject === "all"
                    ? "text-cyan-400 font-medium"
                    : "text-white/70 hover:text-white"
                }`}
              >
                All
              </Link>
              {uniqueSubjects.map((subj) => (
                <Link
                  key={subj}
                  href={`/dashboard/assignments?status=${status}&subject=${subj}&sort=${sort}`}
                  className={`text-sm px-2 py-1 rounded ${
                    subject === subj
                      ? "text-cyan-400 font-medium"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {subj}
                </Link>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-white/60">Sort:</span>
              <Link
                href={`/dashboard/assignments?status=${status}&subject=${subject}&sort=due_date-asc`}
                className={`p-1.5 rounded ${
                  sort === "due_date-asc"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-white/60 hover:text-white"
                }`}
                aria-label="Sort by due date ascending"
              >
                <SortAsc className="h-4 w-4" />
              </Link>
              <Link
                href={`/dashboard/assignments?status=${status}&subject=${subject}&sort=due_date-desc`}
                className={`p-1.5 rounded ${
                  sort === "due_date-desc"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-white/60 hover:text-white"
                }`}
                aria-label="Sort by due date descending"
              >
                <SortDesc className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GlassSurface>
      </ScrollReveal>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments && assignments.length > 0 ? (
          assignments.map((assignment, index) => (
            <ScrollReveal key={assignment.id} direction="up" delay={0.05 * index}>
              <Link href={`/dashboard/assignments/${assignment.id}`}>
                <AnimatedCard variant="3d" delay={0.05 * index} className="cursor-pointer group">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl p-3 flex-shrink-0 ${
                          assignment.status === "completed"
                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                            : "bg-gradient-to-br from-cyan-500/20 to-pink-500/20"
                        }`}
                      >
                        {assignment.status === "completed" ? (
                          <CheckCircle2 className="h-full w-full text-green-400" aria-hidden="true" />
                        ) : (
                          <CheckSquare className="h-full w-full text-cyan-400" aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center text-sm text-white/60 ml-4 flex-shrink-0">
                            <Clock className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            {assignment.due_date
                              ? new Date(assignment.due_date).toLocaleDateString()
                              : "No due date"}
                          </div>
                        </div>
                        {assignment.description && (
                          <p className="text-white/70 text-sm mb-3 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {assignment.subject && (
                            <Badge className="glass-surface border-white/10 text-white/80">
                              {assignment.subject}
                            </Badge>
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
                              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                            </Badge>
                          )}
                          <Badge
                            className={
                              assignment.status === "completed"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </Link>
            </ScrollReveal>
          ))
        ) : (
          <ScrollReveal direction="up">
            <GlassSurface className="p-12 text-center">
              <CheckSquare className="h-16 w-16 text-white/20 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-white mb-2">No assignments found</h3>
              <p className="text-white/60 mb-6">
                {status !== "all"
                  ? `No ${status} assignments match your filters.`
                  : "Get started by creating your first assignment."}
              </p>
              <Link href="/dashboard/assignments/new">
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white">
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                  Create Assignment
                </Button>
              </Link>
            </GlassSurface>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
