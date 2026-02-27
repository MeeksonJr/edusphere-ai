"use client"

import { TrendingUp, Clock, BookOpen, Award } from "lucide-react"

interface ProgressEntry {
    subject: string
    score?: number
    time_spent_minutes?: number
    activity?: string
    date: string
}

interface ProgressReportProps {
    childName: string
    progress: ProgressEntry[]
    className?: string
}

export function ProgressReport({ childName, progress, className = "" }: ProgressReportProps) {
    if (progress.length === 0) {
        return (
            <div className={`rounded-xl bg-white/5 border border-white/10 p-6 text-center ${className}`}>
                <BookOpen className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
                <p className="text-foreground/50 text-sm">No progress recorded this week for {childName}</p>
            </div>
        )
    }

    // Aggregate by subject
    const subjectMap: Record<string, { totalTime: number; scores: number[]; count: number }> = {}
    for (const p of progress) {
        if (!subjectMap[p.subject]) {
            subjectMap[p.subject] = { totalTime: 0, scores: [], count: 0 }
        }
        subjectMap[p.subject].totalTime += p.time_spent_minutes || 0
        if (p.score != null) subjectMap[p.subject].scores.push(p.score)
        subjectMap[p.subject].count++
    }

    const totalTime = progress.reduce((s, p) => s + (p.time_spent_minutes || 0), 0)
    const allScores = progress.filter((p) => p.score != null).map((p) => p.score!)
    const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 text-center">
                    <Clock className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{totalTime}m</p>
                    <p className="text-xs text-foreground/40">Total Time</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                    <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{avgScore ?? "—"}</p>
                    <p className="text-xs text-foreground/40">Avg Score</p>
                </div>
                <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-3 text-center">
                    <Award className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{progress.length}</p>
                    <p className="text-xs text-foreground/40">Activities</p>
                </div>
            </div>

            {/* Per-subject breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/50 uppercase tracking-wide">By Subject</h4>
                {Object.entries(subjectMap).map(([subject, data]) => {
                    const avg = data.scores.length > 0
                        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
                        : null
                    return (
                        <div key={subject} className="rounded-lg bg-white/5 border border-white/10 p-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-foreground capitalize">{subject}</span>
                                <span className="text-xs text-foreground/40">{data.count} sessions</span>
                            </div>
                            <div className="flex gap-4 text-xs text-foreground/60">
                                <span>⏱ {data.totalTime}m</span>
                                {avg !== null && <span>📊 {avg}%</span>}
                            </div>
                            {avg !== null && (
                                <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                                        style={{ width: `${Math.min(avg, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Recent activity feed */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground/50 uppercase tracking-wide">Recent Activity</h4>
                {progress.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-white/5 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="text-foreground/80 capitalize">{p.subject}</span>
                            {p.activity && (
                                <span className="text-foreground/40 ml-1">— {p.activity}</span>
                            )}
                        </div>
                        <span className="text-foreground/40 text-xs flex-shrink-0">
                            {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProgressReport
