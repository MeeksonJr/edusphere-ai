"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Timer, Play, Pause, RotateCcw, SkipForward, Volume2, VolumeX, Coffee, Brain, Flame, Trophy, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const TIMER_PRESETS = {
    work: { label: "Focus", duration: 25 * 60, color: "#8b5cf6", icon: Brain },
    short_break: { label: "Short Break", duration: 5 * 60, color: "#10b981", icon: Coffee },
    long_break: { label: "Long Break", duration: 15 * 60, color: "#06b6d4", icon: Coffee },
} as const

type SessionType = keyof typeof TIMER_PRESETS

const AMBIENT_SOUNDS = [
    { id: "none", label: "None", emoji: "🔇" },
    { id: "rain", label: "Rain", emoji: "🌧️" },
    { id: "fire", label: "Fireplace", emoji: "🔥" },
    { id: "forest", label: "Forest", emoji: "🌲" },
    { id: "waves", label: "Ocean", emoji: "🌊" },
]

// Free ambient sound URLs (royalty-free)
const SOUND_URLS: Record<string, string> = {
    rain: "https://cdn.pixabay.com/audio/2022/10/30/audio_946de1e40d.mp3",
    fire: "https://cdn.pixabay.com/audio/2024/11/04/audio_3339a34ad1.mp3",
    forest: "https://cdn.pixabay.com/audio/2022/08/31/audio_419263ef59.mp3",
    waves: "https://cdn.pixabay.com/audio/2022/05/31/audio_5eb5e31f9f.mp3",
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function PomodoroPage() {
    const { supabase } = useSupabase()

    // Timer state
    const [sessionType, setSessionType] = useState<SessionType>("work")
    const [timeRemaining, setTimeRemaining] = useState(TIMER_PRESETS.work.duration)
    const [isRunning, setIsRunning] = useState(false)
    const [sessionCount, setSessionCount] = useState(0)
    const [sessionsBeforeLongBreak] = useState(4)

    // Sound state
    const [activeSound, setActiveSound] = useState("none")
    const [soundVolume, setSoundVolume] = useState(0.3)
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Data state
    const [sessions, setSessions] = useState<any[]>([])
    const [todayStats, setTodayStats] = useState({ sessions: 0, totalMinutes: 0, totalXP: 0 })
    const [xpReward, setXpReward] = useState<{ awarded: number; leveledUp: boolean; newLevel: number } | null>(null)
    const [loading, setLoading] = useState(true)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const totalDuration = TIMER_PRESETS[sessionType].duration

    // ───────────────────────────────────────
    // FETCH SESSION HISTORY
    // ───────────────────────────────────────

    useEffect(() => {
        async function fetchSessions() {
            try {
                const res = await fetch("/api/pomodoro?limit=10")
                if (res.ok) {
                    const data = await res.json()
                    setSessions(data.sessions || [])
                    setTodayStats(data.todayStats || { sessions: 0, totalMinutes: 0, totalXP: 0 })
                }
            } catch (e) {
                console.error("Failed to fetch sessions:", e)
            } finally {
                setLoading(false)
            }
        }
        fetchSessions()
    }, [])

    // ───────────────────────────────────────
    // TIMER LOGIC
    // ───────────────────────────────────────

    const handleComplete = useCallback(async () => {
        setIsRunning(false)
        if (intervalRef.current) clearInterval(intervalRef.current)

        const duration = Math.round(totalDuration / 60)

        try {
            const res = await fetch("/api/pomodoro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    duration_minutes: duration,
                    session_type: sessionType,
                }),
            })

            if (res.ok) {
                const data = await res.json()
                if (data.xp) {
                    setXpReward({
                        awarded: data.xp.awarded,
                        leveledUp: data.xp.leveledUp,
                        newLevel: data.xp.newLevel,
                    })
                    setTimeout(() => setXpReward(null), 5000)
                }

                // Refresh sessions
                const sessRes = await fetch("/api/pomodoro?limit=10")
                if (sessRes.ok) {
                    const sessData = await sessRes.json()
                    setSessions(sessData.sessions || [])
                    setTodayStats(sessData.todayStats)
                }
            }
        } catch (e) {
            console.error("Failed to record session:", e)
        }

        // Auto-advance
        if (sessionType === "work") {
            const newCount = sessionCount + 1
            setSessionCount(newCount)
            if (newCount % sessionsBeforeLongBreak === 0) {
                switchSession("long_break")
            } else {
                switchSession("short_break")
            }
        } else {
            switchSession("work")
        }
    }, [sessionType, sessionCount, sessionsBeforeLongBreak, totalDuration])

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleComplete()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning, handleComplete])

    // ───────────────────────────────────────
    // AMBIENT SOUND
    // ───────────────────────────────────────

    useEffect(() => {
        if (activeSound === "none") {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            return
        }
        const url = SOUND_URLS[activeSound]
        if (!url) return

        if (audioRef.current) audioRef.current.pause()
        const audio = new Audio(url)
        audio.loop = true
        audio.volume = isMuted ? 0 : soundVolume
        audio.play().catch(() => { })
        audioRef.current = audio

        return () => {
            audio.pause()
        }
    }, [activeSound])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : soundVolume
        }
    }, [soundVolume, isMuted])

    // ───────────────────────────────────────
    // HELPERS
    // ───────────────────────────────────────

    function switchSession(type: SessionType) {
        setSessionType(type)
        setTimeRemaining(TIMER_PRESETS[type].duration)
        setIsRunning(false)
    }

    function toggleTimer() {
        setIsRunning(!isRunning)
    }

    function resetTimer() {
        setIsRunning(false)
        setTimeRemaining(TIMER_PRESETS[sessionType].duration)
    }

    function skipToNext() {
        if (sessionType === "work") {
            const newCount = sessionCount + 1
            setSessionCount(newCount)
            switchSession(newCount % sessionsBeforeLongBreak === 0 ? "long_break" : "short_break")
        } else {
            switchSession("work")
        }
    }

    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60
    const progress = 1 - timeRemaining / totalDuration
    const circumference = 2 * Math.PI * 140
    const strokeDashoffset = circumference * (1 - progress)
    const activeColor = TIMER_PRESETS[sessionType].color
    const ActiveIcon = TIMER_PRESETS[sessionType].icon

    // ───────────────────────────────────────
    // RENDER
    // ───────────────────────────────────────

    return (
        <div className="min-h-screen p-6 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Timer className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Pomodoro Timer</h1>
                    <p className="text-sm text-gray-400">Focus deeply, earn XP</p>
                </div>
            </div>

            {/* XP Reward Toast */}
            {xpReward && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-500">
                    <div className="bg-gradient-to-r from-purple-600/90 to-violet-600/90 backdrop-blur-lg rounded-2xl border border-purple-400/30 p-4 shadow-2xl shadow-purple-500/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-yellow-400/20">
                                <Zap className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="font-bold text-white">+{xpReward.awarded} XP earned!</p>
                                {xpReward.leveledUp && (
                                    <p className="text-sm text-purple-200">🎉 Level up! You&apos;re now Level {xpReward.newLevel}!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Timer */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Session type tabs */}
                    <div className="flex gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        {(Object.entries(TIMER_PRESETS) as [SessionType, typeof TIMER_PRESETS[SessionType]][]).map(([key, preset]) => (
                            <button
                                key={key}
                                onClick={() => { if (!isRunning) switchSession(key) }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${sessionType === key
                                    ? "bg-gray-700 text-white shadow-lg"
                                    : "text-gray-400 hover:text-gray-200"
                                    } ${isRunning && sessionType !== key ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <preset.icon className="h-4 w-4" />
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Timer Circle */}
                    <div className="flex flex-col items-center py-8">
                        <div className="relative w-80 h-80">
                            <svg viewBox="0 0 300 300" className="w-full h-full -rotate-90">
                                {/* Background ring */}
                                <circle
                                    cx="150" cy="150" r="140"
                                    fill="none" stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="8"
                                />
                                {/* Progress ring */}
                                <circle
                                    cx="150" cy="150" r="140"
                                    fill="none"
                                    stroke={activeColor}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-1000 ease-linear"
                                    style={{
                                        filter: `drop-shadow(0 0 12px ${activeColor}60)`,
                                    }}
                                />
                                {/* Glow dot at the tip */}
                                {progress > 0 && (
                                    <circle
                                        cx={150 + 140 * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
                                        cy={150 + 140 * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
                                        r="6"
                                        fill={activeColor}
                                        style={{
                                            filter: `drop-shadow(0 0 8px ${activeColor})`,
                                        }}
                                    />
                                )}
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <ActiveIcon className="h-8 w-8 mb-3" style={{ color: activeColor }} />
                                <span className="text-6xl font-mono font-bold tabular-nums tracking-wider">
                                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                                </span>
                                <span className="text-sm text-gray-400 mt-2">
                                    {TIMER_PRESETS[sessionType].label}
                                </span>
                                {sessionType === "work" && (
                                    <span className="text-xs text-gray-500 mt-1">
                                        Session {sessionCount + 1} of {sessionsBeforeLongBreak}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-4 mt-6">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full border-gray-600 hover:bg-gray-800"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                className="h-16 w-16 rounded-full shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)`,
                                    boxShadow: `0 0 30px ${activeColor}40`,
                                }}
                                onClick={toggleTimer}
                            >
                                {isRunning
                                    ? <Pause className="h-7 w-7" />
                                    : <Play className="h-7 w-7 ml-0.5" />
                                }
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-12 w-12 rounded-full border-gray-600 hover:bg-gray-800"
                                onClick={skipToNext}
                            >
                                <SkipForward className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Ambient Sounds */}
                    <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-300">Ambient Sounds</h3>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {AMBIENT_SOUNDS.map(sound => (
                                <button
                                    key={sound.id}
                                    onClick={() => setActiveSound(sound.id)}
                                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs transition-all ${activeSound === sound.id
                                        ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                                        : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-700/50"
                                        }`}
                                >
                                    <span className="text-lg">{sound.emoji}</span>
                                    {sound.label}
                                </button>
                            ))}
                        </div>
                        {activeSound !== "none" && (
                            <div className="mt-3 flex items-center gap-3">
                                <span className="text-xs text-gray-500">Volume</span>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={soundVolume}
                                    onChange={e => setSoundVolume(parseFloat(e.target.value))}
                                    className="flex-1 accent-purple-500 h-1"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: Stats + History */}
                <div className="space-y-6">
                    {/* Today's Stats */}
                    <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-5">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-400" />
                            Today&apos;s Progress
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{todayStats.sessions}</div>
                                <div className="text-xs text-gray-500">Sessions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{todayStats.totalMinutes}</div>
                                <div className="text-xs text-gray-500">Minutes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">{todayStats.totalXP}</div>
                                <div className="text-xs text-gray-500">XP</div>
                            </div>
                        </div>
                    </div>

                    {/* Session History */}
                    <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-5">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            Recent Sessions
                        </h3>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 bg-gray-700/30 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8">
                                <Timer className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No sessions yet</p>
                                <p className="text-xs text-gray-600">Start your first Pomodoro!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((session: any) => (
                                    <div
                                        key={session.id}
                                        className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700/30"
                                    >
                                        <div
                                            className="p-1.5 rounded-lg"
                                            style={{
                                                backgroundColor: `${TIMER_PRESETS[session.session_type as SessionType]?.color || "#8b5cf6"}15`,
                                            }}
                                        >
                                            {session.session_type === "work"
                                                ? <Brain className="h-4 w-4" style={{ color: TIMER_PRESETS.work.color }} />
                                                : <Coffee className="h-4 w-4" style={{ color: TIMER_PRESETS.short_break.color }} />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {session.session_type === "work" ? "Focus" : "Break"}
                                                {" · "}{session.duration_minutes}min
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(session.completed_at).toLocaleDateString(undefined, {
                                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </p>
                                        </div>
                                        {session.xp_earned > 0 && (
                                            <span className="text-xs font-medium text-purple-400 flex items-center gap-1">
                                                <Zap className="h-3 w-3" />
                                                +{session.xp_earned}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-2xl border border-purple-500/20 p-5">
                        <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Pomodoro Tips
                        </h3>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                Focus for 25 minutes, then take a 5-minute break
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                After 4 sessions, take a longer 15-minute break
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                Earn <span className="text-purple-300 font-medium">25 XP</span> for each focus session
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                Use ambient sounds to stay in the zone
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
