"use client"

import { useState, useEffect } from "react"
import {
    Sparkles,
    User,
    BookOpen,
    Target,
    GraduationCap,
    Brain,
    Clock,
    ChevronRight,
    ChevronLeft,
    Rocket,
    BarChart3,
    Bot,
    Award,
    Flame,
    StickyNote,
    Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const SUBJECTS = [
    { value: "mathematics", label: "Mathematics", emoji: "📐" },
    { value: "physics", label: "Physics", emoji: "⚛️" },
    { value: "chemistry", label: "Chemistry", emoji: "🧪" },
    { value: "biology", label: "Biology", emoji: "🧬" },
    { value: "computer_science", label: "Computer Science", emoji: "💻" },
    { value: "history", label: "History", emoji: "📜" },
    { value: "literature", label: "Literature", emoji: "📖" },
    { value: "economics", label: "Economics", emoji: "📊" },
    { value: "psychology", label: "Psychology", emoji: "🧠" },
    { value: "languages", label: "Languages", emoji: "🌍" },
    { value: "art", label: "Art & Design", emoji: "🎨" },
    { value: "music", label: "Music", emoji: "🎵" },
]

const GOALS = [
    { value: "ace_exams", label: "Ace My Exams", emoji: "🎯" },
    { value: "learn_new", label: "Learn Something New", emoji: "🌱" },
    { value: "career", label: "Advance My Career", emoji: "🚀" },
    { value: "curiosity", label: "Just Curious", emoji: "🔍" },
]

const PACES = [
    { value: "casual", label: "Casual", desc: "10-15 min/day", emoji: "🌿" },
    { value: "steady", label: "Steady", desc: "30-45 min/day", emoji: "⚡" },
    { value: "intensive", label: "Intensive", desc: "1-2 hrs/day", emoji: "🔥" },
]

const FEATURES = [
    { icon: BookOpen, title: "AI Courses", desc: "Generate complete courses on any topic instantly", color: "text-cyan-400" },
    { icon: Bot, title: "AI Tutor", desc: "Talk to a live AI tutor for personalized help", color: "text-purple-400" },
    { icon: Brain, title: "Flashcards", desc: "Create and study smart flashcard decks", color: "text-pink-400" },
    { icon: BarChart3, title: "Analytics", desc: "Track your progress with detailed insights", color: "text-emerald-400" },
    { icon: Flame, title: "Streaks & XP", desc: "Stay motivated with gamification rewards", color: "text-orange-400" },
    { icon: Award, title: "Certificates", desc: "Earn verifiable certificates as you learn", color: "text-amber-400" },
]

interface OnboardingData {
    displayName: string
    subjects: string[]
    goal: string
    pace: string
}

export function OnboardingModal() {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(0)
    const [data, setData] = useState<OnboardingData>({
        displayName: "",
        subjects: [],
        goal: "",
        pace: "",
    })

    useEffect(() => {
        const hasOnboarded = localStorage.getItem("edusphere-onboarding-completed")
        if (!hasOnboarded) {
            const timer = setTimeout(() => setOpen(true), 800)
            return () => clearTimeout(timer)
        }
    }, [])

    const toggleSubject = (s: string) => {
        setData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(s)
                ? prev.subjects.filter(x => x !== s)
                : [...prev.subjects, s],
        }))
    }

    const handleComplete = async () => {
        localStorage.setItem("edusphere-onboarding-completed", "true")

        // Save preferences to user settings
        try {
            await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    onboarding: {
                        completed: true,
                        completedAt: new Date().toISOString(),
                        displayName: data.displayName,
                        subjects: data.subjects,
                        goal: data.goal,
                        pace: data.pace,
                    },
                }),
            })

            // Update profile display name if set
            if (data.displayName.trim()) {
                await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ display_name: data.displayName.trim() }),
                })
            }
        } catch (err) {
            console.error("Failed to save onboarding data:", err)
        }

        setOpen(false)
    }

    const totalSteps = 4
    const canNext =
        step === 0 ? true :
            step === 1 ? data.subjects.length > 0 :
                step === 2 ? data.goal && data.pace :
                    true

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-background/95 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Progress bar */}
                <div className="h-1 bg-white/[0.05]">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Step 0: Welcome */}
                            {step === 0 && (
                                <div className="text-center">
                                    <div className="mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-4 rounded-2xl mb-5 w-fit">
                                        <Sparkles className="h-10 w-10 text-cyan-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to EduSphere AI</h2>
                                    <p className="text-foreground/50 text-sm mb-6">
                                        Let's personalize your learning experience. This takes less than a minute.
                                    </p>
                                    <div className="max-w-xs mx-auto">
                                        <label className="text-xs text-foreground/40 block text-left mb-1.5">What should we call you?</label>
                                        <Input
                                            value={data.displayName}
                                            onChange={(e) => setData(d => ({ ...d, displayName: e.target.value }))}
                                            placeholder="Enter your name"
                                            className="bg-white/[0.03] border-white/[0.1] text-center"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Subjects */}
                            {step === 1 && (
                                <div>
                                    <div className="text-center mb-5">
                                        <div className="mx-auto bg-purple-500/20 p-3 rounded-xl mb-3 w-fit">
                                            <BookOpen className="h-7 w-7 text-purple-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">What do you want to learn?</h2>
                                        <p className="text-foreground/40 text-xs">Select all that interest you</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {SUBJECTS.map(s => (
                                            <button
                                                key={s.value}
                                                onClick={() => toggleSubject(s.value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center",
                                                    data.subjects.includes(s.value)
                                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                                        : "bg-white/[0.02] border-white/[0.06] text-foreground/50 hover:bg-white/[0.04]"
                                                )}
                                            >
                                                <span className="text-lg">{s.emoji}</span>
                                                <span className="text-[11px] font-medium leading-tight">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Goals & Pace */}
                            {step === 2 && (
                                <div>
                                    <div className="text-center mb-5">
                                        <div className="mx-auto bg-emerald-500/20 p-3 rounded-xl mb-3 w-fit">
                                            <Target className="h-7 w-7 text-emerald-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">Set your learning style</h2>
                                        <p className="text-foreground/40 text-xs">We'll tailor your experience</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-foreground/40 block mb-2">What's your primary goal?</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {GOALS.map(g => (
                                                    <button
                                                        key={g.value}
                                                        onClick={() => setData(d => ({ ...d, goal: g.value }))}
                                                        className={cn(
                                                            "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                                                            data.goal === g.value
                                                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                                : "bg-white/[0.02] border-white/[0.06] text-foreground/50 hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <span className="text-lg">{g.emoji}</span>
                                                        <span className="text-xs font-medium">{g.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-foreground/40 block mb-2">How much time can you commit?</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {PACES.map(p => (
                                                    <button
                                                        key={p.value}
                                                        onClick={() => setData(d => ({ ...d, pace: p.value }))}
                                                        className={cn(
                                                            "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                                                            data.pace === p.value
                                                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                                                : "bg-white/[0.02] border-white/[0.06] text-foreground/50 hover:bg-white/[0.04]"
                                                        )}
                                                    >
                                                        <span className="text-lg">{p.emoji}</span>
                                                        <span className="text-xs font-medium">{p.label}</span>
                                                        <span className="text-[10px] text-foreground/30">{p.desc}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Feature Tour + Ready */}
                            {step === 3 && (
                                <div>
                                    <div className="text-center mb-5">
                                        <div className="mx-auto bg-amber-500/20 p-3 rounded-xl mb-3 w-fit">
                                            <Rocket className="h-7 w-7 text-amber-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground mb-1">You're all set!</h2>
                                        <p className="text-foreground/40 text-xs">Here's what you can explore</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {FEATURES.map((f, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                                            >
                                                <f.icon className={cn("h-5 w-5 mt-0.5 shrink-0", f.color)} />
                                                <div>
                                                    <h4 className="text-xs font-semibold text-foreground">{f.title}</h4>
                                                    <p className="text-[10px] text-foreground/40 leading-tight mt-0.5">{f.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-white/[0.06]">
                    <div className="flex gap-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    i === step ? "bg-cyan-400 w-6" : i < step ? "bg-cyan-400/40" : "bg-white/[0.1]"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {step > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStep(s => s - 1)}
                                className="text-foreground/50 gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        )}

                        {step === 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { localStorage.setItem("edusphere-onboarding-completed", "true"); setOpen(false) }}
                                className="text-foreground/30 text-xs"
                            >
                                Skip
                            </Button>
                        )}

                        {step < totalSteps - 1 ? (
                            <Button
                                size="sm"
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canNext}
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={handleComplete}
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 gap-1"
                            >
                                <Rocket className="h-4 w-4" />
                                Start Learning!
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
