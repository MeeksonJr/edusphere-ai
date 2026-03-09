import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { awardXP } from "@/lib/gamification"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/pomodoro
 * Fetch user's study session history
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get("limit") || "10")

        const { data: sessions, error } = await (supabase
            .from("study_sessions") as any)
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit)

        if (error) throw error

        // Get today's stats
        const today = new Date().toISOString().split("T")[0]
        const { data: todaySessions } = await (supabase
            .from("study_sessions") as any)
            .select("duration_minutes, xp_earned")
            .eq("user_id", user.id)
            .eq("completed", true)
            .gte("created_at", `${today}T00:00:00`)

        const todayStats = {
            sessions: todaySessions?.length || 0,
            totalMinutes: todaySessions?.reduce((sum: number, s: any) => sum + s.duration_minutes, 0) || 0,
            totalXP: todaySessions?.reduce((sum: number, s: any) => sum + s.xp_earned, 0) || 0,
        }

        return NextResponse.json({ sessions: sessions || [], todayStats })
    } catch (error: any) {
        console.error("Pomodoro GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/pomodoro
 * Record a completed Pomodoro session and award XP
 * Body: { duration_minutes: number, session_type: "work" | "short_break" | "long_break", notes?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { duration_minutes, session_type, notes } = await request.json()

        if (!duration_minutes || !session_type) {
            return NextResponse.json({ error: "duration_minutes and session_type are required" }, { status: 400 })
        }

        // Only award XP for work sessions
        let xpResult = null
        if (session_type === "work") {
            xpResult = await awardXP(
                supabase,
                user.id,
                "pomodoro_complete",
                undefined,
                `Completed ${duration_minutes}min Pomodoro session`
            )
        }

        const xpEarned = xpResult?.xpAwarded || 0

        // Record session
        const { data: session, error } = await (supabase
            .from("study_sessions") as any)
            .insert({
                user_id: user.id,
                session_type,
                duration_minutes,
                started_at: new Date(Date.now() - duration_minutes * 60000).toISOString(),
                completed_at: new Date().toISOString(),
                completed: true,
                xp_earned: xpEarned,
                notes: notes || null,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({
            session,
            xp: xpResult ? {
                awarded: xpResult.xpAwarded,
                newTotal: xpResult.newTotalXP,
                newLevel: xpResult.newLevel,
                leveledUp: xpResult.leveledUp,
            } : null,
        })
    } catch (error: any) {
        console.error("Pomodoro POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
