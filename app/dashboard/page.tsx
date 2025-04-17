import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Clock, Calendar, Beaker, ArrowRight, BookOpen, BrainCircuit } from "lucide-react"
import type { Database } from "@/types/supabase"

export default async function Dashboard() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Get upcoming assignments (limit to 3)
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", user?.id)
    .eq("status", "ongoing")
    .order("due_date", { ascending: true })
    .limit(3)

  // Get completed assignments count
  const { count: completedCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "completed")

  // Get assignments due this week
  const oneWeekFromNow = new Date()
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

  const { count: dueThisWeekCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "ongoing")
    .lt("due_date", oneWeekFromNow.toISOString())

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-purple">Welcome, {profile?.full_name || "Student"}</h1>
        <p className="text-gray-400 mt-1">Here's an overview of your academic progress</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <Card className="glass-card hover:neon-border-purple transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments?.length || 0} Ongoing</div>
            <p className="text-xs text-gray-400 mt-1">{dueThisWeekCount || 0} due this week</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:neon-border-green transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">AI Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.ai_requests_count || 0} Used</div>
            <p className="text-xs text-gray-400 mt-1">
              {profile?.subscription_tier === "free"
                ? `${Math.max(0, 10 - (profile?.ai_requests_count || 0))} remaining this month`
                : "Unlimited access"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:neon-border-blue transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{profile?.subscription_tier || "Free"}</div>
            <p className="text-xs text-gray-400 mt-1">
              {profile?.subscription_tier === "free" ? "Upgrade for more features" : "All features unlocked"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:neon-border-pink transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount || 0}</div>
            <p className="text-xs text-gray-400 mt-1">Assignments finished</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Assignments */}
        <Card className="glass-card md:col-span-2 hover:neon-border-purple transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Assignments</CardTitle>
              <Link href="/dashboard/assignments">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </Link>
            </div>
            <CardDescription>Your tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start space-x-4">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{assignment.title}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(assignment.due_date || "").toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">{assignment.description}</p>
                      <div className="flex items-center pt-1">
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{assignment.subject}</span>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            assignment.priority === "high"
                              ? "bg-red-900/30 text-red-400"
                              : assignment.priority === "medium"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-green-900/30 text-green-400"
                          }`}
                        >
                          {assignment.priority?.charAt(0).toUpperCase() + assignment.priority?.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">No upcoming assignments</p>
                <Link href="/dashboard/assignments/new">
                  <Button className="mt-4 bg-primary hover:bg-primary/80">Create Assignment</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card hover:neon-border-green transition-all">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/ai-lab">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-700 hover:border-primary hover:text-primary"
              >
                <div className="flex items-center">
                  <Beaker className="mr-2 h-4 w-4" />
                  AI Lab
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/assignments/new">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-700 hover:border-primary hover:text-primary"
              >
                <div className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  New Assignment
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/calendar">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-700 hover:border-primary hover:text-primary"
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/flashcards">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-700 hover:border-primary hover:text-primary"
              >
                <div className="flex items-center">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Flashcards
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/resources">
              <Button
                variant="outline"
                className="w-full justify-between border-gray-700 hover:border-primary hover:text-primary"
              >
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Study Resources
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
