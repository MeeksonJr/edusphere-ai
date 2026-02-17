import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  CheckSquare,
  Clock,
  Calendar,
  Beaker,
  BookOpen,
  TrendingUp,
  Award,
  Zap,
  Video,
  Plus,
  Activity,
  MoreHorizontal,
  Sparkles,
  Mic,
  FolderOpen,
  Trophy,
  Target,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { RecentActivityList } from "@/components/dashboard/RecentActivityList"
import { XPProgressBar } from "@/components/dashboard/XPProgressBar"
import { StreakWidget } from "@/components/dashboard/StreakWidget"
import { DailyGoals } from "@/components/dashboard/DailyGoals"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-6 md:p-8 lg:p-12">
        <GlassSurface className="p-8 text-center">
          <p className="text-foreground/70">Please log in to view your dashboard.</p>
        </GlassSurface>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single() as { data: any }

  // Get gamification data
  const { data: streakData } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single() as { data: any }

  // Get recent achievements
  const { data: recentAchievements } = await supabase
    .from("user_achievements")
    .select("*, achievements(*)")
    .eq("user_id", user.id)
    .not("unlocked_at", "is", null)
    .order("unlocked_at", { ascending: false })
    .limit(3) as { data: any[] | null }

  // Get unread notifications count
  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  // Get upcoming assignments (limit to 3)
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "ongoing")
    .order("due_date", { ascending: true })
    .limit(3) as { data: any[] | null }

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

  // Get latest 3 courses for this user
  const { data: latestCourses } = await supabase
    .from("courses")
    .select("id,title,created_at,estimated_duration,status,layout")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3) as { data: any[] | null }

  // Get user skills count
  const { count: skillsCount } = await supabase
    .from("user_skills")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const totalXP = streakData?.total_xp || profile?.total_xp || 0
  const level = streakData?.level || profile?.level || 1
  const currentStreak = streakData?.current_streak || profile?.current_streak || 0
  const longestStreak = streakData?.longest_streak || profile?.longest_streak || 0

  const stats = [
    {
      label: "Level",
      value: level,
      subtitle: `${totalXP.toLocaleString()} total XP`,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Skills",
      value: skillsCount || 0,
      subtitle: "Active skills",
      icon: Target,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      label: "Completed Tasks",
      value: completedCount || 0,
      subtitle: `${dueThisWeekCount || 0} due this week`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "AI Requests",
      value: profile?.ai_requests_count || 0,
      subtitle:
        profile?.subscription_tier === "free"
          ? `${Math.max(0, 10 - (profile?.ai_requests_count || 0))} remaining`
          : "Unlimited access",
      icon: Zap,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20",
    },
  ]

  const quickActions = [
    { name: "New Course", href: "/dashboard/courses/new", icon: Plus, desc: "Create with AI" },
    { name: "AI Lab", href: "/dashboard/ai-lab", icon: Beaker, desc: "Experiment" },
    { name: "AI Tutor", href: "/dashboard/ai-tutor", icon: Mic, desc: "Live Voice" },
    { name: "Skills", href: "/dashboard/skills", icon: Target, desc: "Track Growth" },
    { name: "Notes", href: "/dashboard/notes", icon: FolderOpen, desc: "Knowledge Base" },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar, desc: "Schedule" },
  ]

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AmbientBackground />

      <div className="relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <ScrollReveal direction="up">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
                Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}
              </h1>
              <p className="text-foreground/60 mt-1">
                {currentStreak > 0
                  ? `🔥 ${currentStreak}-day streak! Keep it up.`
                  : "Start your learning streak today!"
                }
              </p>
            </div>
          </ScrollReveal>
          <div className="flex gap-3">
            <Link href="/dashboard/courses/new">
              <Button className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* XP Progress Bar — Full Width */}
        <ScrollReveal direction="up" delay={0.1}>
          <XPProgressBar totalXP={totalXP} level={level} />
        </ScrollReveal>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column (Main Content) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <ScrollReveal key={stat.label} direction="up" delay={i * 0.1}>
                  <div className={`p-4 rounded-2xl glass-surface border ${stat.border} hover:border-opacity-50 transition-all group`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                      <p className="text-sm text-foreground/60 font-medium">{stat.label}</p>
                      <p className="text-xs text-foreground/40 mt-1">{stat.subtitle}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Recent Courses */}
            <ScrollReveal direction="up" delay={0.2}>
              <GlassSurface className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Video className="h-4 w-4 text-cyan-400" />
                    Recent Courses
                  </h2>
                  <Link href="/dashboard/courses" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View All
                  </Link>
                </div>

                {latestCourses && latestCourses.length > 0 ? (
                  <div className="space-y-4">
                    {latestCourses.map((course) => (
                      <div key={course.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/5">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Sparkles className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">{course.title || "Untitled Course"}</h3>
                          <div className="flex items-center gap-3 text-xs text-foreground/50 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.round((course.estimated_duration || 0) / 60)} min
                            </span>
                            <span className="capitalize px-1.5 py-0.5 rounded-full bg-foreground/5">{course.status}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-foreground/50 text-sm">No courses yet. Start creating!</p>
                  </div>
                )}
              </GlassSurface>
            </ScrollReveal>

            {/* Recent Achievements */}
            {recentAchievements && recentAchievements.length > 0 && (
              <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-400" />
                      Recent Achievements
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recentAchievements.map((ua: any) => (
                      <div
                        key={ua.id}
                        className={`p-3 rounded-xl border text-center transition-all hover:scale-105 ${ua.achievements?.rarity === 'legendary'
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : ua.achievements?.rarity === 'epic'
                              ? 'border-purple-500/30 bg-purple-500/5'
                              : ua.achievements?.rarity === 'rare'
                                ? 'border-blue-500/30 bg-blue-500/5'
                                : 'border-white/10 bg-white/5'
                          }`}
                      >
                        <div className="text-2xl mb-1">{ua.achievements?.icon}</div>
                        <div className="text-xs font-medium text-foreground">{ua.achievements?.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          +{ua.achievements?.xp_reward} XP
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassSurface>
              </ScrollReveal>
            )}
          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="space-y-6">

            {/* Streak Widget */}
            <ScrollReveal direction="left" delay={0.2}>
              <StreakWidget
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                lastActivityDate={streakData?.last_activity_date}
                weeklyXP={streakData?.weekly_xp || []}
                dailyXPToday={streakData?.daily_xp_today || 0}
                dailyGoalXP={streakData?.daily_goal_xp || 100}
              />
            </ScrollReveal>

            {/* Daily Goals */}
            <ScrollReveal direction="left" delay={0.3}>
              <DailyGoals />
            </ScrollReveal>

            {/* Quick Actions */}
            <ScrollReveal direction="left" delay={0.4}>
              <GlassSurface className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action) => (
                    <Link key={action.name} href={action.href}>
                      <div className="p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors border border-foreground/5 hover:border-cyan-500/30 group text-center h-full">
                        <div className="mx-auto w-8 h-8 rounded-full bg-background flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <action.icon className="h-4 w-4 text-foreground/80 group-hover:text-cyan-400" />
                        </div>
                        <span className="block text-[11px] font-medium text-foreground">{action.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </GlassSurface>
            </ScrollReveal>

            {/* Upcoming Assignments */}
            <ScrollReveal direction="left" delay={0.5}>
              <GlassSurface className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pink-400" />
                    Upcoming
                  </h2>
                  <Link href="/dashboard/assignments" className="text-xs text-foreground/50 hover:text-foreground">
                    See all
                  </Link>
                </div>

                <div className="space-y-4">
                  {assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="relative pl-4 border-l-2 border-foreground/10 hover:border-cyan-500 transition-colors py-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium text-foreground line-clamp-1">{assignment.title}</h4>
                            <p className="text-xs text-foreground/50 mt-0.5 mb-1">{assignment.subject}</p>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${assignment.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                            {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <CheckSquare className="h-8 w-8 text-foreground/10 mx-auto mb-2" />
                      <p className="text-xs text-foreground/40">No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </GlassSurface>
            </ScrollReveal>

          </div>
        </div>
      </div>
    </div>
  )
}
