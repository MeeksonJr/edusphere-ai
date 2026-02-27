"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Code2, Key, BookOpen, Activity, TrendingUp, Shield } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Badge } from "@/components/ui/badge"

export default function DeveloperConsolePage() {
    const router = useRouter()
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const res = await fetch("/api/developer")
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error)
                    return
                }

                setKeys(data.keys || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchKeys()
    }, [])

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    const activeKeys = keys.filter((k) => !k.revoked)
    const totalUsage24h = keys.reduce((sum, k) => sum + (k.usage_24h || 0), 0)

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 text-transparent bg-clip-text">
                                Developer Console
                            </span>
                        </h1>
                        <p className="text-foreground/60">
                            Build integrations with the EduSphere API
                        </p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <GlassSurface className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Key className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{activeKeys.length}</p>
                                <p className="text-xs text-foreground/40">Active Keys</p>
                            </div>
                        </div>
                    </GlassSurface>
                    <GlassSurface className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{totalUsage24h}</p>
                                <p className="text-xs text-foreground/40">Requests (24h)</p>
                            </div>
                        </div>
                    </GlassSurface>
                    <GlassSurface className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">100</p>
                                <p className="text-xs text-foreground/40">Daily Limit</p>
                            </div>
                        </div>
                    </GlassSurface>
                </div>
            </ScrollReveal>

            {/* Quick Links */}
            <ScrollReveal direction="up" delay={0.1}>
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <Link href="/dashboard/developer/keys">
                        <GlassSurface className="p-6 hover:bg-white/10 transition-colors cursor-pointer group h-full">
                            <Key className="h-8 w-8 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-foreground mb-1">API Keys</h3>
                            <p className="text-sm text-foreground/50">Create and manage your API keys</p>
                        </GlassSurface>
                    </Link>
                    <Link href="/dashboard/developer/docs">
                        <GlassSurface className="p-6 hover:bg-white/10 transition-colors cursor-pointer group h-full">
                            <BookOpen className="h-8 w-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-foreground mb-1">API Docs</h3>
                            <p className="text-sm text-foreground/50">Interactive endpoint documentation</p>
                        </GlassSurface>
                    </Link>
                    <GlassSurface className="p-6 h-full">
                        <TrendingUp className="h-8 w-8 text-purple-400 mb-3" />
                        <h3 className="text-lg font-bold text-foreground mb-1">Usage</h3>
                        <p className="text-sm text-foreground/50">
                            {totalUsage24h > 0
                                ? `${totalUsage24h} calls today — ${100 - totalUsage24h} remaining`
                                : "No API calls yet today"}
                        </p>
                    </GlassSurface>
                </div>
            </ScrollReveal>

            {/* Recent Keys */}
            <ScrollReveal direction="up" delay={0.15}>
                <GlassSurface className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-foreground">Your API Keys</h2>
                        <Link href="/dashboard/developer/keys">
                            <Button variant="outline" size="sm" className="glass-surface border-foreground/20 text-foreground hover:bg-foreground/10">
                                Manage Keys
                            </Button>
                        </Link>
                    </div>
                    {keys.length === 0 ? (
                        <div className="text-center py-8">
                            <Key className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-foreground/50 mb-4">No API keys yet</p>
                            <Link href="/dashboard/developer/keys">
                                <Button className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white">
                                    Create Your First Key
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {keys.slice(0, 3).map((k: any) => (
                                <div key={k.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <code className="text-sm text-foreground/60 font-mono">{k.key_prefix}</code>
                                        <span className="text-sm text-foreground/80">{k.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={k.revoked ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}>
                                            {k.revoked ? "Revoked" : "Active"}
                                        </Badge>
                                        <span className="text-xs text-foreground/40">{k.usage_24h || 0} calls</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
