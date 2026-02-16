"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import {
    Trophy,
    Flame,
    Clock,
    Target,
    Award,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Lazy load Recharts components
const ActivityChart = dynamic(() => import("@/components/dashboard/analytics/ActivityChart"), {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const ProgressChart = dynamic(() => import("@/components/dashboard/analytics/ProgressChart"), {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})
const MasteryChart = dynamic(() => import("@/components/dashboard/analytics/MasteryChart"), {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-gray-800/20 rounded-lg" />,
    ssr: false,
})

// --- Mock Data ---

const activityData = [
    { name: "Mon", hours: 2.5, courses: 1 },
    { name: "Tue", hours: 4.2, courses: 2 },
    { name: "Wed", hours: 1.8, courses: 0 },
    { name: "Thu", hours: 3.5, courses: 1 },
    { name: "Fri", hours: 5.0, courses: 3 },
    { name: "Sat", hours: 6.2, courses: 2 },
    { name: "Sun", hours: 2.0, courses: 1 },
]

const subjectMasteryData = [
    { subject: "Coding", A: 120, fullMark: 150 },
    { subject: "Math", A: 98, fullMark: 150 },
    { subject: "History", A: 86, fullMark: 150 },
    { subject: "Science", A: 99, fullMark: 150 },
    { subject: "Art", A: 85, fullMark: 150 },
    { subject: "Language", A: 65, fullMark: 150 },
]

const courseProgressData = [
    { name: "Completed", value: 4, color: "#10b981" },
    { name: "In Progress", value: 3, color: "#06b6d4" },
    { name: "Not Started", value: 2, color: "#64748b" },
]

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("week")

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
                        <p className="text-foreground/70">Track your progress and insights.</p>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px] glass-surface border-foreground/20 text-foreground">
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="glass-surface border-foreground/20">
                            <SelectItem value="week" className="text-foreground">This Week</SelectItem>
                            <SelectItem value="month" className="text-foreground">This Month</SelectItem>
                            <SelectItem value="year" className="text-foreground">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </ScrollReveal>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Study Time", value: "24.5h", icon: Clock, color: "text-blue-400", sub: "+12% vs last week" },
                    { label: "Courses Completed", value: "12", icon: Trophy, color: "text-yellow-400", sub: "2 this week" },
                    { label: "Current Streak", value: "5 Days", icon: Flame, color: "text-orange-400", sub: "Keep it up!" },
                    { label: "Focus Score", value: "88%", icon: Target, color: "text-green-400", sub: "Top 10% of users" },
                ].map((stat, i) => (
                    <ScrollReveal key={stat.label} direction="up" delay={i * 0.05} className="h-full">
                        <GlassSurface className="p-4 flex flex-col justify-between h-full hover:border-cyan-500/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-foreground/60">{stat.label}</span>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                                <div className="text-xs text-foreground/50">{stat.sub}</div>
                            </div>
                        </GlassSurface>
                    </ScrollReveal>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Activity Chart */}
                <ScrollReveal direction="up" delay={0.2} className="col-span-1 lg:col-span-2">
                    <ActivityChart data={activityData} />
                </ScrollReveal>

                {/* Course Progress */}
                <ScrollReveal direction="up" delay={0.3}>
                    <ProgressChart data={courseProgressData} />
                </ScrollReveal>

                {/* Subject Mastery */}
                <ScrollReveal direction="up" delay={0.4}>
                    <MasteryChart data={subjectMasteryData} />
                </ScrollReveal>
            </div>

            {/* Recent Achievements */}
            <ScrollReveal direction="up" delay={0.5}>
                <GlassSurface className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Award className="mr-2 h-5 w-5 text-orange-400" />
                        Recent Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: "Early Bird", desc: "Completed 5 lessons before 9 AM", icon: "🌅" },
                            { title: "Quiz Master", desc: "Scored 100% on 3 quizzes in a row", icon: "🎯" },
                            { title: "Consistency Is Key", desc: "Studied for 7 days straight", icon: "🔥" },
                        ].map((achievement, i) => (
                            <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-foreground/5 border border-foreground/10">
                                <div className="text-2xl">{achievement.icon}</div>
                                <div>
                                    <div className="font-semibold text-foreground text-sm">{achievement.title}</div>
                                    <div className="text-xs text-foreground/60">{achievement.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
