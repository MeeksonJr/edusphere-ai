import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { awardXP } from "@/lib/gamification"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Define possible daily challenge pools (Must match daily_challenges_challenge_type_check constraint)
const CHALLENGE_POOL = [
    { type: "flashcard_review", title: "Review 20 Flashcards", target: 20, xp: 30, desc: "Test your memory with flashcards." },
    { type: "study_time", title: "Complete 2 Focus Sessions", target: 2, xp: 30, desc: "Stay focused with Pomodoro." },
    { type: "note_create", title: "Write 3 Study Notes", target: 3, xp: 30, desc: "Summarize your learnings." },
    { type: "quiz_complete", title: "Complete a Quiz", target: 1, xp: 30, desc: "Check your understanding." },
    { type: "resource_add", title: "Save 3 Bookmarks", target: 3, xp: 30, desc: "Gather useful resources." },
    { type: "course_progress", title: "Complete 1 Course Chapter", target: 1, xp: 10, desc: "Consistency is key." },
]

/**
 * Helper to get a date string in YYYY-MM-DD for local time
 */
function getLocalDateString() {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split("T")[0];
}

/**
 * GET /api/daily-challenges
 * Fetch today's challenges. Auto-generates them if they don't exist.
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const todayDate = getLocalDateString()

        // Check if user already has challenges for today
        const { data: existingChallenges, error: fetchErr } = await (supabase
            .from("daily_challenges") as any)
            .select("*")
            .eq("user_id", user.id)
            .eq("challenge_date", todayDate)

        if (fetchErr) throw fetchErr

        if (existingChallenges && existingChallenges.length > 0) {
            return NextResponse.json({ challenges: existingChallenges })
        }

        // Generate new challenges for today
        // Pick 3 random challenges from the pool
        const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5).slice(0, 3)
        const newChallengesToInsert = shuffled.map(c => ({
            user_id: user.id,
            challenge_date: todayDate,
            challenge_type: c.type,
            title: c.title,
            description: c.desc,
            target_value: c.target,
            current_value: 0,
            completed: false,
            xp_reward: c.xp,
        }))

        const { data: newChallenges, error: insertErr } = await (supabase
            .from("daily_challenges") as any)
            .insert(newChallengesToInsert)
            .select("*")

        if (insertErr) throw insertErr

        return NextResponse.json({ challenges: newChallenges })
    } catch (error: any) {
        console.error("Daily Challenges GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/daily-challenges
 * Increment progress or mark a challenge as completed
 * Body: { challenge_id: string, increment?: number }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { challenge_id, increment = 1 } = await request.json()
        if (!challenge_id) return NextResponse.json({ error: "challenge_id is required" }, { status: 400 })

        // Fetch current challenge state
        const { data: challenge, error: getErr } = await (supabase
            .from("daily_challenges") as any)
            .select("*")
            .eq("id", challenge_id)
            .eq("user_id", user.id)
            .single()

        if (getErr || !challenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
        }

        if (challenge.completed) {
            return NextResponse.json({ message: "Challenge already completed", challenge })
        }

        // Update progress
        let newValue = challenge.current_value + increment
        let isCompleted = false
        let completedAt = null
        let xpResult = null
        let bonusXpResult = null

        if (newValue >= challenge.target_value) {
            newValue = challenge.target_value
            isCompleted = true
            completedAt = new Date().toISOString()
        }

        const { data: updatedChallenge, error: updateErr } = await (supabase
            .from("daily_challenges") as any)
            .update({
                current_value: newValue,
                completed: isCompleted,
                completed_at: completedAt
            })
            .eq("id", challenge_id)
            .select()
            .single()

        if (updateErr) throw updateErr

        if (isCompleted) {
            // Award XP for this specific challenge
            xpResult = await awardXP(
                supabase,
                user.id,
                "daily_challenge_complete",
                challenge.id,
                `Completed daily challenge: ${challenge.title}`,
                challenge.xp_reward
            )

            // Check if ALL daily challenges for today are now completed
            const todayDate = getLocalDateString()
            const { data: allToday } = await (supabase
                .from("daily_challenges") as any)
                .select("*")
                .eq("user_id", user.id)
                .eq("challenge_date", todayDate)

            // allToday shouldn't be null but check just in case
            if (allToday && allToday.every((c: any) => c.completed)) {
                bonusXpResult = await awardXP(
                    supabase,
                    user.id,
                    "all_challenges_complete",
                    todayDate,
                    "Completed all daily challenges bonus!",
                    75
                )
            }
        }

        return NextResponse.json({
            challenge: updatedChallenge,
            xp: xpResult ? {
                awarded: xpResult.xpAwarded,
                newTotal: xpResult.newTotalXP,
                newLevel: xpResult.newLevel,
                leveledUp: xpResult.leveledUp,
            } : null,
            bonusXp: bonusXpResult ? {
                awarded: bonusXpResult.xpAwarded,
            } : null
        })
    } catch (error: any) {
        console.error("Daily Challenges POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
