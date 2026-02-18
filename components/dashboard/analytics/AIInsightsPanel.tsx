"use client"

import { Sparkles } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface AIInsightsPanelProps {
    insights: string[]
    topTopics: { topic: string; count: number }[]
}

export default function AIInsightsPanel({ insights, topTopics }: AIInsightsPanelProps) {
    return (
        <GlassSurface className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-amber-400" />
                AI Learning Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights */}
                <div className="space-y-3">
                    {insights.length > 0 ? (
                        insights.map((insight, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 transition-colors"
                            >
                                <span className="text-sm leading-relaxed text-foreground/80">{insight}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-foreground/30 text-sm p-4 text-center">
                            Start studying to unlock personalized insights!
                        </div>
                    )}
                </div>

                {/* Top Topics */}
                <div>
                    <h4 className="text-sm font-medium text-foreground/60 mb-3">📚 Most Studied Topics</h4>
                    {topTopics.length > 0 ? (
                        <div className="space-y-2">
                            {topTopics.map((t, i) => {
                                const maxCount = topTopics[0]?.count || 1
                                const pct = Math.round((t.count / maxCount) * 100)
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-foreground/70 truncate max-w-[200px]">{t.topic}</span>
                                            <span className="text-xs text-foreground/40 shrink-0 ml-2">{t.count} sessions</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: `linear-gradient(90deg, #8b5cf6, #06b6d4)`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-foreground/30 text-sm p-4 text-center">
                            No topics yet — your study trends will appear here.
                        </div>
                    )}
                </div>
            </div>
        </GlassSurface>
    )
}
