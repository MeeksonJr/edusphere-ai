'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Circle, Zap, Trophy, TrendingUp } from 'lucide-react'

interface DailyChallenge {
    id: string
    challenge_type: string
    title: string
    description: string
    target_value: number
    current_value: number
    completed: boolean
    xp_reward: number
}

// Map types to emojis/icons
const ICONS: Record<string, string> = {
    flashcard_review: '🃏',
    pomodoro_session: '🍅',
    note_taking: '📝',
    quiz_attempt: '🧠',
    add_bookmarks: '🔖',
    daily_login: '👋',
}

export function DailyGoals() {
    const [challenges, setChallenges] = useState<DailyChallenge[]>([])
    const [loading, setLoading] = useState(true)
    const [animated, setAnimated] = useState(false)
    const [justCompletedId, setJustCompletedId] = useState<string | null>(null)

    const fetchChallenges = useCallback(async () => {
        try {
            const res = await fetch('/api/daily-challenges')
            if (res.ok) {
                const data = await res.json()
                setChallenges(data.challenges || [])
            }
        } catch (e) {
            console.error("Failed to fetch daily challenges", e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchChallenges()
        const timer = setTimeout(() => setAnimated(true), 200)
        return () => clearTimeout(timer)
    }, [fetchChallenges])

    const handleAdvanceProgress = async (challengeId: string) => {
        // Optimistic UI
        const currentChal = challenges.find(c => c.id === challengeId);
        if (currentChal && !currentChal.completed) {
            const isNowCompleted = currentChal.current_value + 1 >= currentChal.target_value;

            setChallenges(prev => prev.map(c => {
                if (c.id === challengeId) {
                    return {
                        ...c,
                        current_value: Math.min(c.current_value + 1, c.target_value),
                        completed: isNowCompleted
                    }
                }
                return c
            }))

            if (isNowCompleted) {
                setJustCompletedId(challengeId)
                setTimeout(() => setJustCompletedId(null), 3000)
            }
        }

        try {
            const res = await fetch('/api/daily-challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: challengeId, increment: 1 })
            })
            if (!res.ok) {
                // Revert or refresh on failure
                fetchChallenges()
            }
        } catch (e) {
            fetchChallenges()
        }
    }

    if (loading && challenges.length === 0) {
        return (
            <div className="glass-card p-4 rounded-xl border border-white/10 animate-pulse">
                <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-12 w-full bg-white/5 rounded-lg"></div>
                    <div className="h-12 w-full bg-white/5 rounded-lg"></div>
                    <div className="h-12 w-full bg-white/5 rounded-lg"></div>
                </div>
            </div>
        )
    }

    const completed = challenges.filter(c => c.completed).length
    const total = challenges.length
    const allComplete = total > 0 && completed >= total

    const potentialXP = challenges.reduce((sum, c) => sum + c.xp_reward, 0)
    const earnedXP = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xp_reward, 0)

    return (
        <div className="glass-card p-5 rounded-2xl border border-white/10 shadow-xl shadow-black/20 overflow-hidden relative">
            {/* Background glowing sweep */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 opacity-50" />

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl flex items-center justify-center ${allComplete ? 'bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5'}`}>
                        {allComplete ? <Trophy className="h-5 w-5 text-emerald-400" /> : <TrendingUp className="h-5 w-5 text-purple-400" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Daily Quests</h3>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className={completed > 0 ? "text-purple-300 font-medium" : ""}>
                                {completed}/{total}
                            </span>
                            done today
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full text-white flex items-center gap-1.5 border border-white/5">
                        <Zap className="h-3.5 w-3.5 text-yellow-400" />
                        {earnedXP} <span className="text-gray-400 opacity-70">/ {potentialXP} XP</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {challenges.map((challenge, i) => {
                    const progress = Math.min((challenge.current_value / challenge.target_value) * 100, 100)
                    const isJustCompleted = justCompletedId === challenge.id

                    return (
                        <div
                            key={challenge.id}
                            className={`group flex flex-col gap-2 p-3 rounded-xl transition-all duration-500 ${challenge.completed
                                ? 'bg-emerald-500/10 border-emerald-500/20 opacity-80'
                                : isJustCompleted
                                    ? 'bg-emerald-500/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 z-10'
                                    : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1]'
                                } border`}
                            style={{
                                opacity: animated && !challenge.completed ? 1 : animated && challenge.completed ? 0.8 : 0,
                                transform: animated ? 'translateY(0)' : 'translateY(10px)',
                                transitionDelay: `${i * 100}ms`,
                            }}
                        >
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleAdvanceProgress(challenge.id)}>
                                <span className="text-lg bg-black/20 p-1.5 rounded-lg">
                                    {ICONS[challenge.challenge_type] || '🎯'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-semibold truncate transition-colors ${challenge.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>
                                        {challenge.title}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate mt-0.5">
                                        {challenge.description}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <div className={`text-xs font-bold ${challenge.completed ? 'text-emerald-500' : 'text-purple-400'}`}>
                                        +{challenge.xp_reward} XP
                                    </div>
                                    {challenge.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                                    )}
                                </div>
                            </div>

                            {/* Progress bar for multi-step tasks */}
                            {challenge.target_value > 1 && !challenge.completed && (
                                <div className="w-full mt-1">
                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-medium px-0.5">
                                        <span>Progress</span>
                                        <span className="text-gray-400">{challenge.current_value} / {challenge.target_value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {allComplete && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 text-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300 flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-400" />
                        All quests completed!
                    </span>
                    <span className="block text-xs text-emerald-400/80 mt-1 font-medium">
                        +75 XP Completion Bonus Awarded
                    </span>
                </div>
            )}
        </div>
    )
}

