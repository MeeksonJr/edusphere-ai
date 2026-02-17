'use client'

import { useEffect, useState } from 'react'

interface StreakWidgetProps {
    currentStreak: number
    longestStreak: number
    lastActivityDate: string | null
    weeklyXP?: number[]
    dailyXPToday?: number
    dailyGoalXP?: number
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function StreakWidget({
    currentStreak,
    longestStreak,
    lastActivityDate,
    weeklyXP = [],
    dailyXPToday = 0,
    dailyGoalXP = 100,
}: StreakWidgetProps) {
    const [animated, setAnimated] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 200)
        return () => clearTimeout(timer)
    }, [])

    // Calculate which days of the past 7 days had activity
    const today = new Date()
    const dayGrid = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - (6 - i))
        const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
        const hasActivity = weeklyXP[i] ? weeklyXP[i] > 0 : false
        const isToday = i === 6
        return { dayName, hasActivity, isToday, xp: weeklyXP[i] || 0 }
    })

    const dailyProgress = dailyGoalXP > 0 ? Math.min((dailyXPToday / dailyGoalXP) * 100, 100) : 0
    const streakActive = currentStreak > 0

    return (
        <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`text-2xl ${streakActive ? 'animate-bounce-subtle' : ''}`}>
                        {streakActive ? '🔥' : '❄️'}
                    </div>
                    <div>
                        <div className="text-sm font-semibold">
                            {currentStreak} Day Streak
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Best: {longestStreak} days
                        </div>
                    </div>
                </div>
                {streakActive && currentStreak >= 7 && (
                    <div className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                        🔥 On Fire!
                    </div>
                )}
            </div>

            {/* 7-Day Grid */}
            <div className="flex items-center justify-between gap-1 mb-3">
                {dayGrid.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-500 ${day.isToday
                                    ? 'border-2 border-cyan-500 shadow-lg shadow-cyan-500/20'
                                    : ''
                                } ${day.hasActivity || day.isToday
                                    ? 'bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 text-emerald-400'
                                    : 'bg-white/5 text-muted-foreground'
                                }`}
                            style={{
                                transform: animated ? 'scale(1)' : 'scale(0)',
                                transitionDelay: `${i * 75}ms`,
                            }}
                        >
                            {day.hasActivity || day.isToday ? '✓' : '·'}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{day.dayName}</span>
                    </div>
                ))}
            </div>

            {/* Daily Goal Progress */}
            <div>
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Daily Goal</span>
                    <span className="font-medium">
                        {dailyXPToday}/{dailyGoalXP} XP
                    </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${animated ? dailyProgress : 0}%`,
                            background: dailyProgress >= 100
                                ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                                : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        }}
                    />
                </div>
                {dailyProgress >= 100 && (
                    <div className="mt-1 text-xs text-emerald-400 font-medium">
                        ✨ Daily goal complete!
                    </div>
                )}
            </div>

            {/* Motivational text */}
            <div className="mt-3 text-xs text-center text-muted-foreground italic">
                {currentStreak === 0 && "Start your streak today!"}
                {currentStreak >= 1 && currentStreak < 3 && "Keep going! You're building momentum."}
                {currentStreak >= 3 && currentStreak < 7 && "Great consistency! A week is in sight."}
                {currentStreak >= 7 && currentStreak < 30 && "Incredible dedication! You're unstoppable."}
                {currentStreak >= 30 && "🏆 You're a legend. Don't break the chain!"}
            </div>
        </div>
    )
}
