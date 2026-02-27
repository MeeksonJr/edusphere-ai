"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Plus, Key, Copy, Trash2, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

export default function ApiKeysPage() {
    const { toast } = useToast()
    const [keys, setKeys] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [keyName, setKeyName] = useState("")
    const [includeWrite, setIncludeWrite] = useState(false)
    const [newRawKey, setNewRawKey] = useState<string | null>(null)
    const [copiedKey, setCopiedKey] = useState(false)

    const fetchKeys = async () => {
        try {
            const res = await fetch("/api/developer")
            const data = await res.json()
            if (res.ok) setKeys(data.keys || [])
        } catch {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchKeys() }, [])

    const handleCreate = async () => {
        try {
            setCreating(true)
            const scopes = includeWrite ? ["read", "write"] : ["read"]
            const res = await fetch("/api/developer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    name: keyName.trim() || "Default",
                    scopes,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setNewRawKey(data.key.raw_key)
            toast({ title: "🔑 API key created!" })
            fetchKeys()
            setShowCreateForm(false)
            setKeyName("")
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setCreating(false)
        }
    }

    const handleRevoke = async (keyId: string) => {
        if (!confirm("Revoke this API key? This cannot be undone.")) return

        try {
            const res = await fetch("/api/developer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "revoke", keyId }),
            })
            if (!res.ok) throw new Error("Failed to revoke key")
            toast({ title: "Key revoked" })
            fetchKeys()
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const copyKey = async () => {
        if (newRawKey) {
            await navigator.clipboard.writeText(newRawKey)
            setCopiedKey(true)
            setTimeout(() => setCopiedKey(false), 2000)
        }
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
            <ScrollReveal direction="up">
                <Link
                    href="/dashboard/developer"
                    className="inline-flex items-center text-foreground/70 hover:text-foreground mb-6 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Developer Console
                </Link>

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                                API Keys
                            </span>
                        </h1>
                        <p className="text-foreground/60 mt-1">Manage your API authentication keys</p>
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Key
                    </Button>
                </div>
            </ScrollReveal>

            {/* New Key Reveal */}
            {newRawKey && (
                <ScrollReveal direction="up">
                    <GlassSurface className="p-6 mb-6 border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-start gap-3">
                            <Key className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-amber-400 mb-1">Save your API key now!</h3>
                                <p className="text-xs text-foreground/50 mb-3">This key will only be shown once. Copy it and store it securely.</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm bg-black/30 rounded-lg px-3 py-2 text-emerald-300 font-mono break-all">
                                        {newRawKey}
                                    </code>
                                    <Button onClick={copyKey} size="sm" variant="outline" className="glass-surface border-foreground/20 flex-shrink-0">
                                        {copiedKey ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => setNewRawKey(null)}
                            variant="outline"
                            size="sm"
                            className="mt-4 glass-surface border-foreground/20 text-foreground"
                        >
                            I&apos;ve saved my key
                        </Button>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <ScrollReveal direction="up">
                    <GlassSurface className="p-6 mb-6">
                        <h3 className="text-lg font-bold text-foreground mb-4">Create New API Key</h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-foreground/80 text-sm mb-1 block">Key Name</Label>
                                <Input
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="e.g., My App"
                                    className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                                    maxLength={50}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIncludeWrite(!includeWrite)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${includeWrite
                                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                            : "bg-white/5 border-white/10 text-foreground/60"
                                        }`}
                                >
                                    Write Access
                                </button>
                                <span className="text-xs text-foreground/40">
                                    {includeWrite ? "Can read & generate content" : "Read-only access"}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleCreate}
                                    disabled={creating}
                                    className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                                    Create Key
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                    className="glass-surface border-foreground/20 text-foreground"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Key List */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Your Keys</h2>
                    {keys.length === 0 ? (
                        <div className="text-center py-8">
                            <Key className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                            <p className="text-foreground/50">No API keys yet. Create one to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {keys.map((k: any) => (
                                <div key={k.id} className={`p-4 rounded-lg border transition-colors ${k.revoked ? "bg-white/2 border-white/5 opacity-60" : "bg-white/5 border-white/10"}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-foreground">{k.name}</span>
                                                <Badge className={k.revoked ? "bg-red-500/20 text-red-400 border-red-500/30 text-xs" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"}>
                                                    {k.revoked ? "Revoked" : "Active"}
                                                </Badge>
                                                {k.scopes?.includes("write") && (
                                                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">write</Badge>
                                                )}
                                            </div>
                                            <code className="text-xs text-foreground/40 font-mono">{k.key_prefix}</code>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4">
                                            <span className="text-xs text-foreground/40">{k.usage_24h || 0} calls/24h</span>
                                            {!k.revoked && (
                                                <Button
                                                    onClick={() => handleRevoke(k.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-4 text-xs text-foreground/30">
                                        <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                                        {k.last_used_at && (
                                            <span>Last used {new Date(k.last_used_at).toLocaleDateString()}</span>
                                        )}
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
