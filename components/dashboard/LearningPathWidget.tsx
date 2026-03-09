'use client'

import { useEffect, useState, useCallback } from 'react'
import { Sparkles, ArrowRight, Brain, Target, BookOpen, CheckSquare, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Recommendation {
  id?: string
  type: "assignment" | "flashcard" | "topic" | "general"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionUrl: string
  estimatedMinutes: number
}

const getIcon = (type: string) => {
  switch (type) {
    case 'assignment': return <CheckSquare className="h-5 w-5" />
    case 'flashcard': return <Brain className="h-5 w-5" />
    case 'topic': return <BookOpen className="h-5 w-5" />
    default: return <Target className="h-5 w-5" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20'
    case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    case 'low': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    default: return 'text-foreground/60 bg-foreground/5 border-foreground/10'
  }
}

export function LearningPathWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch('/api/recommendations')
      if (!res.ok) {
        throw new Error('Failed to fetch learning paths')
      }
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] h-full flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-sm text-cyan-200/60 font-medium">AI is analyzing your learning profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-red-500/30 bg-red-500/5 h-full flex flex-col justify-center items-center text-center">
        <p className="text-sm text-red-400/80 mb-2">{error}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchRecommendations() }} className="text-xs text-red-300 hover:text-red-200 underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
            <Sparkles className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              Up Next for You
            </h2>
            <p className="text-xs text-cyan-200/60 font-medium tracking-wide uppercase">AI-Powered Learning Path</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {recommendations.length > 0 ? (
          recommendations.map((rec, i) => (
            <Link key={rec.id || i} href={rec.actionUrl || '#'}>
              <div className="group flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300">
                <div className={`mt-1 p-2 rounded-lg border ${getPriorityColor(rec.priority)} group-hover:scale-110 transition-transform duration-300`}>
                  {getIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-cyan-300 transition-colors">
                      {rec.title}
                    </h3>
                    <span className="text-[10px] font-medium text-foreground/50 whitespace-nowrap bg-background rounded-full px-2 py-0.5 border border-white/5">
                      ~{rec.estimatedMinutes}m
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <div className="self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-foreground/50">You're all caught up! Explore a new topic.</p>
          </div>
        )}
      </div>
    </div>
  )
}
