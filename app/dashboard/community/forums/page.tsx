"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
    ArrowLeft,
    Search,
    Plus,
    MessageSquare,
    ArrowUp,
    CheckCircle2,
    Clock,
    Filter,
} from "lucide-react"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { ForumPostCard } from "@/components/forum-post-card"

interface ForumPost {
    id: string
    title: string
    body: string
    author_id: string
    subject: string | null
    tags: string[]
    upvotes: number
    downvotes: number
    reply_count: number
    is_pinned: boolean
    is_solved: boolean
    created_at: string
    author_name?: string
}

export default function ForumsPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [posts, setPosts] = useState<ForumPost[]>([])
    const [search, setSearch] = useState("")
    const [subject, setSubject] = useState("")
    const [sort, setSort] = useState<"recent" | "popular" | "unanswered">("recent")
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)

    const subjects = [
        "Mathematics", "Science", "English", "History", "Computer Science",
        "Physics", "Chemistry", "Biology", "General",
    ]

    const loadPosts = useCallback(async () => {
        if (!supabase) return
        const { data: authData } = await supabase.auth.getUser()
        if (authData.user) setUser(authData.user)

        let query = supabase
            .from("forum_posts")
            .select("*")

        if (subject) query = query.eq("subject", subject)
        if (sort === "popular") query = query.order("upvotes", { ascending: false })
        else if (sort === "unanswered") query = query.eq("reply_count", 0).order("created_at", { ascending: false })
        else query = query.order("created_at", { ascending: false })

        query = query.limit(50)

        const { data } = await query
        if (data) {
            // Load author names
            const authorIds = [...new Set(data.map((p: any) => p.author_id))]
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", authorIds)

            const nameMap: Record<string, string> = {}
                ; (profiles || []).forEach((p: any) => {
                    nameMap[p.id] = p.full_name || "User"
                })

            setPosts(data.map((p: any) => ({ ...p, author_name: nameMap[p.author_id] || "User" })))
        }
        setLoading(false)
    }, [supabase, subject, sort])

    useEffect(() => {
        loadPosts()
    }, [loadPosts])

    const filteredPosts = search
        ? posts.filter(
            (p) =>
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.body.toLowerCase().includes(search.toLowerCase())
        )
        : posts

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading forums..." />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/community">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Community Forums</h1>
                            <p className="text-sm text-foreground/50">Ask questions, share knowledge</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreate(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                        <Plus className="h-4 w-4 mr-2" /> New Post
                    </Button>
                </div>
            </ScrollReveal>

            {/* Search + Filters */}
            <ScrollReveal direction="up" delay={0.1}>
                <div className="flex flex-col gap-3 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                        <Input
                            placeholder="Search posts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Sort buttons */}
                        {([
                            { key: "recent", label: "Recent", icon: Clock },
                            { key: "popular", label: "Popular", icon: ArrowUp },
                            { key: "unanswered", label: "Unanswered", icon: MessageSquare },
                        ] as const).map((s) => (
                            <Button
                                key={s.key}
                                variant={sort === s.key ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setSort(s.key)}
                                className={sort === s.key ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-foreground/40"}
                            >
                                <s.icon className="h-3 w-3 mr-1" /> {s.label}
                            </Button>
                        ))}
                        <div className="w-px h-6 bg-white/10 self-center mx-1" />
                        {/* Subject filters */}
                        <Button
                            variant={!subject ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSubject("")}
                            className={!subject ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-foreground/40"}
                        >
                            All
                        </Button>
                        {subjects.map((s) => (
                            <Button
                                key={s}
                                variant={subject === s ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setSubject(subject === s ? "" : s)}
                                className={subject === s ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "text-foreground/40"}
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                </div>
            </ScrollReveal>

            {/* Posts */}
            <div className="space-y-3">
                {filteredPosts.map((post, i) => (
                    <ScrollReveal key={post.id} direction="up" delay={0.05 * i}>
                        <ForumPostCard
                            post={post}
                            onClick={() => router.push(`/dashboard/community/forums/${post.id}`)}
                        />
                    </ScrollReveal>
                ))}
            </div>

            {filteredPosts.length === 0 && (
                <GlassSurface className="p-12 text-center mt-4">
                    <MessageSquare className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No posts found</h3>
                    <p className="text-sm text-foreground/40 mb-4">
                        {search ? "Try a different search term." : "Be the first to start a discussion!"}
                    </p>
                    <Button onClick={() => setShowCreate(true)} className="bg-purple-600 hover:bg-purple-500">
                        <Plus className="h-4 w-4 mr-2" /> Create Post
                    </Button>
                </GlassSurface>
            )}

            <CreatePostDialog
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={loadPosts}
            />
        </div>
    )
}
