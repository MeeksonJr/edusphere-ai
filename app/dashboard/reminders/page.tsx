"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { CalendarClock, Sparkles, BrainCircuit, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function RemindersPage() {
    const { supabase } = useSupabase()
    const [schedule, setSchedule] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState("Student")

    useEffect(() => {
        async function loadProfile() {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
                if (data?.full_name) {
                    setUserName(data.full_name.split(" ")[0])
                } else if (user.email) {
                    setUserName(user.email.split("@")[0])
                }
            }
        }
        loadProfile()
    }, [supabase])

    const fetchSchedule = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/reminders")
            if (res.ok) {
                const data = await res.json()
                setSchedule(data.schedule)
            } else {
                setSchedule("Failed to generate schedule. Please try again later.")
            }
        } catch (error) {
            console.error(error)
            setSchedule("An error occurred while computing your schedule.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchedule()
    }, [])

    return (
        <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                        <CalendarClock className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Smart Study Reminders
                        </h1>
                        <p className="text-gray-400 mt-1">AI-powered schedule generated from your courses and assignments.</p>
                    </div>
                </div>

                <Button 
                    onClick={fetchSchedule} 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all w-full md:w-auto"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? "Computing..." : "Regenerate Plan"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left col: Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-2xl border border-indigo-500/20 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4 relative z-10">
                            <Sparkles className="h-5 w-5 text-indigo-400" />
                            How it works
                        </h3>
                        <ul className="space-y-4 relative z-10">
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-gray-900 rounded-full p-1 border border-gray-800">
                                    <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Our AI agent analyzes your active courses and upcoming assignment deadlines.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-gray-900 rounded-full p-1 border border-gray-800">
                                    <Clock className="h-3.5 w-3.5 text-purple-400" />
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    It blocks out optimal times for deep work using the Pomodoro technique.
                                </p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="mt-0.5 bg-gray-900 rounded-full p-1 border border-gray-800">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    Prioritizes urgent tasks so you never miss a deadline.
                                </p>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                        {/* Decorative background circle */}
                        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Daily Habit Tip</h3>
                        <p className="text-gray-200 italic leading-relaxed relative z-10">
                            "Reviewing your personalized study plan every morning before checking emails or social media can increase your daily productivity by up to 30%."
                        </p>
                    </div>
                </div>

                {/* Right col: The AI Plan */}
                <div className="lg:col-span-2">
                    <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/60 p-1 shadow-2xl">
                        <div className="bg-gradient-to-b from-gray-800/40 to-gray-900/40 rounded-[1.4rem] border border-white/5 p-6 md:p-8 min-h-[500px] relative">
                            {/* Decorative header */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-[1.4rem] opacity-50" />
                            
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
                                        <BrainCircuit className="h-16 w-16 text-indigo-400 animate-pulse relative z-10" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-gray-200">Analyzing your workload...</h3>
                                        <p className="text-gray-400 text-sm">Building the optimal study schedule for <strong>{userName}</strong>.</p>
                                    </div>
                                    <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden mt-4">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-1/2 rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-invert prose-indigo max-w-none">
                                    <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-gray-800/50 flex items-center gap-3">
                                        <span className="bg-indigo-500/20 text-indigo-300 p-2 rounded-xl border border-indigo-500/30">
                                            <CalendarClock className="h-5 w-5" />
                                        </span>
                                        Your Personalized Plan
                                    </h2>
                                    
                                    <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: (props: any) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 section-heading" {...props} />,
                                                h2: (props: any) => <h2 className="text-xl font-bold text-indigo-300 mt-6 mb-3" {...props} />,
                                                h3: (props: any) => <h3 className="text-lg font-semibold text-purple-300 mt-4 mb-2" {...props} />,
                                                ul: (props: any) => <ul className="space-y-2 my-4 ml-4" {...props} />,
                                                li: (props: any) => (
                                                    <li className="flex items-start">
                                                        <span className="text-indigo-500 mr-2 mt-0.5">•</span>
                                                        <span {...props} />
                                                    </li>
                                                ),
                                                p: (props: any) => <p className="mb-4 text-gray-300" {...props} />,
                                                strong: (props: any) => <strong className="font-bold text-white bg-white/5 px-1 rounded" {...props} />,
                                            }}
                                        >
                                            {schedule}
                                        </ReactMarkdown>
                                    </div>
                                    
                                    <div className="mt-12 pt-6 border-t border-gray-800/50 flex items-center justify-between text-xs text-gray-500">
                                        <p>Generated by EduSphere AI</p>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Live sync active
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
