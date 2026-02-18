'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
    ArrowLeft,
    RefreshCw,
    MessageSquare,
    Target,
    TrendingUp,
    Lightbulb,
    Loader2,
    CheckCircle2,
    Layers,
    FileText,
    Download,
    ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [rating, setRating] = useState(0)
    const [ratingHover, setRatingHover] = useState(0)
    const [sessionId, setSessionId] = useState<string>('')

    // Session actions state
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [actionResults, setActionResults] = useState<Record<string, { success: boolean; message: string; link?: string }>>({})

    useEffect(() => {
        params.then(p => setSessionId(p.id))
    }, [params])

    useEffect(() => {
        if (!sessionId) return
        async function load() {
            const res = await fetch(`/api/ai/live/${sessionId}`)
            if (res.ok) {
                const data = await res.json()
                setSession(data)
                setRating(data.quality_rating || 0)
            }
            setLoading(false)
        }
        load()
    }, [sessionId])

    const [analysisError, setAnalysisError] = useState<string | null>(null)

    const generateAnalysis = useCallback(async () => {
        if (!sessionId || analyzing) return
        setAnalyzing(true)
        setAnalysisError(null)
        try {
            const res = await fetch(`/api/ai/live/${sessionId}`, { method: 'POST' })
            if (res.ok) {
                const { feedback, xp_earned } = await res.json()
                setSession((prev: any) => ({ ...prev, feedback, xp_earned }))
            } else if (res.status === 429 || res.status === 503) {
                const data = await res.json().catch(() => ({}))
                setAnalysisError(data.error || 'AI analysis is temporarily unavailable. Please try again in a few minutes.')
            } else {
                const data = await res.json().catch(() => ({}))
                setAnalysisError(data.error || 'Failed to generate analysis. Please try again.')
            }
        } catch (e) {
            console.error('Analysis error:', e)
            setAnalysisError('Network error. Please check your connection and try again.')
        }
        setAnalyzing(false)
    }, [sessionId, analyzing])

    // Session action handler (flashcards, notes, export)
    const handleAction = useCallback(async (action: string) => {
        if (!sessionId || actionLoading) return
        setActionLoading(action)
        setActionResults(prev => ({ ...prev, [action]: undefined as any }))

        try {
            const res = await fetch(`/api/ai/live/${sessionId}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            })

            const data = await res.json()

            if (!res.ok) {
                setActionResults(prev => ({
                    ...prev,
                    [action]: { success: false, message: data.error || 'Action failed' },
                }))
                return
            }

            if (action === 'export_markdown' && data.content) {
                // Trigger browser download
                const blob = new Blob([data.content], { type: 'text/markdown' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = data.filename || 'session-export.md'
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                setActionResults(prev => ({
                    ...prev,
                    [action]: { success: true, message: 'Downloaded!' },
                }))
            } else if (action === 'generate_flashcards') {
                setActionResults(prev => ({
                    ...prev,
                    [action]: {
                        success: true,
                        message: data.message || `Created ${data.card_count} flashcards`,
                        link: '/dashboard/flashcards',
                    },
                }))
            } else if (action === 'save_notes') {
                setActionResults(prev => ({
                    ...prev,
                    [action]: {
                        success: true,
                        message: data.message || 'Study notes saved',
                        link: '/dashboard/resources',
                    },
                }))
            }
        } catch (e) {
            setActionResults(prev => ({
                ...prev,
                [action]: { success: false, message: 'Network error. Try again.' },
            }))
        } finally {
            setActionLoading(null)
        }
    }, [sessionId, actionLoading])

    const saveRating = useCallback(async (value: number) => {
        setRating(value)
        await fetch(`/api/ai/live/${sessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quality_rating: value }),
        })
    }, [sessionId])

    const continueSession = () => {
        // Navigate to AI tutor with continuation context
        router.push(`/dashboard/ai-tutor?continue=${sessionId}`)
    }

    if (loading) {
        return (
            <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <AmbientBackground />
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="relative min-h-[calc(100vh-4rem)]">
                <AmbientBackground />
                <div className="relative z-10 max-w-3xl mx-auto py-12 text-center">
                    <h2 className="text-xl font-semibold text-foreground/60 mb-4">Session not found</h2>
                    <Link href="/dashboard/ai-tutor/history" className="text-cyan-400 hover:underline">
                        ← Back to history
                    </Link>
                </div>
            </div>
        )
    }

    const meta = TYPE_META[session.session_type] || TYPE_META.tutor
    const Icon = meta.icon
    const feedback = session.feedback || {}
    const hasFeedback = feedback.summary
    const transcript = session.transcript || []

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <AmbientBackground />
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/ai-tutor/history"
                        className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-foreground">
                            {session.topic || meta.name}
                        </h1>
                        <div className="flex items-center gap-3 text-xs text-foreground/40 mt-0.5">
                            <span>{meta.name}</span>
                            <span>•</span>
                            <span>{new Date(session.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(session.duration_seconds)}
                            </span>
                        </div>
                    </div>
                    {session.xp_earned > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-semibold text-amber-400">{session.xp_earned} XP</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={continueSession}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Continue This Session
                    </Button>
                    {transcript.length > 0 && (
                        <Button
                            onClick={generateAnalysis}
                            disabled={analyzing}
                            variant="outline"
                            className="border-white/10 hover:bg-white/5"
                        >
                            {analyzing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                            ) : hasFeedback ? (
                                <><RefreshCw className="h-4 w-4 mr-2" /> Re-analyze</>
                            ) : (
                                <><Sparkles className="h-4 w-4 mr-2" /> Generate Analysis</>
                            )}
                        </Button>
                    )}
                </div>

                {/* Analysis error */}
                {analysisError && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-sm text-amber-400">{analysisError}</span>
                        <Button
                            onClick={generateAnalysis}
                            disabled={analyzing}
                            size="sm"
                            className="ml-auto bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 text-xs"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* AI Summary */}
                {hasFeedback && (
                    <GlassSurface className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-cyan-400" />
                                AI Session Analysis
                            </h2>
                            <button
                                onClick={generateAnalysis}
                                disabled={analyzing}
                                className="text-xs text-foreground/30 hover:text-foreground/60 flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                                {analyzing ? (
                                    <><Loader2 className="h-3 w-3 animate-spin" /> Regenerating...</>
                                ) : (
                                    <><RefreshCw className="h-3 w-3" /> Re-analyze</>
                                )}
                            </button>
                        </div>

                        {/* Summary */}
                        <p className="text-foreground/80 leading-relaxed">{feedback.summary}</p>

                        {/* Scores */}
                        {(feedback.engagement_score || feedback.comprehension_score) && (
                            <div className="grid grid-cols-2 gap-3">
                                {feedback.engagement_score && (
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-foreground/40 mb-1">Engagement</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                                                    style={{ width: `${feedback.engagement_score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{feedback.engagement_score}%</span>
                                        </div>
                                    </div>
                                )}
                                {feedback.comprehension_score && (
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-xs text-foreground/40 mb-1">Comprehension</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                                                    style={{ width: `${feedback.comprehension_score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{feedback.comprehension_score}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Topics, Strengths, Areas */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {feedback.topics_covered?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-medium text-foreground/40 mb-2 flex items-center gap-1.5">
                                        <Target className="h-3.5 w-3.5" /> Topics Covered
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {feedback.topics_covered.map((t: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {feedback.strengths?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-medium text-foreground/40 mb-2 flex items-center gap-1.5">
                                        <TrendingUp className="h-3.5 w-3.5" /> Strengths
                                    </h3>
                                    <ul className="space-y-1">
                                        {feedback.strengths.map((s: string, i: number) => (
                                            <li key={i} className="text-sm text-foreground/60 flex items-start gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {feedback.areas_to_improve?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-medium text-foreground/40 mb-2 flex items-center gap-1.5">
                                        <Lightbulb className="h-3.5 w-3.5" /> Areas to Improve
                                    </h3>
                                    <ul className="space-y-1">
                                        {feedback.areas_to_improve.map((a: string, i: number) => (
                                            <li key={i} className="text-sm text-foreground/60 flex items-start gap-1.5">
                                                <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {feedback.suggested_next_steps?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-medium text-foreground/40 mb-2 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" /> Suggested Next Steps
                                    </h3>
                                    <ul className="space-y-1">
                                        {feedback.suggested_next_steps.map((s: string, i: number) => (
                                            <li key={i} className="text-sm text-foreground/60 flex items-start gap-1.5">
                                                <span className="text-cyan-400 mt-0.5 flex-shrink-0">{i + 1}.</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </GlassSurface>
                )}

                {/* Session Actions */}
                {transcript.length > 0 && (
                    <GlassSurface className="p-5">
                        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            Session Actions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Generate Flashcards */}
                            <button
                                onClick={() => handleAction('generate_flashcards')}
                                disabled={actionLoading === 'generate_flashcards'}
                                className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all disabled:opacity-50"
                            >
                                {actionLoading === 'generate_flashcards' ? (
                                    <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                                ) : actionResults.generate_flashcards?.success ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <Layers className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-xs font-medium text-foreground/70">Generate Flashcards</span>
                                {actionResults.generate_flashcards && (
                                    <span className={`text-[10px] ${actionResults.generate_flashcards.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {actionResults.generate_flashcards.message}
                                    </span>
                                )}
                                {actionResults.generate_flashcards?.link && (
                                    <Link
                                        href={actionResults.generate_flashcards.link}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                                    >
                                        View <ExternalLink className="h-2.5 w-2.5" />
                                    </Link>
                                )}
                            </button>

                            {/* Save Study Notes */}
                            <button
                                onClick={() => handleAction('save_notes')}
                                disabled={actionLoading === 'save_notes'}
                                className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all disabled:opacity-50"
                            >
                                {actionLoading === 'save_notes' ? (
                                    <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
                                ) : actionResults.save_notes?.success ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <FileText className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-xs font-medium text-foreground/70">Save Study Notes</span>
                                {actionResults.save_notes && (
                                    <span className={`text-[10px] ${actionResults.save_notes.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {actionResults.save_notes.message}
                                    </span>
                                )}
                                {actionResults.save_notes?.link && (
                                    <Link
                                        href={actionResults.save_notes.link}
                                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                                    >
                                        View <ExternalLink className="h-2.5 w-2.5" />
                                    </Link>
                                )}
                            </button>

                            {/* Export Markdown */}
                            <button
                                onClick={() => handleAction('export_markdown')}
                                disabled={actionLoading === 'export_markdown'}
                                className="group relative flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all disabled:opacity-50"
                            >
                                {actionLoading === 'export_markdown' ? (
                                    <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                                ) : actionResults.export_markdown?.success ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <Download className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                                )}
                                <span className="text-xs font-medium text-foreground/70">Export Markdown</span>
                                {actionResults.export_markdown && (
                                    <span className={`text-[10px] ${actionResults.export_markdown.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {actionResults.export_markdown.message}
                                    </span>
                                )}
                            </button>
                        </div>
                    </GlassSurface>
                )}

                {/* Rating */}
                <GlassSurface className="p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground/50">Rate this session</span>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => saveRating(i + 1)}
                                    onMouseEnter={() => setRatingHover(i + 1)}
                                    onMouseLeave={() => setRatingHover(0)}
                                    className="p-0.5 hover:scale-125 transition-transform"
                                >
                                    <Star
                                        className={`h-5 w-5 transition-colors ${i < (ratingHover || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-foreground/15'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassSurface>

                {/* Transcript */}
                {transcript.length > 0 && (
                    <GlassSurface className="p-6">
                        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Full Transcript ({transcript.length} messages)
                        </h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {transcript.map((entry: any, i: number) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}
                                >
                                    {entry.role === 'ai' && (
                                        <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                                        </div>
                                    )}
                                    {entry.role === 'system' && (
                                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs">ℹ</span>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${entry.role === 'ai'
                                        ? 'bg-white/5 text-foreground/80'
                                        : entry.role === 'system'
                                            ? 'bg-amber-500/5 text-amber-300/80 italic'
                                            : 'bg-cyan-500/10 text-foreground/80'
                                        }`}>
                                        {entry.text}
                                        {entry.timestamp && (
                                            <span className="block text-[10px] text-foreground/20 mt-1">
                                                {new Date(entry.timestamp).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassSurface>
                )}

                {/* No transcript */}
                {transcript.length === 0 && (
                    <GlassSurface className="p-8 text-center">
                        <MessageSquare className="h-10 w-10 text-foreground/15 mx-auto mb-3" />
                        <p className="text-sm text-foreground/40">No transcript available for this session</p>
                    </GlassSurface>
                )}

                {/* Continued From */}
                {feedback.continued_from && (
                    <Link
                        href={`/dashboard/ai-tutor/${feedback.continued_from}`}
                        className="block text-xs text-foreground/30 hover:text-cyan-400 transition-colors text-center"
                    >
                        ← Continued from a previous session
                    </Link>
                )}
            </div>
        </div>
    )
}
