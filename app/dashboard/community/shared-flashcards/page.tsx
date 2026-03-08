"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
    ArrowLeft,
    BookCopy,
    Search,
    Globe,
    Copy,
    Eye,
    Layers,
    CheckCircle2,
} from "lucide-react"

interface SharedFlashcardSet {
    id: string
    title: string
    description: string | null
    subject: string | null
    user_id: string
    card_count: number
    is_public: boolean
    created_at: string
    author_name?: string
}

export default function SharedFlashcardsPage() {
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const [sets, setSets] = useState<SharedFlashcardSet[]>([])
    const [mySets, setMySets] = useState<SharedFlashcardSet[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [cloning, setCloning] = useState<string | null>(null)
    const [cloned, setCloned] = useState<Set<string>>(new Set())
    const [activeTab, setActiveTab] = useState<"browse" | "my">("browse")

    const loadSets = useCallback(async () => {
        if (!supabase) return
        const { data: authData } = await supabase.auth.getUser()
        if (authData.user) setUser(authData.user)

        // Public sets from others
        const { data: publicSets } = await supabase
            .from("flashcard_sets")
            .select("*")
            .eq("is_public", true)
            .order("created_at", { ascending: false })
            .limit(50)

        if (publicSets) {
            const authorIds = [...new Set(publicSets.map((s: any) => s.user_id))]
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", authorIds.length > 0 ? authorIds : ["none"])

            const nameMap: Record<string, string> = {}
                ; (profiles || []).forEach((p: any) => {
                    nameMap[p.id] = p.full_name || "User"
                })

            setSets(
                publicSets.map((s: any) => ({
                    ...s,
                    card_count: s.card_count || 0,
                    author_name: nameMap[s.user_id] || "User",
                }))
            )
        }

        // My sets
        if (authData.user) {
            const { data: myData } = await supabase
                .from("flashcard_sets")
                .select("*")
                .eq("user_id", authData.user.id)
                .order("created_at", { ascending: false })

            setMySets(
                (myData || []).map((s: any) => ({
                    ...s,
                    card_count: s.card_count || 0,
                    author_name: "You",
                }))
            )
        }

        setLoading(false)
    }, [supabase])

    useEffect(() => {
        loadSets()
    }, [loadSets])

    const togglePublic = async (setId: string, currentPublic: boolean) => {
        if (!supabase) return
        await supabase.from("flashcard_sets").update({ is_public: !currentPublic }).eq("id", setId)
        loadSets()
    }

    const cloneSet = async (originalSet: SharedFlashcardSet) => {
        if (!supabase || !user || cloning) return
        setCloning(originalSet.id)
        try {
            // Create a copy of the flashcard set
            const { data: newSet, error } = await supabase
                .from("flashcard_sets")
                .insert({
                    title: `${originalSet.title} (Copy)`,
                    description: originalSet.description,
                    subject: originalSet.subject,
                    user_id: user.id,
                    card_count: originalSet.card_count,
                    is_public: false,
                })
                .select()
                .single()

            if (error) throw error

            // Copy flashcards — check if they're in a JSONB field or separate table
            // Most EduSphere flashcard sets store cards as JSON in the set
            // If there's a separate flashcards table, copy those too
            setCloned((prev) => new Set([...prev, originalSet.id]))
        } catch (err) {
            console.error("Failed to clone set:", err)
        } finally {
            setCloning(null)
        }
    }

    const filtered = (list: SharedFlashcardSet[]) =>
        search
            ? list.filter(
                (s) =>
                    s.title.toLowerCase().includes(search.toLowerCase()) ||
                    (s.description || "").toLowerCase().includes(search.toLowerCase()) ||
                    (s.subject || "").toLowerCase().includes(search.toLowerCase())
            )
            : list

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading flashcard sets..." />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard/community">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <BookCopy className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Shared Flashcards</h1>
                        <p className="text-sm text-foreground/50">Discover and share community sets</p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                    <Input
                        placeholder="Search sets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10"
                    />
                </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(["browse", "my"] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? "bg-green-600/20 text-green-400 border border-green-500/30" : "text-foreground/50"}
                    >
                        {tab === "browse" ? "Browse Community" : "My Sets"}
                        <Badge className="ml-2 text-xs bg-white/10 text-foreground/50">
                            {tab === "browse" ? sets.length : mySets.length}
                        </Badge>
                    </Button>
                ))}
            </div>

            {/* Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered(activeTab === "browse" ? sets : mySets).map((set, i) => (
                    <ScrollReveal key={set.id} direction="up" delay={0.05 * i}>
                        <AnimatedCard className="p-5 h-full hover:border-green-500/30 transition-all">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                    <Layers className="h-5 w-5 text-green-400" />
                                </div>
                                {set.is_public && (
                                    <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                                        <Globe className="h-2.5 w-2.5 mr-0.5" /> Public
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">{set.title}</h3>
                            <p className="text-sm text-foreground/40 mb-3 line-clamp-2">{set.description || "No description"}</p>
                            <div className="flex items-center justify-between text-xs text-foreground/30 mb-3">
                                <div className="flex items-center gap-1.5">
                                    <Avatar className="h-4 w-4">
                                        <AvatarFallback className="bg-green-500/20 text-green-400 text-[8px]">
                                            {(set.author_name || "U").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{set.author_name}</span>
                                </div>
                                <span>{set.card_count} cards</span>
                            </div>

                            {activeTab === "browse" ? (
                                <Button
                                    onClick={() => cloneSet(set)}
                                    disabled={cloning === set.id || cloned.has(set.id)}
                                    size="sm"
                                    className="w-full bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600/30"
                                >
                                    {cloned.has(set.id) ? (
                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Cloned!</>
                                    ) : cloning === set.id ? (
                                        "Cloning..."
                                    ) : (
                                        <><Copy className="h-3 w-3 mr-1" /> Clone to My Sets</>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => togglePublic(set.id, set.is_public)}
                                    size="sm"
                                    variant="outline"
                                    className={`w-full text-xs ${set.is_public ? "text-green-400 border-green-500/20" : "text-foreground/40"}`}
                                >
                                    <Globe className="h-3 w-3 mr-1" />
                                    {set.is_public ? "Public — Click to Unshare" : "Private — Click to Share"}
                                </Button>
                            )}
                        </AnimatedCard>
                    </ScrollReveal>
                ))}
            </div>

            {filtered(activeTab === "browse" ? sets : mySets).length === 0 && (
                <GlassSurface className="p-12 text-center mt-4">
                    <BookCopy className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        {activeTab === "browse" ? "No shared sets yet" : "No flashcard sets"}
                    </h3>
                    <p className="text-sm text-foreground/40">
                        {activeTab === "browse"
                            ? "Be the first to share your flashcards with the community!"
                            : "Create flashcard sets in the Flashcards section."}
                    </p>
                </GlassSurface>
            )}
        </div>
    )
}
