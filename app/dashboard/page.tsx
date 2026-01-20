import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, Calendar, Beaker, ArrowRight, BookOpen, BrainCircuit, TrendingUp, Award, Zap } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

export default async function Dashboard() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center">
          <p className="text-white/70">Please log in to view your dashboard.</p>
        </GlassSurface>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get upcoming assignments (limit to 3)
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "ongoing")
    .order("due_date", { ascending: true })
    .limit(3)

  // Get completed assignments count
  const { count: completedCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")

  // Get assignments due this week
  const oneWeekFromNow = new Date()
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

  const { count: dueThisWeekCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "ongoing")
    .lt("due_date", oneWeekFromNow.toISOString())

  const stats = [
    {
      label: "Ongoing Assignments",
      value: assignments?.length || 0,
      subtitle: `${dueThisWeekCount || 0} due this week`,
      icon: CheckSquare,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      label: "AI Requests",
      value: profile?.ai_requests_count || 0,
      subtitle:
        profile?.subscription_tier === "free"
          ? `${Math.max(0, 10 - (profile?.ai_requests_count || 0))} remaining`
          : "Unlimited access",
      icon: Zap,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      label: "Subscription",
      value: profile?.subscription_tier || "Free",
      subtitle: profile?.subscription_tier === "free" ? "Upgrade for more" : "All features unlocked",
      icon: Award,
      gradient: "from-green-500 to-green-600",
    },
    {
      label: "Completed",
      value: completedCount || 0,
      subtitle: "Assignments finished",
      icon: TrendingUp,
      gradient: "from-pink-500 to-pink-600",
    },
  ]

  const quickActions = [
    { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker, color: "from-purple-500 to-purple-600" },
    { name: "New Assignment", href: "/dashboard/assignments/new", icon: CheckSquare, color: "from-blue-500 to-blue-600" },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar, color: "from-green-500 to-green-600" },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: BrainCircuit, color: "from-pink-500 to-pink-600" },
    { name: "Study Resources", href: "/dashboard/resources", icon: BookOpen, color: "from-yellow-500 to-yellow-600" },
  ]

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Welcome back, </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {profile?.full_name || "Student"}
            </span>
          </h1>
          <p className="text-white/70">Here's an overview of your academic progress</p>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <ScrollReveal key={stat.label} direction="up" delay={0.1 * index}>
              <AnimatedCard variant="glow" delay={0.1 * index}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} p-3`}
                    >
                      <Icon className="h-full w-full text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm text-white/60 mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">
                      {typeof stat.value === "string" ? (
                        <span className="capitalize">{stat.value}</span>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <p className="text-xs text-white/50">{stat.subtitle}</p>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Assignments */}
        <ScrollReveal direction="up" delay={0.4}>
          <GlassSurface className="md:col-span-2 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Upcoming Assignments</h2>
                <p className="text-sm text-white/60">Your tasks due soon</p>
              </div>
              <Link href="/dashboard/assignments">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300"
                  aria-label="View all assignments"
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className="p-4 rounded-lg glass-surface border border-white/10 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 flex-shrink-0">
                        <CheckSquare className="h-full w-full text-purple-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white truncate">{assignment.title}</h3>
                          <div className="flex items-center text-xs text-white/60 ml-2 flex-shrink-0">
                            <Clock className="mr-1 h-3 w-3" aria-hidden="true" />
                            {new Date(assignment.due_date || "").toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2 mb-3">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-1 rounded-full glass-surface border-white/10">
                            {assignment.subject}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              assignment.priority === "high"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : assignment.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                            }`}
                          >
                            {assignment.priority?.charAt(0).toUpperCase() + assignment.priority?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-white/20 mx-auto mb-4" aria-hidden="true" />
                <p className="text-white/60 mb-4">No upcoming assignments</p>
                <Link href="/dashboard/assignments/new">
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    Create Assignment
                  </Button>
                </Link>
              </div>
            )}
          </GlassSurface>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal direction="up" delay={0.5}>
          <GlassSurface className="p-6 lg:p-8">
            <h2 className="text-xl font-bold text-white mb-1">Quick Actions</h2>
            <p className="text-sm text-white/60 mb-6">Frequently used tools</p>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <div
                      className="p-4 rounded-lg glass-surface border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} p-2 group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="h-full w-full text-white" aria-hidden="true" />
                          </div>
                          <span className="text-white font-medium group-hover:text-purple-400 transition-colors">
                            {action.name}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </GlassSurface>
        </ScrollReveal>
      </div>
    </div>
  )
}
