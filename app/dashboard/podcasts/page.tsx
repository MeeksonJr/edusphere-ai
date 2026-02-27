"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Mic,
    Plus,
    Search,
    Trash2,
    Clock,
    Loader2,
    RefreshCw,
    Podcast,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

export default function PodcastsPage() {
    const router = useRouter()
    const { supabase } = useSupabase()
    const { toast } = useToast()
    const [podcasts, setPodcasts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (!supabase) return
        fetchPodcasts()
    }, [supabase, searchQuery])

    // Poll for generating podcasts
    useEffect(() => {
        const generating = podcasts.some((p) => p.status === "generating")
        if (!generating) return
        const interval = setInterval(fetchPodcasts, 5000)
        return () => clearInterval(interval)
    }, [podcasts])

    const fetchPodcasts = async () => {
        if (!supabase) return
        try {
            setLoading(true)
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) return

            let query = (supabase as any)
                .from("podcasts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (searchQuery) {
                query = query.or(
                    `title.ilike.%${searchQuery}%,topic.ilike.%${searchQuery}%`
                )
            }

            const { data, error } = await query
            if (error) throw error
            setPodcasts(data || [])
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load podcasts",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!supabase) return
        try {
            const { error } = await (supabase as any)
                .from("podcasts")
                .delete()
                .eq("id", id)
            if (error) throw error
            setPodcasts((prev) => prev.filter((p) => p.id !== id))
            toast({ title: "Podcast deleted" })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    const formatDuration = (seconds: number) => {
        if (!seconds) return "—"
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const statusBadge = (status: string) => {
        const config: Record<string, { label: string; className: string }> = {
            generating: {
                label: "Generating…",
                className: "bg-amber-500/20 text-amber-300 border-amber-500/30",
            },
            completed: {
                label: "Ready",
                className: "bg-green-500/20 text-green-300 border-green-500/30",
            },
            failed: {
                label: "Failed",
                className: "bg-red-500/20 text-red-300 border-red-500/30",
            },
            pending: {
                label: "Pending",
                className: "bg-gray-500/20 text-gray-300 border-gray-500/30",
            },
        }
        const c = config[status] || config.pending
        return (
            <Badge className={`${c.className} border text-xs`}>{c.label}</Badge>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-foreground">Podcasts</span>
                    </h1>
                    <p className="text-foreground/70">
                        Generate AI-powered educational podcasts on any topic
                    </p>
                </div>
            </ScrollReveal>

            {/* Search + Create */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-4 md:p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40"
                                aria-hidden="true"
                            />
                            <Input
                                placeholder="Search podcasts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                            />
                        </div>
                        <Button
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                            onClick={() => router.push("/dashboard/podcasts/create")}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            New Podcast
                        </Button>
                    </div>
                </GlassSurface>
            </ScrollReveal>

            {/* Podcast grid */}
            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-surface p-6 animate-pulse">
                            <div className="h-6 bg-foreground/10 rounded w-3/4 mb-4" />
                            <div className="h-4 bg-foreground/10 rounded w-1/2 mb-4" />
                            <div className="h-4 bg-foreground/10 rounded w-full" />
                        </div>
                    ))}
                </div>
            ) : podcasts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {podcasts.map((podcast, index) => (
                        <ScrollReveal
                            key={podcast.id}
                            direction="up"
                            delay={0.05 * index}
                        >
                            <AnimatedCard
                                variant="3d"
                                delay={0.05 * index}
                                className="cursor-pointer group"
                            >
                                <div
                                    className="p-6"
                                    onClick={() => {
                                        if (podcast.status === "completed") {
                                            router.push(`/dashboard/podcasts/${podcast.id}`)
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h3 className="text-lg font-bold text-foreground mb-1 truncate group-hover:text-purple-400 transition-colors">
                                                {podcast.title}
                                            </h3>
                                            <p className="text-sm text-foreground/50 truncate">
                                                {podcast.topic}
                                            </p>
                                        </div>
                                        {statusBadge(podcast.status)}
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-foreground/50 mb-4">
                                        {podcast.duration > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(podcast.duration)}
                                            </span>
                                        )}
                                        <span>
                                            {new Date(podcast.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {podcast.status === "generating" && (
                                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Generating podcast...
                                        </div>
                                    )}

                                    {podcast.status === "failed" && (
                                        <p className="text-sm text-red-400">
                                            {podcast.error_message || "Generation failed"}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-foreground/10">
                                        {podcast.status === "completed" ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="glass-surface border-foreground/20 hover:border-purple-500/50 text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    router.push(
                                                        `/dashboard/podcasts/${podcast.id}`
                                                    )
                                                }}
                                            >
                                                <Mic className="mr-2 h-4 w-4" />
                                                Listen
                                            </Button>
                                        ) : podcast.status === "generating" ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="glass-surface border-foreground/20 text-foreground"
                                                disabled
                                            >
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Processing
                                            </Button>
                                        ) : (
                                            <div />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-400 hover:text-red-300"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(podcast.id)
                                            }}
                                            aria-label="Delete podcast"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </ScrollReveal>
                    ))}
                </div>
            ) : (
                <ScrollReveal direction="up">
                    <GlassSurface className="p-12 text-center">
                        <Podcast
                            className="mx-auto h-16 w-16 text-foreground/20 mb-4"
                            aria-hidden="true"
                        />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            No podcasts yet
                        </h3>
                        <p className="text-foreground/60 mb-6">
                            {searchQuery
                                ? "No podcasts match your search."
                                : "Create your first AI-generated educational podcast."}
                        </p>
                        <Button
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                            onClick={() => router.push("/dashboard/podcasts/create")}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                            Create Podcast
                        </Button>
                    </GlassSurface>
                </ScrollReveal>
            )}
        </div>
    )
}
