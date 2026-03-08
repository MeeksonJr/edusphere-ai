"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
    ArrowLeft,
    Trophy,
    Medal,
    Flame,
    TrendingUp,
    Crown,
} from "lucide-react"

interface LeaderboardEntry {
    id: string
    full_name: string
    avatar_url: string | null
    total_xp: number
    level: number
    current_streak: number
    rank: number
}

export default function LeaderboardPage() {
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<"all" | "month" | "week">("all")

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            setLoading(true)
            const { data: authData } = await supabase.auth.getUser()
            if (authData.user) setUser(authData.user)

            // Fetch profiles with XP data
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url, total_xp, level")
                .order("total_xp", { ascending: false })
                .limit(50)

            // Fetch streaks
            const { data: streaks } = await supabase
                .from("user_streaks")
                .select("user_id, current_streak, total_xp")
                .order("total_xp", { ascending: false })

            const streakMap: Record<string, { current_streak: number; total_xp: number }> = {}
                ; (streaks || []).forEach((s: any) => {
                    streakMap[s.user_id] = { current_streak: s.current_streak || 0, total_xp: s.total_xp || 0 }
                })

            const combined = (profiles || []).map((p: any, i: number) => ({
                id: p.id,
                full_name: p.full_name || "Anonymous",
                avatar_url: p.avatar_url,
                total_xp: p.total_xp || streakMap[p.id]?.total_xp || 0,
                level: p.level || 1,
                current_streak: streakMap[p.id]?.current_streak || 0,
                rank: i + 1,
            }))

            // Sort by XP
            combined.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.total_xp - a.total_xp)
            combined.forEach((e: LeaderboardEntry, i: number) => (e.rank = i + 1))

            setEntries(combined)
            setLoading(false)
        }
        load()
    }, [supabase, period])

    const rankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
        return <span className="text-sm font-bold text-foreground/30 w-5 text-center">{rank}</span>
    }

    const myRank = entries.findIndex((e) => e.id === user?.id) + 1

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading leaderboard..." />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard/community">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1>
                        <p className="text-sm text-foreground/50">Top learners by XP</p>
                    </div>
                </div>
            </ScrollReveal>

            {/* My Rank */}
            {myRank > 0 && (
                <ScrollReveal direction="up" delay={0.05}>
                    <GlassSurface className="p-4 mb-6 border-amber-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-amber-400" />
                                <div>
                                    <p className="text-sm text-foreground/50">Your Rank</p>
                                    <p className="text-2xl font-bold text-amber-400">#{myRank}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-foreground/50">XP</p>
                                <p className="text-2xl font-bold text-foreground">{entries[myRank - 1]?.total_xp.toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Top 3 Podium */}
            {entries.length >= 3 && (
                <ScrollReveal direction="up" delay={0.1}>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[entries[1], entries[0], entries[2]].map((entry, i) => {
                            const actualRank = [2, 1, 3][i]
                            return (
                                <GlassSurface
                                    key={entry.id}
                                    className={`p-4 text-center ${actualRank === 1 ? "ring-1 ring-amber-500/30 bg-amber-500/5 -translate-y-2" : ""}`}
                                >
                                    <div className="mb-2">{rankIcon(actualRank)}</div>
                                    <Avatar className="h-10 w-10 mx-auto mb-2">
                                        <AvatarFallback className={`text-sm font-bold ${actualRank === 1 ? "bg-amber-500/20 text-amber-400" :
                                                actualRank === 2 ? "bg-gray-500/20 text-gray-300" :
                                                    "bg-amber-700/20 text-amber-600"
                                            }`}>
                                            {entry.full_name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-semibold text-foreground truncate">{entry.full_name}</p>
                                    <p className="text-lg font-bold text-amber-400">{entry.total_xp.toLocaleString()}</p>
                                    <p className="text-[10px] text-foreground/30">XP</p>
                                </GlassSurface>
                            )
                        })}
                    </div>
                </ScrollReveal>
            )}

            {/* Full List */}
            <GlassSurface className="overflow-hidden">
                {entries.map((entry, i) => (
                    <div
                        key={entry.id}
                        className={`flex items-center gap-4 px-4 py-3 ${i !== entries.length - 1 ? "border-b border-white/5" : ""
                            } ${entry.id === user?.id ? "bg-amber-500/5" : "hover:bg-white/5"} transition-colors`}
                    >
                        <div className="w-8 text-center shrink-0">{rankIcon(entry.rank)}</div>
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-purple-500/20 text-purple-400 text-xs">
                                {entry.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                                {entry.full_name}
                                {entry.id === user?.id && <span className="text-foreground/30 ml-1">(You)</span>}
                            </p>
                            <p className="text-xs text-foreground/30">Level {entry.level}</p>
                        </div>
                        {entry.current_streak > 0 && (
                            <div className="flex items-center gap-1 text-xs text-orange-400/60">
                                <Flame className="h-3 w-3" />
                                {entry.current_streak}
                            </div>
                        )}
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">{entry.total_xp.toLocaleString()}</p>
                            <p className="text-[10px] text-foreground/30">XP</p>
                        </div>
                    </div>
                ))}
                {entries.length === 0 && (
                    <div className="p-12 text-center">
                        <Trophy className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-foreground/40">No learners yet. Start earning XP!</p>
                    </div>
                )}
            </GlassSurface>
        </div>
    )
}
