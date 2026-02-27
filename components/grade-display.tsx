"use client"

import { CheckCircle, XCircle, TrendingUp, AlertTriangle } from "lucide-react"

interface GradeResult {
    grade?: number
    percentage?: number
    letter_grade?: string
    feedback?: string
    strengths?: string[]
    improvements?: string[]
    rubric_scores?: Record<string, number> | null
}

interface GradeDisplayProps {
    result: GradeResult
    maxPoints?: number
    className?: string
}

function getGradeColor(percentage: number): string {
    if (percentage >= 90) return "from-emerald-500 to-green-500"
    if (percentage >= 80) return "from-blue-500 to-cyan-500"
    if (percentage >= 70) return "from-yellow-500 to-amber-500"
    if (percentage >= 60) return "from-orange-500 to-amber-600"
    return "from-red-500 to-rose-500"
}

function getGradeBg(percentage: number): string {
    if (percentage >= 90) return "bg-emerald-500/10 border-emerald-500/20"
    if (percentage >= 80) return "bg-blue-500/10 border-blue-500/20"
    if (percentage >= 70) return "bg-yellow-500/10 border-yellow-500/20"
    if (percentage >= 60) return "bg-orange-500/10 border-orange-500/20"
    return "bg-red-500/10 border-red-500/20"
}

export function GradeDisplay({ result, maxPoints = 100, className = "" }: GradeDisplayProps) {
    const pct = result.percentage ?? (result.grade ? (result.grade / maxPoints) * 100 : 0)
    const color = getGradeColor(pct)
    const bg = getGradeBg(pct)

    return (
        <div className={`space-y-5 ${className}`}>
            {/* Score card */}
            <div className={`rounded-xl border p-6 ${bg}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Grade</h3>
                    {result.letter_grade && (
                        <span className={`text-3xl font-extrabold bg-gradient-to-r ${color} text-transparent bg-clip-text`}>
                            {result.letter_grade}
                        </span>
                    )}
                </div>

                {/* Score bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-sm text-foreground/60 mb-1">
                        <span>{result.grade ?? 0} / {maxPoints}</span>
                        <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Feedback */}
            {result.feedback && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <h4 className="text-sm font-semibold text-foreground/50 uppercase tracking-wide mb-3">
                        Feedback
                    </h4>
                    <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {result.feedback}
                    </p>
                </div>
            )}

            {/* Strengths & Improvements */}
            <div className="grid gap-4 md:grid-cols-2">
                {result.strengths && result.strengths.length > 0 && (
                    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <h4 className="text-sm font-semibold text-emerald-400">Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                            {result.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-foreground/70 flex gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.improvements && result.improvements.length > 0 && (
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-amber-400" />
                            <h4 className="text-sm font-semibold text-amber-400">Areas to Improve</h4>
                        </div>
                        <ul className="space-y-2">
                            {result.improvements.map((s, i) => (
                                <li key={i} className="text-sm text-foreground/70 flex gap-2">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Rubric scores */}
            {result.rubric_scores && Object.keys(result.rubric_scores).length > 0 && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                    <h4 className="text-sm font-semibold text-foreground/50 uppercase tracking-wide mb-3">
                        Rubric Breakdown
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(result.rubric_scores).map(([criterion, score]) => (
                            <div key={criterion} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground/70 capitalize">
                                        {criterion.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-foreground/60 font-mono">
                                        {typeof score === "number" ? score : String(score)}
                                    </span>
                                </div>
                                {typeof score === "number" && (
                                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${Math.min(score, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GradeDisplay
