"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import {
    Trophy,
    Flame,
    Clock,
    Target,
    Award,
    Zap,
    GraduationCap,
    BarChart3,
    Sparkles,
    Brain,
    BookOpen,
    Layers,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Lazy load chart components
const ActivityChart = dynamic(() => import("@/components/dashboard/analytics/ActivityChart"), {
    loading: () => <div className="h-[380px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const ProgressChart = dynamic(() => import("@/components/dashboard/analytics/ProgressChart"), {
    loading: () => <div className="h-[380px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const MasteryChart = dynamic(() => import("@/components/dashboard/analytics/MasteryChart"), {
    loading: () => <div className="h-[380px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const StreakHeatmap = dynamic(() => import("@/components/dashboard/analytics/StreakHeatmap"), {
    loading: () => <div className="h-[200px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const SessionStatsChart = dynamic(() => import("@/components/dashboard/analytics/SessionStatsChart"), {
    loading: () => <div className="h-[380px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const AIInsightsPanel = dynamic(() => import("@/components/dashboard/analytics/AIInsightsPanel"), {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})

interface AnalyticsData {
    stats: {
        totalXP: number
        level: number
        levelTitle: string
        levelProgress: { current: number; needed: number; progress: number }
        streak: number
        longestStreak: number
        totalStudyMinutes: number
        coursesCompleted: number
        totalCourses: number
        sessionsCompleted: number
        avgSessionRating: number
        focusScore: number
        totalCards: number
        totalResources: number
        assignmentCompletion: number
    }
    activityData: any[]
    courseProgressData: any[]
    subjectMasteryData: any[]
    streakHeatmap: { date: string; count: number }[]
    sessionStats: any[]
    topTopics: { topic: string; count: number }[]
    aiInsights: string[]
    recentAchievements: {
        title: string
        description: string
        icon: string
        xp_reward: number
        unlockedAt: string
    }[]
}

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<AnalyticsData | null>(null)

    const fetchData = useCallback(async (range: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/analytics?range=${range}`)
            if (res.ok) {
                const jsonData = await res.json()
                setData(jsonData)
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData(timeRange)
    }, [timeRange, fetchData])

    if (loading) {
        return (
            <div className="relative min-h-screen p-6 md:p-8 lg:p-12">
                <AmbientBackground />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
                        <span className="text-sm text-foreground/50">Loading analytics…</span>
                    </div>
                </div>
            </div>
        )
    }

    const stats = data?.stats || {
        totalXP: 0, level: 0, levelTitle: 'Beginner', levelProgress: { current: 0, needed: 100, progress: 0 },
        streak: 0, longestStreak: 0, totalStudyMinutes: 0, coursesCompleted: 0, totalCourses: 0,
        sessionsCompleted: 0, avgSessionRating: 0, focusScore: 0, totalCards: 0, totalResources: 0, assignmentCompletion: 0,
    }

    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return m > 0 ? `${h}h ${m}m` : `${h}h`
    }

    const statCards = [
        {
            label: "Level",
            value: `${stats.level}`,
            sub: stats.levelTitle,
            icon: GraduationCap,
            color: "text-violet-400",
            glow: "from-violet-500/10 to-transparent",
        },
        {
            label: "Total XP",
            value: stats.totalXP.toLocaleString(),
            sub: `${stats.levelProgress.progress}% to next`,
            icon: Zap,
            color: "text-amber-400",
            glow: "from-amber-500/10 to-transparent",
        },
        {
            label: "Streak",
            value: `${stats.streak}`,
            sub: `Best: ${stats.longestStreak} days`,
            icon: Flame,
            color: "text-orange-400",
            glow: "from-orange-500/10 to-transparent",
        },
        {
            label: "Study Time",
            value: formatTime(stats.totalStudyMinutes),
            sub: "From AI sessions",
            icon: Clock,
            color: "text-blue-400",
            glow: "from-blue-500/10 to-transparent",
        },
        {
            label: "Courses",
            value: `${stats.coursesCompleted}/${stats.totalCourses}`,
            sub: "Completed",
            icon: BookOpen,
            color: "text-emerald-400",
            glow: "from-emerald-500/10 to-transparent",
        },
        {
            label: "Sessions",
            value: `${stats.sessionsCompleted}`,
            sub: `⭐ ${stats.avgSessionRating}/5 avg`,
            icon: Brain,
            color: "text-cyan-400",
            glow: "from-cyan-500/10 to-transparent",
        },
        {
            label: "Flashcards",
            value: `${stats.totalCards}`,
            sub: `${stats.totalResources} resources`,
            icon: Layers,
            color: "text-pink-400",
            glow: "from-pink-500/10 to-transparent",
        },
        {
            label: "Focus Score",
            value: `${stats.focusScore}%`,
            sub: stats.focusScore >= 80 ? "Excellent" : stats.focusScore >= 50 ? "Good" : "Building",
            icon: Target,
            color: "text-green-400",
            glow: "from-green-500/10 to-transparent",
        },
    ]

    return (
        <div className="relative min-h-screen p-6 md:p-8 lg:p-12 pb-32">
            <AmbientBackground />

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-foreground">Learning</span>{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Analytics
                            </span>
                        </h1>
                        <p className="text-foreground/60">Your complete learning intelligence dashboard.</p>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px] glass-surface border-foreground/20 text-foreground">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-foreground/20">
                            <SelectItem value="week" className="text-foreground">This Week</SelectItem>
                            <SelectItem value="month" className="text-foreground">This Month</SelectItem>
                            <SelectItem value="quarter" className="text-foreground">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </ScrollReveal>

            {/* ──── 1. Stats Grid ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {statCards.map((stat, i) => (
                    <ScrollReveal key={stat.label} direction="up" delay={i * 0.04} className="h-full">
                        <GlassSurface className="p-4 flex flex-col justify-between h-full hover:border-white/10 transition-all relative overflow-hidden group">
                            {/* Subtle glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.glow} opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-foreground/50 font-medium">{stat.label}</span>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                                <div className="text-2xl font-bold text-foreground mb-0.5">{stat.value}</div>
                                <div className="text-[11px] text-foreground/40">{stat.sub}</div>
                            </div>
                        </GlassSurface>
                    </ScrollReveal>
                ))}
            </div>

            {/* XP Progress Bar */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-4 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground/60">Level {stats.level} → Level {stats.level + 1}</span>
                        <span className="text-xs text-foreground/40">{stats.levelProgress.current} / {stats.levelProgress.needed} XP</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${stats.levelProgress.progress}%`,
                                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)',
                            }}
                        />
                    </div>
                </GlassSurface>
            </ScrollReveal>

            {/* ──── 2. Activity Trends (full width) ──── */}
            <ScrollReveal direction="up" delay={0.15} className="mb-8">
                <ActivityChart data={data?.activityData || []} />
            </ScrollReveal>

            {/* ──── 3. Streak Heatmap (full width) ──── */}
            <ScrollReveal direction="up" delay={0.2} className="mb-8">
                <StreakHeatmap
                    data={data?.streakHeatmap || []}
                    currentStreak={stats.streak}
                    longestStreak={stats.longestStreak}
                />
            </ScrollReveal>

            {/* ──── 4. Course Progress + Skill Radar (2-col) ──── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ScrollReveal direction="up" delay={0.25}>
                    <ProgressChart data={data?.courseProgressData || []} />
                </ScrollReveal>
                <ScrollReveal direction="up" delay={0.3}>
                    <MasteryChart data={data?.subjectMasteryData || []} />
                </ScrollReveal>
            </div>

            {/* ──── 5. Session Performance (full width for single col, or paired) ──── */}
            <ScrollReveal direction="up" delay={0.35} className="mb-8">
                <SessionStatsChart
                    data={data?.sessionStats || []}
                    totalSessions={stats.sessionsCompleted}
                    avgRating={stats.avgSessionRating}
                />
            </ScrollReveal>

            {/* ──── 6. AI Insights (full width) ──── */}
            <ScrollReveal direction="up" delay={0.4} className="mb-8">
                <AIInsightsPanel
                    insights={data?.aiInsights || []}
                    topTopics={data?.topTopics || []}
                />
            </ScrollReveal>

            {/* ──── 7. Recent Achievements ──── */}
            <ScrollReveal direction="up" delay={0.45}>
                <GlassSurface className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Award className="mr-2 h-5 w-5 text-orange-400" />
                        Recent Achievements
                    </h3>
                    {(data?.recentAchievements?.length || 0) > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data!.recentAchievements.map((achievement, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-colors">
                                    <div className="text-2xl shrink-0">{achievement.icon}</div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-foreground text-sm truncate">{achievement.title}</div>
                                        <div className="text-xs text-foreground/50 line-clamp-2">{achievement.description}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {achievement.xp_reward > 0 && (
                                                <span className="text-[10px] text-amber-400 font-medium">+{achievement.xp_reward} XP</span>
                                            )}
                                            <span className="text-[10px] text-foreground/30">
                                                {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-foreground/30 text-sm">
                            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p>No achievements unlocked yet — keep studying to earn them!</p>
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
