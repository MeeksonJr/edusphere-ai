'use client'

import { useEffect, useState } from 'react'

interface DailyGoal {
    id: string
    label: string
    icon: string
    completed: boolean
    xpReward: number
}

interface DailyGoalsProps {
    goals?: DailyGoal[]
    totalCompleted?: number
    totalGoals?: number
}

const DEFAULT_GOALS: DailyGoal[] = [
    { id: 'login', label: 'Log in today', icon: '👋', completed: false, xpReward: 10 },
    { id: 'flashcard', label: 'Review 5 flashcards', icon: '🃏', completed: false, xpReward: 50 },
    { id: 'study', label: 'Study for 15 minutes', icon: '📖', completed: false, xpReward: 30 },
    { id: 'note', label: 'Create or edit a note', icon: '📝', completed: false, xpReward: 10 },
    { id: 'ai', label: 'Ask the AI a question', icon: '🤖', completed: false, xpReward: 10 },
]

export function DailyGoals({ goals, totalCompleted, totalGoals }: DailyGoalsProps) {
    const [animated, setAnimated] = useState(false)
    const displayGoals = goals || DEFAULT_GOALS
    const completed = totalCompleted ?? displayGoals.filter(g => g.completed).length
    const total = totalGoals ?? displayGoals.length
    const allComplete = completed >= total

    useEffect(() => {
        const timer = setTimeout(() => setAnimated(true), 200)
        return () => clearTimeout(timer)
    }, [])

    const potentialXP = displayGoals.reduce((sum, g) => sum + g.xpReward, 0)
    const earnedXP = displayGoals.filter(g => g.completed).reduce((sum, g) => sum + g.xpReward, 0)

    return (
        <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{allComplete ? '🎯' : '📋'}</span>
                    <div>
                        <div className="text-sm font-semibold">Daily Goals</div>
                        <div className="text-xs text-muted-foreground">
                            {completed}/{total} completed
                        </div>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {earnedXP}/{potentialXP} XP
                </div>
            </div>

            <div className="space-y-2">
                {displayGoals.map((goal, i) => (
                    <div
                        key={goal.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${goal.completed
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-white/5 border border-transparent hover:border-white/10'
                            }`}
                        style={{
                            opacity: animated ? 1 : 0,
                            transform: animated ? 'translateX(0)' : 'translateX(-12px)',
                            transitionDelay: `${i * 100}ms`,
                        }}
                    >
                        <span className="text-base">{goal.icon}</span>
                        <span className={`flex-1 text-sm ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {goal.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-amber-400">+{goal.xpReward}</span>
                            {goal.completed ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-white/20" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {allComplete && (
                <div className="mt-3 p-2 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-center">
                    <span className="text-sm font-medium text-emerald-400">
                        🎉 All goals for today completed!
                    </span>
                </div>
            )}
        </div>
    )
}
