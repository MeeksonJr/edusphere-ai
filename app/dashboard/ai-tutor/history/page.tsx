'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Clock,
    GraduationCap,
    Brain,
    Languages,
    BookOpen,
    Sparkles,
    Briefcase,
    Star,
    Zap,
    Search,
    Filter,
    ChevronRight,
} from 'lucide-react'
import { GlassSurface } from '@/components/shared/GlassSurface'
import { AmbientBackground } from '@/components/shared/AmbientBackground'

const TYPE_META: Record<string, { name: string; icon: any; color: string }> = {
    tutor: { name: '1-on-1 Tutor', icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
    quiz_practice: { name: 'Quiz Practice', icon: Brain, color: 'from-purple-500 to-pink-500' },
    language: { name: 'Language Partner', icon: Languages, color: 'from-emerald-500 to-teal-500' },
    explainer: { name: 'Concept Explainer', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
    study_buddy: { name: 'Study Buddy', icon: Sparkles, color: 'from-pink-500 to-rose-500' },
    interview_prep: { name: 'Interview Prep', icon: Briefcase, color: 'from-indigo-500 to-violet-500' },
}

function formatDuration(seconds: number): string {
    if (!seconds) return '0m'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

function formatDate(date: string): string {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

export default function SessionHistoryPage() {
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/ai/live')
                if (res.ok) {
                    const data = await res.json()
                    setSessions(data || [])
                }
            } catch (e) {
                console.error('Failed to load sessions:', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const filtered = sessions.filter(s => {
        if (filter !== 'all' && s.session_type !== filter) return false
        if (search && !s.topic?.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const totalDuration = sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0)
    const totalXP = sessions.reduce((a, s) => a + (s.xp_earned || 0), 0)

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <AmbientBackground />
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Session History
                        </h1>
                        <p className="text-foreground/50 text-sm mt-1">
                            {sessions.length} sessions • {formatDuration(totalDuration)} total • {totalXP} XP earned
                        </p>
                    </div>
                    <Link
                        href="/dashboard/ai-tutor"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                    >
                        New Session
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by topic..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none text-sm text-foreground placeholder:text-foreground/30"
                        />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        <Filter className="h-4 w-4 text-foreground/30 mr-1" />
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-foreground/50 hover:bg-white/10'
                                }`}
                        >
                            All
                        </button>
                        {Object.entries(TYPE_META).map(([key, meta]) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === key ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-foreground/50 hover:bg-white/10'
                                    }`}
                            >
                                {meta.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-foreground/40">Loading sessions...</div>
                )}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                    <GlassSurface className="p-12 text-center">
                        <GraduationCap className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground/60 mb-2">
                            {search || filter !== 'all' ? 'No matching sessions' : 'No sessions yet'}
                        </h3>
                        <p className="text-sm text-foreground/40 mb-4">
                            {search || filter !== 'all' ? 'Try a different filter' : 'Start your first AI tutoring session!'}
                        </p>
                        {!search && filter === 'all' && (
                            <Link
                                href="/dashboard/ai-tutor"
                                className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm"
                            >
                                Start Session
                            </Link>
                        )}
                    </GlassSurface>
                )}

                {/* Session List */}
                <div className="space-y-3">
                    {filtered.map((session) => {
                        const meta = TYPE_META[session.session_type] || TYPE_META.tutor
                        const Icon = meta.icon
                        const hasFeedback = session.feedback && Object.keys(session.feedback).length > 0

                        return (
                            <Link
                                key={session.id}
                                href={`/dashboard/ai-tutor/${session.id}`}
                                className="group block"
                            >
                                <GlassSurface className="p-4 hover:border-cyan-500/30 border border-transparent transition-all duration-200 group-hover:scale-[1.01]">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-medium text-foreground truncate">
                                                    {session.topic || meta.name}
                                                </h3>
                                                {session.status === 'active' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        In Progress
                                                    </span>
                                                )}
                                                {hasFeedback && session.feedback?.comprehension_score >= 80 && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        ⭐ Great
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-foreground/40">
                                                <span>{meta.name}</span>
                                                <span>•</span>
                                                <span>{formatDate(session.created_at)}</span>
                                                {session.duration_seconds > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDuration(session.duration_seconds)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 flex-shrink-0">
                                            {session.xp_earned > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-amber-400">
                                                    <Zap className="h-3.5 w-3.5" />
                                                    <span>{session.xp_earned} XP</span>
                                                </div>
                                            )}
                                            {session.quality_rating && (
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < session.quality_rating ? 'text-amber-400 fill-amber-400' : 'text-foreground/10'}`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Summary preview */}
                                    {hasFeedback && session.feedback.summary && (
                                        <p className="mt-2 ml-14 text-xs text-foreground/30 line-clamp-1">
                                            {session.feedback.summary}
                                        </p>
                                    )}
                                </GlassSurface>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
