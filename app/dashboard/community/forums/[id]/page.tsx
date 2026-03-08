"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    MessageSquare,
    CheckCircle2,
    Send,
    Loader2,
} from "lucide-react"

interface ForumPost {
    id: string
    title: string
    body: string
    author_id: string
    subject: string | null
    tags: string[] | null
    upvotes: number | null
    downvotes: number | null
    reply_count: number | null
    is_pinned: boolean | null
    is_solved: boolean | null
    created_at: string | null
}

interface Reply {
    id: string
    post_id: string
    author_id: string
    body: string
    upvotes: number | null
    downvotes: number | null
    is_accepted: boolean | null
    created_at: string | null
}

function timeAgo(date: string): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return "just now"
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(date).toLocaleDateString()
}

export default function ForumPostDetailPage() {
    const params = useParams()
    const postId = params.id as string
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const [post, setPost] = useState<ForumPost | null>(null)
    const [replies, setReplies] = useState<Reply[]>([])
    const [profiles, setProfiles] = useState<Record<string, string>>({})
    const [userVotes, setUserVotes] = useState<Record<string, number>>({})
    const [replyText, setReplyText] = useState("")
    const [sending, setSending] = useState(false)
    const [loading, setLoading] = useState(true)

    const loadAll = useCallback(async () => {
        if (!supabase) return
        const { data: authData } = await supabase.auth.getUser()
        if (authData.user) setUser(authData.user)

        // Post
        const { data: p } = await supabase.from("forum_posts").select("*").eq("id", postId).single()
        setPost(p)

        // Replies
        const { data: r } = await supabase
            .from("forum_replies")
            .select("*")
            .eq("post_id", postId)
            .order("is_accepted", { ascending: false })
            .order("upvotes", { ascending: false })
            .order("created_at", { ascending: true })
        setReplies(r || [])

        // Profiles
        const allUserIds = new Set<string>()
        if (p) allUserIds.add(p.author_id)
            ; (r || []).forEach((reply: any) => allUserIds.add(reply.author_id))
        if (allUserIds.size > 0) {
            const { data: profs } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", [...allUserIds])
            const map: Record<string, string> = {}
                ; (profs || []).forEach((pf: any) => {
                    map[pf.id] = pf.full_name || "User"
                })
            setProfiles(map)
        }

        // User votes
        if (authData.user) {
            const { data: votes } = await supabase
                .from("forum_votes")
                .select("target_type, target_id, vote_value")
                .eq("user_id", authData.user.id)
            if (votes) {
                const vMap: Record<string, number> = {}
                votes.forEach((v: any) => {
                    vMap[`${v.target_type}:${v.target_id}`] = v.vote_value
                })
                setUserVotes(vMap)
            }
        }

        setLoading(false)
    }, [supabase, postId])

    useEffect(() => {
        loadAll()
    }, [loadAll])

    const vote = async (targetType: "post" | "reply", targetId: string, value: 1 | -1) => {
        if (!supabase || !user) return
        const key = `${targetType}:${targetId}`
        const existing = userVotes[key]

        if (existing === value) {
            // Remove vote
            await supabase.from("forum_votes").delete()
                .eq("user_id", user.id)
                .eq("target_type", targetType)
                .eq("target_id", targetId)
            setUserVotes((prev) => {
                const copy = { ...prev }
                delete copy[key]
                return copy
            })
            // Update count
            const table = targetType === "post" ? "forum_posts" : "forum_replies"
            const field = value === 1 ? "upvotes" : "downvotes"
            if (targetType === "post" && post) {
                await supabase.from(table).update({ [field]: Math.max(0, ((post[field as keyof ForumPost] as number | null) || 0) - 1) }).eq("id", targetId)
            }
        } else {
            // Upsert vote
            await supabase.from("forum_votes").upsert({
                user_id: user.id,
                target_type: targetType,
                target_id: targetId,
                vote_value: value,
            }, { onConflict: "user_id,target_type,target_id" })
            setUserVotes((prev) => ({ ...prev, [key]: value }))
        }
        loadAll()
    }

    const submitReply = async () => {
        if (!supabase || !user || !replyText.trim() || sending) return
        setSending(true)
        try {
            await supabase.from("forum_replies").insert({
                post_id: postId,
                author_id: user.id,
                body: replyText.trim(),
            })
            // Increment reply count
            if (post) {
                await supabase.from("forum_posts").update({ reply_count: (post.reply_count || 0) + 1 }).eq("id", postId)
            }
            setReplyText("")
            loadAll()
        } catch (err) {
            console.error("Failed to submit reply:", err)
        } finally {
            setSending(false)
        }
    }

    const markAccepted = async (replyId: string) => {
        if (!supabase || !user || !post || user.id !== post.author_id) return
        // Unmark all, then mark this one
        await supabase.from("forum_replies").update({ is_accepted: false }).eq("post_id", postId)
        await supabase.from("forum_replies").update({ is_accepted: true }).eq("id", replyId)
        await supabase.from("forum_posts").update({ is_solved: true }).eq("id", postId)
        loadAll()
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading post..." />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="p-6 md:p-8 lg:p-12 text-center">
                <h2 className="text-xl font-bold text-foreground">Post not found</h2>
                <Link href="/dashboard/community/forums">
                    <Button variant="ghost" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Forums</Button>
                </Link>
            </div>
        )
    }

    const postScore = (post.upvotes || 0) - (post.downvotes || 0)
    const postVote = userVotes[`post:${post.id}`]

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
            {/* Back */}
            <Link href="/dashboard/community/forums" className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Forums
            </Link>

            {/* Post */}
            <ScrollReveal direction="up">
                <GlassSurface className="p-6 mb-6">
                    <div className="flex gap-4">
                        {/* Votes */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            <button
                                onClick={() => vote("post", post.id, 1)}
                                className={`p-1 rounded transition-colors ${postVote === 1 ? "text-green-400 bg-green-500/10" : "text-foreground/30 hover:text-green-400"}`}
                            >
                                <ArrowUp className="h-5 w-5" />
                            </button>
                            <span className={`text-xl font-bold ${postScore > 0 ? "text-green-400" : postScore < 0 ? "text-red-400" : "text-foreground/40"}`}>
                                {postScore}
                            </span>
                            <button
                                onClick={() => vote("post", post.id, -1)}
                                className={`p-1 rounded transition-colors ${postVote === -1 ? "text-red-400 bg-red-500/10" : "text-foreground/30 hover:text-red-400"}`}
                            >
                                <ArrowDown className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                                {post.is_solved && (
                                    <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20 shrink-0">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Solved
                                    </Badge>
                                )}
                                <h1 className="text-xl md:text-2xl font-bold text-foreground">{post.title}</h1>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-foreground/30 mb-4">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-[8px]">
                                        {(profiles[post.author_id] || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span>{profiles[post.author_id] || "User"}</span>
                                <span>·</span>
                                <span>{timeAgo(post.created_at || new Date().toISOString())}</span>
                                {post.subject && (
                                    <>
                                        <span>·</span>
                                        <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">{post.subject}</Badge>
                                    </>
                                )}
                            </div>

                            <div className="prose prose-invert prose-sm max-w-none text-foreground/70 whitespace-pre-wrap">
                                {post.body}
                            </div>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {post.tags.map((tag) => (
                                        <Badge key={tag} className="text-[10px] bg-white/5 text-foreground/30 border-white/10">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </GlassSurface>
            </ScrollReveal>

            {/* Replies */}
            <ScrollReveal direction="up" delay={0.1}>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </h2>
            </ScrollReveal>

            <div className="space-y-3 mb-6">
                {replies.map((reply, i) => {
                    const replyScore = (reply.upvotes || 0) - (reply.downvotes || 0)
                    const replyVote = userVotes[`reply:${reply.id}`]
                    return (
                        <ScrollReveal key={reply.id} direction="up" delay={0.05 * i}>
                            <GlassSurface className={`p-4 ${reply.is_accepted ? "border-green-500/30 bg-green-500/5" : ""}`}>
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                                        <button
                                            onClick={() => vote("reply", reply.id, 1)}
                                            className={`p-0.5 rounded transition-colors ${replyVote === 1 ? "text-green-400" : "text-foreground/20 hover:text-green-400"}`}
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <span className={`text-sm font-bold ${replyScore > 0 ? "text-green-400" : replyScore < 0 ? "text-red-400" : "text-foreground/30"}`}>
                                            {replyScore}
                                        </span>
                                        <button
                                            onClick={() => vote("reply", reply.id, -1)}
                                            className={`p-0.5 rounded transition-colors ${replyVote === -1 ? "text-red-400" : "text-foreground/20 hover:text-red-400"}`}
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 text-xs text-foreground/30">
                                            <Avatar className="h-4 w-4">
                                                <AvatarFallback className="bg-purple-500/20 text-purple-400 text-[8px]">
                                                    {(profiles[reply.author_id] || "U").charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{profiles[reply.author_id] || "User"}</span>
                                            <span>·</span>
                                            <span>{timeAgo(reply.created_at || new Date().toISOString())}</span>
                                            {reply.is_accepted && (
                                                <Badge className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                                                    <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Accepted
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/70 whitespace-pre-wrap">{reply.body}</p>
                                        {user?.id === post.author_id && !reply.is_accepted && (
                                            <button
                                                onClick={() => markAccepted(reply.id)}
                                                className="mt-2 text-xs text-green-400/50 hover:text-green-400 flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="h-3 w-3" /> Mark as answer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </GlassSurface>
                        </ScrollReveal>
                    )
                })}
            </div>

            {/* Reply Input */}
            <ScrollReveal direction="up" delay={0.15}>
                <GlassSurface className="p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Write a Reply</h3>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Share your answer or thoughts..."
                        className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm text-foreground placeholder:text-foreground/30 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500/40 mb-3"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={submitReply}
                            disabled={!replyText.trim() || sending}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        >
                            {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                            {sending ? "Sending..." : "Post Reply"}
                        </Button>
                    </div>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
