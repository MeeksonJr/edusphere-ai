'use client'

import { useEffect, useState } from 'react'
import { xpToNextLevel, getLevelTitle, getLevelColor } from '@/lib/gamification'

interface XPProgressBarProps {
    totalXP: number
    level: number
    compact?: boolean
    showLevelUp?: boolean
}

export function XPProgressBar({ totalXP, level, compact = false, showLevelUp = false }: XPProgressBarProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0)
    const [showLevelUpEffect, setShowLevelUpEffect] = useState(false)
    const { current, needed, progress } = xpToNextLevel(totalXP)
    const title = getLevelTitle(level)
    const color = getLevelColor(level)

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 100)
        return () => clearTimeout(timer)
    }, [progress])

    useEffect(() => {
        if (showLevelUp) {
            setShowLevelUpEffect(true)
            const timer = setTimeout(() => setShowLevelUpEffect(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showLevelUp])

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2"
                    style={{ borderColor: color, color: color }}
                >
                    {level}
                </div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                            width: `${animatedProgress}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        }}
                    />
                </div>
                <span className="text-xs text-muted-foreground">{current}/{needed}</span>
            </div>
        )
    }

    return (
        <div className="relative">
            {showLevelUpEffect && (
                <div className="absolute inset-0 z-10 flex items-center justify-center animate-level-up-burst">
                    <div className="text-4xl font-bold" style={{ color }}>
                        ⬆️ Level {level}!
                    </div>
                </div>
            )}

            <div className="glass-card p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="relative flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold border-2 shadow-lg"
                            style={{
                                borderColor: color,
                                color: color,
                                boxShadow: `0 0 20px ${color}33`,
                            }}
                        >
                            {level}
                            <div
                                className="absolute -inset-1 rounded-full animate-pulse opacity-20"
                                style={{ background: color }}
                            />
                        </div>
                        <div>
                            <div className="text-sm font-semibold" style={{ color }}>
                                {title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Level {level}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-mono font-bold text-foreground">
                            {totalXP.toLocaleString()} XP
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {current.toLocaleString()} / {needed.toLocaleString()} to next
                        </div>
                    </div>
                </div>

                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1500 ease-out"
                        style={{
                            width: `${animatedProgress}%`,
                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                            boxShadow: `0 0 12px ${color}66`,
                        }}
                    />
                    <div
                        className="absolute inset-y-0 left-0 rounded-full animate-shimmer"
                        style={{
                            width: `${animatedProgress}%`,
                            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                            backgroundSize: '200% 100%',
                        }}
                    />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% to Level {level + 1}</span>
                    <span>{(needed - current).toLocaleString()} XP needed</span>
                </div>
            </div>
        </div>
    )
}
