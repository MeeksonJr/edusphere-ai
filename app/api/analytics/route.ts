import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { calculateLevel, xpToNextLevel, getLevelTitle } from "@/lib/gamification"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "week" // week | month | quarter

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Calculate date ranges
        const now = new Date()
        const dayCount = range === "quarter" ? 90 : range === "month" ? 30 : 7
        const rangeStart = new Date(now)
        rangeStart.setDate(now.getDate() - dayCount)

        // ─── Parallel data fetch ───
        const [
            profileRes,
            streakRes,
            achievementsRes,
            coursesRes,
            sessionsRes,
            flashcardRes,
            resourcesRes,
            assignmentsRes,
            analyticsRes,
        ] = await Promise.all([
            // Profile (XP, level)
            supabase.from("profiles").select("total_xp, display_name").eq("id", user.id).single(),

            // Streak
            supabase.from("user_streaks").select("*").eq("user_id", user.id).single(),

            // Achievements
            supabase.from("user_achievements")
                .select("*, achievements(*)")
                .eq("user_id", user.id)
                .not("unlocked_at", "is", null)
                .order("unlocked_at", { ascending: false })
                .limit(6),

            // Courses
            supabase.from("courses").select("id, title, status, type, created_at").eq("user_id", user.id),

            // AI Tutor Sessions
            supabase.from("live_sessions")
                .select("id, topic, session_type, duration_seconds, quality_rating, xp_earned, feedback, created_at, ended_at")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }),

            // Flashcards
            supabase.from("flashcard_sets").select("id, title, cards, created_at").eq("user_id", user.id),

            // Study Resources
            supabase.from("study_resources").select("id, title, resource_type, ai_generated, created_at").eq("user_id", user.id),

            // Assignments
            supabase.from("assignments").select("id, status, due_date").eq("user_id", user.id),

            // Course analytics events in range
            supabase.from("course_analytics")
                .select("event_type, timestamp, course_id, event_data")
                .eq("user_id", user.id)
                .gte("timestamp", rangeStart.toISOString())
                .order("timestamp", { ascending: true }),
        ])

        const profile = profileRes.data as any
        const streak = streakRes.data as any
        const achievements = (achievementsRes.data || []) as any[]
        const courses = (coursesRes.data || []) as any[]
        const sessions = (sessionsRes.data || []) as any[]
        const flashcards = (flashcardRes.data || []) as any[]
        const resources = (resourcesRes.data || []) as any[]
        const assignments = (assignmentsRes.data || []) as any[]
        const analyticsEvents = (analyticsRes.data || []) as any[]

        // ─── Stats ───
        const totalXP = profile?.total_xp || 0
        const level = calculateLevel(totalXP)
        const levelProgress = xpToNextLevel(totalXP)
        const levelTitle = getLevelTitle(level)

        const currentStreak = streak?.current_streak || 0
        const longestStreak = streak?.longest_streak || 0

        const completedCourses = courses.filter((c: any) => c.status === 'completed').length
        const inProgressCourses = courses.filter((c: any) => c.status === 'processing' || c.status === 'ready').length
        const totalCourses = courses.length

        const totalSessions = sessions.length
        const totalSessionMinutes = Math.round(sessions.reduce((acc: number, s: any) => acc + (s.duration_seconds || 0), 0) / 60)
        const ratedSessions = sessions.filter((s: any) => s.quality_rating)
        const avgSessionRating = ratedSessions.length > 0
            ? Math.round(ratedSessions.reduce((acc: number, s: any) => acc + s.quality_rating, 0) / ratedSessions.length * 10) / 10
            : 0
        const totalSessionXP = sessions.reduce((acc: number, s: any) => acc + (s.xp_earned || 0), 0)

        const totalCards = flashcards.reduce((acc: number, f: any) => acc + (f.cards?.length || 0), 0)

        const completedAssignments = assignments.filter((a: any) => a.status === 'completed').length
        const totalAssignments = assignments.length

        // Focus Score: composite metric (0–100)
        // Factors: streak consistency, session quality, assignment completion, daily activity
        const streakFactor = Math.min(currentStreak / 7, 1) * 25
        const ratingFactor = (avgSessionRating / 5) * 25
        const completionFactor = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 25 : 12.5
        const activityFactor = Math.min(totalSessions / 10, 1) * 25
        const focusScore = Math.round(streakFactor + ratingFactor + completionFactor + activityFactor)

        const stats = {
            totalXP,
            level,
            levelTitle,
            levelProgress,
            streak: currentStreak,
            longestStreak,
            totalStudyMinutes: totalSessionMinutes,
            coursesCompleted: completedCourses,
            totalCourses,
            sessionsCompleted: totalSessions,
            avgSessionRating,
            focusScore,
            totalCards,
            totalResources: resources.length,
            assignmentCompletion: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
        }

        // ─── Activity Chart Data (daily) ───
        const activityMap = new Map<string, { date: string; label: string; studyMinutes: number; sessions: number; xpEarned: number }>()

        for (let i = 0; i < dayCount; i++) {
            const d = new Date(now)
            d.setDate(now.getDate() - (dayCount - 1 - i))
            const dateStr = d.toISOString().slice(0, 10)
            const label = dayCount <= 7
                ? d.toLocaleDateString('en-US', { weekday: 'short' })
                : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            activityMap.set(dateStr, { date: dateStr, label, studyMinutes: 0, sessions: 0, xpEarned: 0 })
        }

        // Fill from sessions
        sessions.forEach((s: any) => {
            const dateStr = new Date(s.created_at).toISOString().slice(0, 10)
            if (activityMap.has(dateStr)) {
                const entry = activityMap.get(dateStr)!
                entry.studyMinutes += Math.round((s.duration_seconds || 0) / 60)
                entry.sessions += 1
                entry.xpEarned += s.xp_earned || 0
            }
        })

        // Fill from course analytics events
        analyticsEvents.forEach((e: any) => {
            const dateStr = new Date(e.timestamp).toISOString().slice(0, 10)
            if (activityMap.has(dateStr)) {
                const entry = activityMap.get(dateStr)!
                entry.studyMinutes += 2 // ~2 min per course event
            }
        })

        const activityData = Array.from(activityMap.values()).map(d => ({
            name: d.label,
            studyMinutes: d.studyMinutes,
            sessions: d.sessions,
            xpEarned: d.xpEarned,
        }))

        // ─── Course Progress Pie ───
        const courseProgressData = [
            { name: "Completed", value: completedCourses, color: "#10b981" },
            { name: "In Progress", value: inProgressCourses, color: "#06b6d4" },
            { name: "Not Started", value: Math.max(0, totalCourses - completedCourses - inProgressCourses), color: "#64748b" },
        ]

        // ─── Subject Mastery (from session topics + feedback) ───
        const topicScores = new Map<string, { total: number; count: number }>()
        sessions.forEach((s: any) => {
            const topic = s.topic || 'General'
            // Normalize to category
            const cat = categorize(topic)
            if (!topicScores.has(cat)) topicScores.set(cat, { total: 0, count: 0 })
            const entry = topicScores.get(cat)!
            // Score from quality rating (1-5 → 20-100) or feedback score
            const score = s.quality_rating ? s.quality_rating * 20 : 50
            entry.total += score
            entry.count += 1
        })

        // Add course-based categories
        courses.forEach((c: any) => {
            const cat = categorize(c.title || '')
            if (!topicScores.has(cat)) topicScores.set(cat, { total: 0, count: 0 })
            const entry = topicScores.get(cat)!
            entry.total += c.status === 'completed' ? 90 : 50
            entry.count += 1
        })

        const subjectMasteryData = Array.from(topicScores.entries())
            .map(([subject, data]) => ({
                subject,
                score: Math.round(data.total / data.count),
                fullMark: 100,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)

        // Fallback if no data
        if (subjectMasteryData.length === 0) {
            subjectMasteryData.push(
                { subject: "Study", score: 0, fullMark: 100 },
                { subject: "Practice", score: 0, fullMark: 100 },
                { subject: "Review", score: 0, fullMark: 100 },
            )
        }

        // ─── Streak Heatmap (last 90 days) ───
        const heatmapStart = new Date(now)
        heatmapStart.setDate(now.getDate() - 89)

        const heatmapMap = new Map<string, number>()
        for (let i = 0; i < 90; i++) {
            const d = new Date(heatmapStart)
            d.setDate(heatmapStart.getDate() + i)
            heatmapMap.set(d.toISOString().slice(0, 10), 0)
        }

        sessions.forEach((s: any) => {
            const dateStr = new Date(s.created_at).toISOString().slice(0, 10)
            if (heatmapMap.has(dateStr)) {
                heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1)
            }
        })

        analyticsEvents.forEach((e: any) => {
            const dateStr = new Date(e.timestamp).toISOString().slice(0, 10)
            if (heatmapMap.has(dateStr)) {
                heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1)
            }
        })

        const streakHeatmap = Array.from(heatmapMap.entries()).map(([date, count]) => ({ date, count }))

        // ─── Session Performance ───
        const sessionsByWeek = new Map<string, { sessions: number; avgRating: number; xp: number; ratings: number[] }>()
        sessions.slice(0, 50).forEach((s: any) => {
            const d = new Date(s.created_at)
            const weekStart = new Date(d)
            weekStart.setDate(d.getDate() - d.getDay())
            const weekKey = weekStart.toISOString().slice(0, 10)
            if (!sessionsByWeek.has(weekKey)) sessionsByWeek.set(weekKey, { sessions: 0, avgRating: 0, xp: 0, ratings: [] })
            const entry = sessionsByWeek.get(weekKey)!
            entry.sessions += 1
            entry.xp += s.xp_earned || 0
            if (s.quality_rating) entry.ratings.push(s.quality_rating)
        })

        const sessionStats = Array.from(sessionsByWeek.entries())
            .map(([week, data]) => ({
                week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sessions: data.sessions,
                avgRating: data.ratings.length > 0 ? Math.round(data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length * 10) / 10 : 0,
                xpEarned: data.xp,
            }))
            .sort((a, b) => a.week.localeCompare(b.week))
            .slice(-8)

        // ─── Top Session Topics ───
        const topicCount = new Map<string, number>()
        sessions.forEach((s: any) => {
            const t = s.topic || 'General'
            topicCount.set(t, (topicCount.get(t) || 0) + 1)
        })
        const topTopics = Array.from(topicCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([topic, count]) => ({ topic, count }))

        // ─── AI Insights (pattern-based) ───
        const aiInsights = generateInsights(stats, sessions, activityData, topTopics)

        // ─── Recent Achievements ───
        const recentAchievements = achievements.map((ua: any) => ({
            title: ua.achievements?.title || 'Achievement',
            description: ua.achievements?.description || '',
            icon: ua.achievements?.icon || '🏆',
            xp_reward: ua.achievements?.xp_reward || 0,
            unlockedAt: ua.unlocked_at,
        }))

        return NextResponse.json({
            stats,
            activityData,
            courseProgressData,
            subjectMasteryData,
            streakHeatmap,
            sessionStats,
            topTopics,
            aiInsights,
            recentAchievements,
        })

    } catch (error: any) {
        console.error("Analytics API Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ─── Helpers ───

/** Categorize a topic into a broad subject area */
function categorize(text: string): string {
    const lower = text.toLowerCase()
    if (/math|calcul|algebra|geometry|statistic/i.test(lower)) return 'Mathematics'
    if (/code|program|javascript|python|react|web|css|html|software|api/i.test(lower)) return 'Programming'
    if (/history|civics|politic|govern/i.test(lower)) return 'History'
    if (/science|physics|chemistry|biology|astro/i.test(lower)) return 'Science'
    if (/art|design|music|creative|draw/i.test(lower)) return 'Creative Arts'
    if (/language|english|writing|grammar|spanish|french/i.test(lower)) return 'Language'
    if (/business|market|finance|econ/i.test(lower)) return 'Business'
    if (/health|medicine|psych/i.test(lower)) return 'Health'
    return 'General Study'
}

/** Generate human-readable learning insights from aggregated data */
function generateInsights(
    stats: any,
    sessions: any[],
    activityData: any[],
    topTopics: any[]
): string[] {
    const insights: string[] = []

    // Streak insight
    if (stats.streak >= 7) {
        insights.push(`🔥 Incredible! You're on a ${stats.streak}-day streak — that's top-tier consistency.`)
    } else if (stats.streak >= 3) {
        insights.push(`🔥 You're on a ${stats.streak}-day streak! Keep pushing to hit 7 days for a bonus.`)
    } else if (stats.streak === 0) {
        insights.push('💡 Start a study session today to begin building your streak.')
    }

    // Best study day
    if (activityData.length > 0) {
        const bestDay = activityData.reduce((a, b) => a.studyMinutes > b.studyMinutes ? a : b)
        if (bestDay.studyMinutes > 0) {
            insights.push(`📊 Your most productive day was ${bestDay.name} with ${bestDay.studyMinutes} minutes of study time.`)
        }
    }

    // Session performance trend
    if (sessions.length >= 3) {
        const recentRatings = sessions.slice(0, 3).filter(s => s.quality_rating).map(s => s.quality_rating)
        if (recentRatings.length >= 2) {
            const avg = recentRatings.reduce((a: number, b: number) => a + b, 0) / recentRatings.length
            if (avg >= 4) {
                insights.push('⭐ Your recent sessions are rated excellent! Your understanding is strong.')
            } else if (avg >= 3) {
                insights.push('📈 Your session ratings are solid. Focus on challenging topics to push higher.')
            }
        }
    }

    // Top topic
    if (topTopics.length > 0) {
        insights.push(`🎯 Your most studied topic is "${topTopics[0].topic}" with ${topTopics[0].count} sessions.`)
    }

    // XP level
    if (stats.level >= 10) {
        insights.push(`🏆 Level ${stats.level} ${stats.levelTitle}! You've earned ${stats.totalXP.toLocaleString()} XP total.`)
    } else if (stats.level >= 5) {
        insights.push(`📚 Level ${stats.level} — keep studying to unlock higher-tier achievements.`)
    }

    // Focus score advice
    if (stats.focusScore >= 80) {
        insights.push('🧠 Your Focus Score is outstanding! You maintain excellent study habits.')
    } else if (stats.focusScore >= 50) {
        insights.push('💪 Good focus! Try longer, more consistent sessions to push your score above 80.')
    } else {
        insights.push('🌱 Tip: Short daily sessions are better than long sporadic ones for building lasting habits.')
    }

    // Flashcard volume
    if (stats.totalCards > 20) {
        insights.push(`🎴 You've created ${stats.totalCards} flashcards — spaced repetition is a proven study method!`)
    }

    return insights.slice(0, 6) // Cap at 6 insights
}
