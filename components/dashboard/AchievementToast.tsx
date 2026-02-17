'use client'

import { useEffect, useState } from 'react'

interface AchievementToastProps {
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    xpReward: number
    onClose: () => void
}

const RARITY_STYLES = {
    common: {
        gradient: 'from-gray-500/20 to-slate-500/20',
        border: 'border-gray-500/40',
        glow: '',
        text: 'text-gray-300',
        label: 'Common',
        labelBg: 'bg-gray-500/20',
    },
    rare: {
        gradient: 'from-blue-500/20 to-cyan-500/20',
        border: 'border-blue-500/40',
        glow: 'shadow-lg shadow-blue-500/20',
        text: 'text-blue-400',
        label: 'Rare',
        labelBg: 'bg-blue-500/20',
    },
    epic: {
        gradient: 'from-purple-500/20 to-pink-500/20',
        border: 'border-purple-500/40',
        glow: 'shadow-xl shadow-purple-500/30',
        text: 'text-purple-400',
        label: 'Epic',
        labelBg: 'bg-purple-500/20',
    },
    legendary: {
        gradient: 'from-amber-500/20 to-yellow-500/20',
        border: 'border-amber-500/40',
        glow: 'shadow-2xl shadow-amber-500/40',
        text: 'text-amber-400',
        label: 'Legendary',
        labelBg: 'bg-amber-500/20',
    },
}

export function AchievementToast({ name, description, icon, rarity, xpReward, onClose }: AchievementToastProps) {
    const [visible, setVisible] = useState(false)
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
    const styles = RARITY_STYLES[rarity]

    useEffect(() => {
        // Generate confetti particles for epic/legendary
        if (rarity === 'epic' || rarity === 'legendary') {
            setParticles(
                Array.from({ length: 20 }, (_, i) => ({
                    id: i,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    delay: Math.random() * 0.5,
                }))
            )
        }

        setTimeout(() => setVisible(true), 50)
        const autoClose = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 500)
        }, 5000)
        return () => clearTimeout(autoClose)
    }, [onClose, rarity])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            {/* Overlay for legendary */}
            {rarity === 'legendary' && (
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
            )}

            {/* Particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-full animate-confetti"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        background: rarity === 'legendary' ? '#fbbf24' : '#a855f7',
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}

            {/* Achievement card */}
            <div
                className={`pointer-events-auto transform transition-all duration-500 ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
                    }`}
            >
                <div
                    className={`relative bg-gradient-to-br ${styles.gradient} backdrop-blur-xl border ${styles.border} ${styles.glow} rounded-2xl p-6 max-w-sm cursor-pointer`}
                    onClick={() => {
                        setVisible(false)
                        setTimeout(onClose, 500)
                    }}
                >
                    {/* Rarity label */}
                    <div className={`absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold ${styles.labelBg} ${styles.text} border ${styles.border}`}>
                        {styles.label}
                    </div>

                    {/* Header */}
                    <div className="text-center mb-3 mt-2">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                            Achievement Unlocked
                        </div>
                        <div className="text-4xl mb-2 animate-bounce-subtle">{icon}</div>
                        <h3 className={`text-lg font-bold ${styles.text}`}>{name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    </div>

                    {/* XP Reward */}
                    <div className="flex items-center justify-center gap-2 mt-3 py-2 rounded-lg bg-white/5">
                        <span className="text-amber-400 text-sm">⭐</span>
                        <span className="text-sm font-bold text-amber-400">+{xpReward} XP</span>
                    </div>

                    <div className="text-xs text-center text-muted-foreground mt-2">
                        Click to dismiss
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════
// Achievement Queue Manager (for multiple unlocks)
// ═══════════════════════════════════════════

interface Achievement {
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    xpReward: number
}

export function AchievementQueue({ achievements, onDone }: { achievements: Achievement[]; onDone: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (currentIndex >= achievements.length) {
        onDone()
        return null
    }

    const current = achievements[currentIndex]
    return (
        <AchievementToast
            key={currentIndex}
            name={current.name}
            description={current.description}
            icon={current.icon}
            rarity={current.rarity}
            xpReward={current.xpReward}
            onClose={() => setCurrentIndex(prev => prev + 1)}
        />
    )
}
