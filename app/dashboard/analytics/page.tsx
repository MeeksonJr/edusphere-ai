"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Legend,
} from "recharts"
import {
    BookOpen,
    Trophy,
    Flame,
    Clock,
    Target,
    TrendingUp,
    Award,
    Calendar,
    Zap,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
                    <GlassSurface className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-foreground flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-cyan-400" />
                                Activity Trends
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.5)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}h`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.8)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHours)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassSurface>
                </ScrollReveal>

                {/* Course Progress */}
                <ScrollReveal direction="up" delay={0.3}>
                    <GlassSurface className="p-6 h-full">
                        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                            <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
                            Course Status
                        </h3>
                        <div className="h-[300px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={courseProgressData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {courseProgressData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.8)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassSurface>
                </ScrollReveal>

                {/* Subject Mastery */}
                <ScrollReveal direction="up" delay={0.4}>
                    <GlassSurface className="p-6 h-full">
                        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center">
                            <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                            Subject Mastery
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectMasteryData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skill Level"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="#8b5cf6"
                                        fillOpacity={0.5}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.8)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassSurface>
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
