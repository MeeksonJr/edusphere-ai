"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Mic,
    ArrowLeft,
    GraduationCap,
    Brain,
    Languages,
    BookOpen,
    Sparkles,
    Briefcase,
    Loader2,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { VoiceTutor } from "@/components/voice-tutor"

type SessionType =
    | "tutor"
    | "quiz_practice"
    | "language"
    | "explainer"
    | "study_buddy"
    | "interview_prep"

const SESSION_TYPES = [
    {
        id: "tutor" as SessionType,
        name: "1-on-1 Tutor",
        icon: GraduationCap,
        desc: "Personal AI tutor adapts to your level",
        color: "from-cyan-500 to-blue-500",
    },
    {
        id: "quiz_practice" as SessionType,
        name: "Quiz Practice",
        icon: Brain,
        desc: "Test your knowledge with AI quizzes",
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "language" as SessionType,
        name: "Language Partner",
        icon: Languages,
        desc: "Practice speaking any language",
        color: "from-emerald-500 to-teal-500",
    },
    {
        id: "explainer" as SessionType,
        name: "Concept Explainer",
        icon: BookOpen,
        desc: "Break down complex topics simply",
        color: "from-amber-500 to-orange-500",
    },
    {
        id: "study_buddy" as SessionType,
        name: "Study Buddy",
        icon: Sparkles,
        desc: "Casual study companion",
        color: "from-pink-500 to-rose-500",
    },
    {
        id: "interview_prep" as SessionType,
        name: "Interview Prep",
        icon: Briefcase,
        desc: "Mock interviews with AI feedback",
        color: "from-indigo-500 to-violet-500",
    },
]

export default function VoiceTutoringPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                </div>
            }
        >
            <VoiceTutoringContent />
        </Suspense>
    )
}

function VoiceTutoringContent() {
    const router = useRouter()
    const [selectedType, setSelectedType] = useState<SessionType | null>(null)
    const [topic, setTopic] = useState("")
    const [sessionStarted, setSessionStarted] = useState(false)

    // --- Session selection ---
    if (!selectedType) {
        return (
            <div className="relative min-h-[calc(100vh-4rem)]">
                <AmbientBackground />
                <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-4">
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 mb-4">
                            <Mic className="h-3 w-3" />
                            Voice Mode
                        </div>
                        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Voice Tutoring
                        </h1>
                        <p className="text-foreground/60 mt-2 max-w-md mx-auto">
                            Speak naturally with your AI tutor. Uses browser
                            speech recognition and text-to-speech for a
                            conversational experience.
                        </p>
                    </div>

                    {/* Session types grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SESSION_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className="group text-left p-6 rounded-2xl glass-surface border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                                >
                                    <type.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">
                                    {type.name}
                                </h3>
                                <p className="text-sm text-foreground/50">
                                    {type.desc}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Back to Live AI link */}
                    <div className="text-center">
                        <Link
                            href="/dashboard/ai-tutor"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground/50 hover:text-foreground hover:border-cyan-500/30 transition-all text-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Switch to Live AI (Gemini Live)
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // --- Topic input ---
    if (!sessionStarted) {
        const config = SESSION_TYPES.find((t) => t.id === selectedType)!
        return (
            <div className="relative min-h-[calc(100vh-4rem)]">
                <AmbientBackground />
                <div className="relative z-10 max-w-xl mx-auto space-y-6 p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedType(null)}
                            className="text-foreground/50 hover:text-foreground transition-colors"
                        >
                            ← Back
                        </button>
                        <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}
                        >
                            <config.icon className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-semibold">{config.name}</h2>
                    </div>

                    <GlassSurface className="p-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            What topic would you like to discuss? (optional)
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={
                                selectedType === "language"
                                    ? 'e.g., "Practice conversational Spanish"'
                                    : selectedType === "interview_prep"
                                        ? 'e.g., "React frontend developer interview"'
                                        : 'e.g., "Help me understand photosynthesis"'
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-foreground placeholder:text-foreground/30 transition-colors"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") setSessionStarted(true)
                            }}
                        />
                        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-foreground/40 space-y-1">
                            <p>
                                💡 <strong>How it works:</strong>
                            </p>
                            <p>
                                1. Click the{" "}
                                <span className="text-cyan-400">
                                    microphone
                                </span>{" "}
                                button to speak (or type)
                            </p>
                            <p>
                                2. AI processes your question via Gemini
                            </p>
                            <p>
                                3. Response is read aloud via
                                text-to-speech
                            </p>
                        </div>
                        <button
                            onClick={() => setSessionStarted(true)}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 h-12 text-base rounded-xl font-medium flex items-center justify-center gap-2"
                        >
                            <Mic className="h-5 w-5" />
                            Start Voice Session
                        </button>
                    </GlassSurface>
                </div>
            </div>
        )
    }

    // --- Active session ---
    const config = SESSION_TYPES.find((t) => t.id === selectedType)!
    return (
        <div className="relative h-[calc(100vh-4rem)] flex flex-col">
            <AmbientBackground />
            <div className="relative z-10 flex flex-col h-full max-w-3xl mx-auto w-full">
                {/* Session header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setSessionStarted(false)
                                setSelectedType(null)
                                setTopic("")
                            }}
                            className="text-foreground/50 hover:text-foreground transition-colors text-sm"
                        >
                            ← End
                        </button>
                        <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}
                        >
                            <config.icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-medium">
                                {config.name}
                            </span>
                            {topic && (
                                <span className="text-xs text-foreground/40 ml-2">
                                    — {topic}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-foreground/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                    </div>
                </div>

                {/* Voice tutor component */}
                <VoiceTutor
                    sessionType={selectedType}
                    topic={topic}
                    className="flex-1 min-h-0"
                />
            </div>
        </div>
    )
}
