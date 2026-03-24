"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Sparkles, Podcast, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { VoiceSelector } from "@/components/voice-selector"

export default function CreatePodcastPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [topic, setTopic] = useState("")
    const [duration, setDuration] = useState("short")
    const [speakers, setSpeakers] = useState([
        { id: 1, name: "Host", voiceId: "", provider: "edge-tts" }
    ])
    const [generating, setGenerating] = useState(false)

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({
                title: "Topic required",
                description: "Please enter a topic for your podcast",
                variant: "destructive",
            })
            return
        }

        try {
            setGenerating(true)
            const res = await fetch("/api/podcasts/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic: topic.trim(),
                    duration,
                    speakers: speakers.map(s => ({
                        name: s.name.trim() || `Speaker ${s.id}`,
                        voiceId: s.voiceId || undefined,
                        provider: s.provider || undefined
                    })),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate podcast")
            }

            toast({
                title: "🎙️ Podcast generation started!",
                description: "You'll be redirected to the podcasts page. It may take a minute.",
            })

            router.push("/dashboard/podcasts")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setGenerating(false)
        }
    }

    const topicSuggestions = [
        "The Rise of Artificial Intelligence",
        "Quantum Computing Explained Simply",
        "History of the Internet",
        "How the Human Brain Learns",
        "Climate Change: Causes and Solutions",
        "The Science of Sleep",
        "Introduction to Machine Learning",
        "Space Exploration: Past, Present, Future",
    ]

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
            {/* Back button */}
            <ScrollReveal direction="up">
                <Button
                    variant="ghost"
                    className="text-foreground/60 hover:text-foreground mb-4"
                    onClick={() => router.push("/dashboard/podcasts")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Podcasts
                </Button>
            </ScrollReveal>

            {/* Header */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <Podcast className="h-8 w-8 text-purple-400" />
                        <span className="text-foreground">Create Podcast</span>
                    </h1>
                    <p className="text-foreground/70">
                        Enter a topic and we&apos;ll generate an educational podcast with AI narration
                    </p>
                </div>
            </ScrollReveal>

            {/* Form */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-6 md:p-8 space-y-6">
                    {/* Topic */}
                    <div>
                        <Label htmlFor="topic" className="text-foreground mb-2 block text-sm font-medium">
                            Topic <span className="text-red-400">*</span>
                        </Label>
                        <Textarea
                            id="topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., The Science of Sleep — How our brains process information while we rest"
                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40 resize-none min-h-[80px]"
                            maxLength={500}
                        />
                        <p className="text-xs text-foreground/40 mt-1">
                            {topic.length}/500 characters
                        </p>
                    </div>

                    {/* Topic suggestions */}
                    <div>
                        <p className="text-xs text-foreground/50 mb-2">Suggested topics:</p>
                        <div className="flex flex-wrap gap-2">
                            {topicSuggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setTopic(s)}
                                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <Label className="text-foreground mb-2 block text-sm font-medium">
                            Duration
                        </Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger className="glass-surface border-foreground/20 text-foreground w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-surface border-foreground/20">
                                <SelectItem value="short" className="text-foreground">
                                    Short (~2-3 min)
                                </SelectItem>
                                <SelectItem value="medium" className="text-foreground">
                                    Medium (~5-7 min)
                                </SelectItem>
                                <SelectItem value="long" className="text-foreground">
                                    Long (~10-15 min)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Speakers Configuration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-foreground text-sm font-medium">
                                Speakers ({speakers.length}/5)
                            </Label>
                            {speakers.length < 5 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-purple-500/30 hover:bg-purple-500/10 text-purple-300"
                                    onClick={() => setSpeakers([...speakers, { id: Date.now(), name: `Guest ${speakers.length}`, voiceId: "", provider: "edge-tts" }])}
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Speaker
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            {speakers.map((speaker, index) => (
                                <div key={speaker.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-purple-300">Speaker {index + 1}</h4>
                                        {speakers.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                onClick={() => setSpeakers(speakers.filter(s => s.id !== speaker.id))}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <Label className="text-foreground/70 mb-1 block text-xs">Name / Role</Label>
                                        <Input
                                            value={speaker.name}
                                            onChange={(e) => {
                                                const newSpeakers = [...speakers]
                                                newSpeakers[index].name = e.target.value
                                                setSpeakers(newSpeakers)
                                            }}
                                            placeholder="e.g. Dr. Sarah (Expert)"
                                            className="glass-surface border-foreground/20 text-white h-9"
                                        />
                                    </div>

                                    <div>
                                        <VoiceSelector
                                            selectedVoice={speaker.voiceId}
                                            onVoiceChange={(id, provider) => {
                                                const newSpeakers = [...speakers]
                                                newSpeakers[index].voiceId = id
                                                newSpeakers[index].provider = provider
                                                setSpeakers(newSpeakers)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={generating || !topic.trim()}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-6 text-lg disabled:opacity-50"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Podcast...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Generate Podcast
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-foreground/40 text-center">
                        Podcast generation typically takes 30-60 seconds depending on length
                    </p>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
