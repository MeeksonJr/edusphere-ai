/**
 * EduSphere AI — Gamification Engine
 * 
 * Core XP, leveling, streak, and achievement system.
 * Designed for cross-feature integration: every user action feeds into XP,
 * which feeds into levels, which unlock achievements, which trigger notifications.
 */

// ═══════════════════════════════════════════
// XP CONSTANTS
// ═══════════════════════════════════════════

export const XP_REWARDS = {
    // Learning
    flashcard_review: 10,
    flashcard_set_complete: 50,
    quiz_answer_correct: 15,
    quiz_answer_wrong: 5,    // still get some XP for trying
    quiz_perfect_score: 100,

    // Courses
    course_start: 25,
    course_slide_complete: 10,
    course_complete: 200,
    course_create: 150,

    // Live Sessions
    live_session_5min: 50,
    live_session_15min: 100,
    live_session_30min: 200,

    // Skills
    skill_practice: 20,
    skill_level_up: 75,
    skill_mastery: 500,

    // Content Creation
    note_create: 10,
    note_long_form: 25,  // 500+ words
    assignment_complete: 50,
    study_plan_create: 30,

    // Engagement
    daily_login: 10,
    streak_3day_bonus: 50,
    streak_7day_bonus: 100,
    streak_30day_bonus: 500,

    // Achievements
    achievement_unlock: 0, // XP comes from achievement itself
} as const

export type XPSource = keyof typeof XP_REWARDS

// ═══════════════════════════════════════════
// LEVEL CALCULATION
// ═══════════════════════════════════════════

/**
 * Logarithmic leveling curve:
 * Level 1:  0 XP
 * Level 2:  100 XP
 * Level 5:  1,000 XP
 * Level 10: 5,000 XP
 * Level 20: 20,000 XP
 * Level 50: 100,000 XP
 * Level 100: 500,000 XP
 */
export function calculateLevel(totalXP: number): number {
    if (totalXP <= 0) return 1
    // Formula: level = floor(1 + sqrt(totalXP / 50))
    return Math.floor(1 + Math.sqrt(totalXP / 50))
}

export function xpForLevel(level: number): number {
    if (level <= 1) return 0
    return Math.floor(50 * Math.pow(level - 1, 2))
}

export function xpToNextLevel(totalXP: number): { current: number; needed: number; progress: number } {
    const currentLevel = calculateLevel(totalXP)
    const currentLevelXP = xpForLevel(currentLevel)
    const nextLevelXP = xpForLevel(currentLevel + 1)
    const progressXP = totalXP - currentLevelXP
    const neededXP = nextLevelXP - currentLevelXP

    return {
        current: progressXP,
        needed: neededXP,
        progress: neededXP > 0 ? Math.min((progressXP / neededXP) * 100, 100) : 100,
    }
}

export function getLevelTitle(level: number): string {
    if (level >= 80) return 'Grandmaster'
    if (level >= 60) return 'Professor'
    if (level >= 45) return 'Expert'
    if (level >= 30) return 'Scholar'
    if (level >= 20) return 'Advanced'
    if (level >= 10) return 'Intermediate'
    if (level >= 5) return 'Apprentice'
    return 'Beginner'
}

export function getLevelColor(level: number): string {
    if (level >= 80) return '#fbbf24' // gold
    if (level >= 60) return '#a855f7' // purple
    if (level >= 45) return '#ec4899' // pink
    if (level >= 30) return '#f97316' // orange
    if (level >= 20) return '#06b6d4' // cyan
    if (level >= 10) return '#10b981' // emerald
    if (level >= 5) return '#3b82f6' // blue
    return '#6b7280' // gray
}

// ═══════════════════════════════════════════
// STREAK MANAGEMENT
// ═══════════════════════════════════════════

export function calculateStreak(lastActivityDate: string | null, currentStreak: number): {
    newStreak: number
    streakMaintained: boolean
    streakBroken: boolean
    isNewDay: boolean
} {
    if (!lastActivityDate) {
        return { newStreak: 1, streakMaintained: false, streakBroken: false, isNewDay: true }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastDate = new Date(lastActivityDate)
    lastDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        // Same day — streak maintained but not a new day
        return { newStreak: currentStreak, streakMaintained: true, streakBroken: false, isNewDay: false }
    }

    if (diffDays === 1) {
        // Consecutive day — increment streak
        return { newStreak: currentStreak + 1, streakMaintained: true, streakBroken: false, isNewDay: true }
    }

    // Streak broken (more than 1 day gap)
    return { newStreak: 1, streakMaintained: false, streakBroken: true, isNewDay: true }
}

export function getStreakMilestone(streak: number): number | null {
    const milestones = [3, 7, 14, 30, 60, 100, 365]
    return milestones.find(m => m === streak) || null
}

// ═══════════════════════════════════════════
// ACHIEVEMENT EVALUATION
// ═══════════════════════════════════════════

export interface AchievementCheck {
    requirement_type: string
    requirement_value: number
}

export function evaluateAchievement(
    achievement: AchievementCheck,
    userStats: Record<string, number>
): { met: boolean; progress: number } {
    const currentValue = userStats[achievement.requirement_type] || 0
    const progress = Math.min(Math.floor((currentValue / achievement.requirement_value) * 100), 100)
    return {
        met: currentValue >= achievement.requirement_value,
        progress,
    }
}

// ═══════════════════════════════════════════
// SERVER-SIDE XP AWARD FUNCTION
// ═══════════════════════════════════════════

export async function awardXP(
    supabase: any,
    userId: string,
    source: XPSource,
    sourceId?: string,
    description?: string,
    customAmount?: number
): Promise<{
    xpAwarded: number
    newTotalXP: number
    newLevel: number
    leveledUp: boolean
    newStreak: number
    achievementsUnlocked: string[]
}> {
    const xpAmount = customAmount ?? XP_REWARDS[source]

    // 1. Get current streak data
    const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (!streakData) {
        // Create streak record if not exists
        await supabase.from('user_streaks').insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            total_xp: 0,
            level: 1,
        })
    }

    const currentTotalXP = streakData?.total_xp || 0
    const currentLevel = streakData?.level || 1
    const currentStreak = streakData?.current_streak || 0

    // 2. Calculate streak
    const streakResult = calculateStreak(
        streakData?.last_activity_date,
        currentStreak
    )

    // 3. Calculate total XP with streak bonus
    let bonusXP = 0
    const milestone = getStreakMilestone(streakResult.newStreak)
    if (milestone && streakResult.isNewDay) {
        bonusXP = milestone === 3 ? 50 : milestone === 7 ? 100 : milestone === 30 ? 500 : 0
    }

    const totalXPAwarded = xpAmount + bonusXP
    const newTotalXP = currentTotalXP + totalXPAwarded
    const newLevel = calculateLevel(newTotalXP)
    const leveledUp = newLevel > currentLevel

    // 4. Record XP in history
    await supabase.from('xp_history').insert({
        user_id: userId,
        amount: totalXPAwarded,
        source: source.includes('_') ? source.split('_').slice(0, -1).join('_') || source : source,
        source_id: sourceId,
        description: description || `Earned ${totalXPAwarded} XP from ${source}`,
    })

    // 5. Update streak record
    const today = new Date().toISOString().split('T')[0]
    await supabase
        .from('user_streaks')
        .upsert({
            user_id: userId,
            current_streak: streakResult.newStreak,
            longest_streak: Math.max(streakResult.newStreak, streakData?.longest_streak || 0),
            last_activity_date: today,
            total_xp: newTotalXP,
            level: newLevel,
            daily_xp_today: streakResult.isNewDay ? totalXPAwarded : (streakData?.daily_xp_today || 0) + totalXPAwarded,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

    // 6. Update profile
    await supabase
        .from('profiles')
        .update({
            total_xp: newTotalXP,
            level: newLevel,
            current_streak: streakResult.newStreak,
            longest_streak: Math.max(streakResult.newStreak, streakData?.longest_streak || 0),
            last_active_at: new Date().toISOString(),
        })
        .eq('id', userId)

    // 7. Check achievements
    const achievementsUnlocked: string[] = []
    const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')

    const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId)

    const unlockedIds = new Set((userAchievements || []).filter((a: any) => a.unlocked_at).map((a: any) => a.achievement_id))

    // Build user stats for evaluation
    const userStats: Record<string, number> = {
        xp_total: newTotalXP,
        streak_days: streakResult.newStreak,
    }

    for (const achievement of (allAchievements || [])) {
        if (unlockedIds.has(achievement.id)) continue

        const result = evaluateAchievement(achievement, userStats)
        if (result.met) {
            // Unlock achievement
            await supabase.from('user_achievements').upsert({
                user_id: userId,
                achievement_id: achievement.id,
                progress: 100,
                unlocked_at: new Date().toISOString(),
            }, { onConflict: 'user_id,achievement_id' })

            // Award achievement XP
            if (achievement.xp_reward > 0) {
                await supabase.from('xp_history').insert({
                    user_id: userId,
                    amount: achievement.xp_reward,
                    source: 'achievement',
                    source_id: achievement.id,
                    description: `Achievement unlocked: ${achievement.name}`,
                })
                // Update total XP silently (don't recurse)
                await supabase
                    .from('user_streaks')
                    .update({ total_xp: newTotalXP + achievement.xp_reward })
                    .eq('user_id', userId)
            }

            // Create notification
            await supabase.from('notifications').insert({
                user_id: userId,
                type: 'achievement',
                title: `🏆 Achievement Unlocked!`,
                message: `${achievement.icon} ${achievement.name} — ${achievement.description}`,
                data: { achievement_id: achievement.id, rarity: achievement.rarity, xp_reward: achievement.xp_reward },
                icon: achievement.icon,
                action_url: '/dashboard',
            })

            achievementsUnlocked.push(achievement.name)
        } else {
            // Update progress
            await supabase.from('user_achievements').upsert({
                user_id: userId,
                achievement_id: achievement.id,
                progress: result.progress,
            }, { onConflict: 'user_id,achievement_id' })
        }
    }

    // 8. Level-up notification
    if (leveledUp) {
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'level_up',
            title: `🎉 Level Up!`,
            message: `You reached Level ${newLevel}! Title: ${getLevelTitle(newLevel)}`,
            data: { old_level: currentLevel, new_level: newLevel, title: getLevelTitle(newLevel) },
            icon: '⬆️',
            action_url: '/dashboard',
        })
    }

    return {
        xpAwarded: totalXPAwarded,
        newTotalXP,
        newLevel,
        leveledUp,
        newStreak: streakResult.newStreak,
        achievementsUnlocked,
    }
}
