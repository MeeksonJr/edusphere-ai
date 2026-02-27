"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Plus, Loader2, Trash2 } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Badge } from "@/components/ui/badge"
import { ProgressReport } from "@/components/progress-report"
import { useToast } from "@/hooks/use-toast"

export default function ChildDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const [child, setChild] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Log progress form
    const [showLogForm, setShowLogForm] = useState(false)
    const [logSubject, setLogSubject] = useState("")
    const [logScore, setLogScore] = useState("")
    const [logMinutes, setLogMinutes] = useState("")
    const [logActivity, setLogActivity] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchChild = async () => {
            try {
                const res = await fetch("/api/family")
                const data = await res.json()

                if (!res.ok) {
                    router.push("/dashboard/family")
                    return
                }

                const found = (data.children || []).find(
                    (c: any) => c.id === params.childId
                )

                if (!found) {
                    router.push("/dashboard/family")
                    return
                }

                setChild(found)
            } catch {
                router.push("/dashboard/family")
            } finally {
                setLoading(false)
            }
        }

        fetchChild()
    }, [params.childId, router])

    const handleLogProgress = async () => {
        if (!logSubject.trim()) {
            toast({ title: "Subject required", variant: "destructive" })
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch("/api/family", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "log_progress",
                    childId: params.childId,
                    subject: logSubject.trim(),
                    score: logScore ? parseFloat(logScore) : null,
                    timeSpentMinutes: logMinutes ? parseInt(logMinutes) : 0,
                    activity: logActivity.trim() || null,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast({ title: "✅ Progress logged!" })

            // Update local state
            setChild((prev: any) => ({
                ...prev,
                recent_progress: [data.progress, ...(prev.recent_progress || [])],
            }))

            setShowLogForm(false)
            setLogSubject("")
            setLogScore("")
            setLogMinutes("")
            setLogActivity("")
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Remove ${child.child_name} from your family? This cannot be undone.`)) return

        try {
            const res = await fetch(`/api/family?childId=${child.id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to remove child")
            toast({ title: "Child removed" })
            router.push("/dashboard/family")
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    if (loading || !child) {
        return (
            <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <Link
                    href="/dashboard/family"
                    className="inline-flex items-center text-foreground/70 hover:text-foreground mb-6 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Family Hub
                </Link>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-foreground">{child.child_name}</span>
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {child.grade_level && (
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                    {child.grade_level}
                                </Badge>
                            )}
                            {(child.subjects || []).map((s: string) => (
                                <Badge key={s} className="bg-white/10 text-foreground/60 border-white/10 text-xs">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <Button
                            onClick={() => setShowLogForm(!showLogForm)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Log Progress
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="glass-surface border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    {/* Log Progress Form */}
                    {showLogForm && (
                        <ScrollReveal direction="up">
                            <GlassSurface className="p-6 border-emerald-500/30">
                                <h2 className="text-lg font-bold text-foreground mb-4">Log Progress</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-foreground/80 text-sm mb-1 block">Subject *</Label>
                                        <Input
                                            value={logSubject}
                                            onChange={(e) => setLogSubject(e.target.value)}
                                            placeholder="e.g., Math"
                                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-foreground/80 text-sm mb-1 block">Score (%)</Label>
                                        <Input
                                            type="number"
                                            value={logScore}
                                            onChange={(e) => setLogScore(e.target.value)}
                                            placeholder="0-100"
                                            min="0"
                                            max="100"
                                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-foreground/80 text-sm mb-1 block">Time (minutes)</Label>
                                        <Input
                                            type="number"
                                            value={logMinutes}
                                            onChange={(e) => setLogMinutes(e.target.value)}
                                            placeholder="30"
                                            min="0"
                                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-foreground/80 text-sm mb-1 block">Activity</Label>
                                        <Input
                                            value={logActivity}
                                            onChange={(e) => setLogActivity(e.target.value)}
                                            placeholder="e.g., Chapter 5 quiz"
                                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        onClick={handleLogProgress}
                                        disabled={submitting || !logSubject.trim()}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Save Progress
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowLogForm(false)}
                                        className="glass-surface border-foreground/20 text-foreground hover:bg-foreground/10"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </GlassSurface>
                        </ScrollReveal>
                    )}

                    {/* Progress Report */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <GlassSurface className="p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-foreground mb-6">Weekly Progress</h2>
                            <ProgressReport
                                childName={child.child_name}
                                progress={child.recent_progress || []}
                            />
                        </GlassSurface>
                    </ScrollReveal>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <ScrollReveal direction="up" delay={0.2}>
                        <GlassSurface className="p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4">Profile</h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="text-foreground/40 block mb-1">Name</span>
                                    <span className="text-foreground font-medium">{child.child_name}</span>
                                </div>
                                <div>
                                    <span className="text-foreground/40 block mb-1">Grade</span>
                                    <span className="text-foreground font-medium">{child.grade_level || "Not set"}</span>
                                </div>
                                <div>
                                    <span className="text-foreground/40 block mb-1">Subjects</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(child.subjects || []).length > 0 ? (
                                            (child.subjects as string[]).map((s: string) => (
                                                <Badge key={s} className="bg-white/10 text-foreground/60 border-white/10 text-xs">
                                                    {s}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-foreground/40">None selected</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-foreground/40 block mb-1">Added</span>
                                    <span className="text-foreground font-medium">
                                        {new Date(child.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </GlassSurface>
                    </ScrollReveal>
                </div>
            </div>
        </div>
    )
}
