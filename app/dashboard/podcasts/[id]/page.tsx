"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, Download, Loader2, Podcast, AlertCircle } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { PodcastPlayer } from "@/components/podcast-player"

export default function PodcastDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { supabase } = useSupabase()
    const { toast } = useToast()
    const [podcast, setPodcast] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const podcastId = params?.id as string

    useEffect(() => {
        if (!supabase || !podcastId) return
        fetchPodcast()
    }, [supabase, podcastId])

    // Poll while generating
    useEffect(() => {
        if (!podcast || podcast.status !== "generating") return
        const interval = setInterval(fetchPodcast, 5000)
        return () => clearInterval(interval)
    }, [podcast?.status])

    const fetchPodcast = async () => {
        if (!supabase) return
        try {
            const { data, error } = await (supabase as any)
                .from("podcasts")
                .select("*")
                .eq("id", podcastId)
                .single()

            if (error) throw error
            setPodcast(data)
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load podcast",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!podcast?.audio_url) return
        const a = document.createElement("a")
        a.href = podcast.audio_url
        a.download = `${podcast.title.replace(/\s+/g, "-").toLowerCase()}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast({ title: "Link copied to clipboard" })
        } catch {
            toast({ title: "Failed to copy link", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
        )
    }

    if (!podcast) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <GlassSurface className="p-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                        Podcast not found
                    </h2>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/podcasts")}
                        className="mt-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Podcasts
                    </Button>
                </GlassSurface>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
            {/* Back */}
            <ScrollReveal direction="up">
                <Button
                    variant="ghost"
                    className="text-foreground/60 hover:text-foreground mb-6"
                    onClick={() => router.push("/dashboard/podcasts")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Podcasts
                </Button>
            </ScrollReveal>

            {/* Header */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="mb-8">
                    <div className="flex items-start gap-4 mb-2">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20">
                            <Podcast className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 break-words">
                                {podcast.title}
                            </h1>
                            <p className="text-foreground/50 text-sm">
                                {new Date(podcast.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                                {podcast.duration > 0 &&
                                    ` · ${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, "0")}`}
                            </p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Generating state */}
            {podcast.status === "generating" && (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-8 text-center mb-6">
                        <Loader2 className="mx-auto h-10 w-10 text-purple-400 animate-spin mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Generating your podcast...
                        </h3>
                        <p className="text-foreground/60 text-sm">
                            AI is writing the script and generating audio. This usually takes 30-60 seconds.
                        </p>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Failed state */}
            {podcast.status === "failed" && (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-8 text-center mb-6">
                        <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Generation failed
                        </h3>
                        <p className="text-red-400/80 text-sm">
                            {podcast.error_message || "Something went wrong during generation."}
                        </p>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Player + controls */}
            {podcast.status === "completed" && podcast.audio_url && (
                <ScrollReveal direction="up" delay={0.1}>
                    <PodcastPlayer
                        audioUrl={podcast.audio_url}
                        title={podcast.title}
                        duration={podcast.duration}
                        script={podcast.script}
                        className="mb-6"
                    />

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="glass-surface border-foreground/20 text-foreground hover:bg-foreground/10"
                            onClick={handleDownload}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                        <Button
                            variant="outline"
                            className="glass-surface border-foreground/20 text-foreground hover:bg-foreground/10"
                            onClick={handleShare}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </ScrollReveal>
            )}

            {/* Full transcript */}
            {podcast.script && podcast.status === "completed" && (
                <ScrollReveal direction="up" delay={0.15}>
                    <GlassSurface className="p-6 md:p-8 mt-8">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Full Transcript
                        </h2>
                        <div className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap">
                            {podcast.script}
                        </div>
                    </GlassSurface>
                </ScrollReveal>
            )}
        </div>
    )
}
