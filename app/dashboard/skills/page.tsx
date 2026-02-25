"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Target, TrendingUp, Clock, Star, Plus, ChevronRight, Sparkles, Minus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const CATEGORY_CONFIG: Record<string, { icon: string; color: string; gradient: string }> = {
    programming: { icon: '💻', color: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-500/20' },
    languages: { icon: '🌍', color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-teal-500/20' },
    science: { icon: '🔬', color: 'text-purple-400', gradient: 'from-purple-500/20 to-pink-500/20' },
    mathematics: { icon: '📐', color: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/20' },
    business: { icon: '💼', color: 'text-blue-400', gradient: 'from-blue-500/20 to-indigo-500/20' },
    creative: { icon: '🎨', color: 'text-pink-400', gradient: 'from-pink-500/20 to-rose-500/20' },
    engineering: { icon: '⚙️', color: 'text-slate-400', gradient: 'from-slate-500/20 to-gray-500/20' },
    health: { icon: '🏥', color: 'text-red-400', gradient: 'from-red-500/20 to-rose-500/20' },
    social_sciences: { icon: '🏛️', color: 'text-indigo-400', gradient: 'from-indigo-500/20 to-violet-500/20' },
    other: { icon: '📚', color: 'text-gray-400', gradient: 'from-gray-500/20 to-slate-500/20' },
}

export default function SkillsPage() {
    const { toast } = useToast()
    const [allSkills, setAllSkills] = useState<any[]>([])
    const [userSkillMap, setUserSkillMap] = useState<Map<string, any>>(new Map())
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchSkills()
    }, [])

    const fetchSkills = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/skills")
            if (!res.ok) throw new Error("Failed to fetch skills")
            const data = await res.json()
            setAllSkills(data.skills || [])
            const map = new Map<string, any>((data.userSkills || []).map((us: any) => [us.skill_id, us]))
            setUserSkillMap(map)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleAddSkill = async (skillId: string) => {
        setActionLoading(skillId)
        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill_id: skillId }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to add skill")
            }
            const data = await res.json()
            setUserSkillMap(prev => {
                const next = new Map(prev)
                next.set(skillId, data.userSkill)
                return next
            })
            toast({ title: "Skill Added! 🎯", description: "Start earning XP with practice sessions." })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleRemoveSkill = async (skillId: string) => {
        setActionLoading(skillId)
        try {
            const res = await fetch("/api/skills", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill_id: skillId }),
            })
            if (!res.ok) throw new Error("Failed to remove skill")
            setUserSkillMap(prev => {
                const next = new Map(prev)
                next.delete(skillId)
                return next
            })
            toast({ title: "Skill Removed", description: "Skill removed from your active list." })
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setActionLoading(null)
        }
    }

    // Group skills by category
    const categories = new Map<string, any[]>()
    for (const skill of allSkills) {
        if (!categories.has(skill.category)) {
            categories.set(skill.category, [])
        }
        categories.get(skill.category)!.push({
            ...skill,
            userProgress: userSkillMap.get(skill.id),
        })
    }

    // Calculate overall stats
    const activeSkills = userSkillMap.size
    const totalSkills = allSkills.length
    const totalXP = Array.from(userSkillMap.values()).reduce((sum: number, s: any) => sum + (s.xp || 0), 0)
    const averageLevel = activeSkills > 0
        ? Math.round(Array.from(userSkillMap.values()).reduce((sum: number, s: any) => sum + (s.level || 0), 0) / activeSkills)
        : 0

    if (loading) {
        return (
            <div className="relative min-h-[calc(100vh-4rem)]">
                <AmbientBackground />
                <div className="relative z-10 flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <AmbientBackground />
            <div className="relative z-10 space-y-8">

                {/* Header */}
                <ScrollReveal direction="up">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                                <Target className="h-8 w-8 text-cyan-400" />
                                Skill Tree
                            </h1>
                            <p className="text-foreground/60 mt-1">Track your growth across every subject.</p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Stats Overview */}
                <ScrollReveal direction="up" delay={0.1}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Active Skills', value: activeSkills, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                            { label: 'Available', value: totalSkills, icon: Plus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                            { label: 'Avg Level', value: averageLevel, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                            { label: 'Skill XP', value: totalXP.toLocaleString(), icon: Star, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                        ].map((stat) => (
                            <div key={stat.label} className="p-4 rounded-2xl glass-surface border border-white/10">
                                <div className={`p-2 rounded-lg ${stat.bg} w-fit mb-2`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                                <div className="text-xl font-bold text-foreground">{stat.value}</div>
                                <div className="text-xs text-foreground/50">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Skill Categories */}
                <div className="space-y-6">
                    {Array.from(categories.entries()).map(([category, skills], categoryIndex) => {
                        const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other
                        const categoryName = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        const activeInCategory = skills.filter((s: any) => s.userProgress).length

                        return (
                            <ScrollReveal key={category} direction="up" delay={0.1 + categoryIndex * 0.05}>
                                <GlassSurface className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                            <span className="text-xl">{config.icon}</span>
                                            {categoryName}
                                            <span className="text-xs text-foreground/40 ml-2">
                                                {activeInCategory}/{skills.length} active
                                            </span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {skills.map((skill: any) => {
                                            const progress = skill.userProgress
                                            const level = progress?.level || 0
                                            const xp = progress?.xp || 0
                                            const nextLevelXP = Math.floor(50 * Math.pow(level, 2)) || 50
                                            const xpProgress = nextLevelXP > 0 ? Math.min((xp / nextLevelXP) * 100, 100) : 0
                                            const isLoading = actionLoading === skill.id

                                            return (
                                                <div
                                                    key={skill.id}
                                                    className={`group p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${progress
                                                        ? 'border-cyan-500/20 bg-gradient-to-br ' + config.gradient
                                                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{skill.icon}</span>
                                                            <div>
                                                                <h3 className="text-sm font-medium text-foreground">{skill.name}</h3>
                                                                {progress && (
                                                                    <span className={`text-xs ${config.color}`}>Level {level}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isLoading ? (
                                                            <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                                                        ) : progress ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-foreground/40">{xp} XP</span>
                                                                <button
                                                                    onClick={() => handleRemoveSkill(skill.id)}
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                                                                    title="Remove skill"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddSkill(skill.id)}
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-cyan-500/10"
                                                            >
                                                                <Plus className="h-3 w-3" /> Add
                                                            </button>
                                                        )}
                                                    </div>

                                                    {skill.description && (
                                                        <p className="text-xs text-foreground/40 mb-2 line-clamp-1">{skill.description}</p>
                                                    )}

                                                    {progress && (
                                                        <div className="mt-2">
                                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-1000"
                                                                    style={{
                                                                        width: `${xpProgress}%`,
                                                                        background: `linear-gradient(90deg, var(--primary), hsl(var(--primary) / 0.6))`,
                                                                    }}
                                                                />
                                                            </div>
                                                            {progress.next_review_date && (
                                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-foreground/30">
                                                                    <Clock className="h-2.5 w-2.5" />
                                                                    Review: {new Date(progress.next_review_date).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </GlassSurface>
                            </ScrollReveal>
                        )
                    })}
                </div>

                {/* AI Recommendation */}
                <ScrollReveal direction="up" delay={0.3}>
                    <GlassSurface className="p-6 border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">AI Skill Recommendation</h3>
                                <p className="text-xs text-foreground/50">Based on your learning goals and current progress</p>
                            </div>
                        </div>
                        <p className="text-sm text-foreground/60">
                            {activeSkills === 0
                                ? "Start by adding your first skill! Hover over any skill card above and click '+ Add' to begin tracking your progress."
                                : `You're making great progress with ${activeSkills} active skills! Consider exploring ${Array.from(categories.keys()).find(cat => {
                                    const skills = categories.get(cat) || []
                                    return !skills.some((s: any) => s.userProgress)
                                })?.replace(/_/g, ' ') || 'new'
                                } skills to broaden your knowledge.`
                            }
                        </p>
                        <Link href="/dashboard/ai-tutor">
                            <Button className="mt-3 bg-cyan-600 hover:bg-cyan-500 text-white text-sm">
                                Practice with AI Tutor <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </GlassSurface>
                </ScrollReveal>
            </div>
        </div>
    )
}
