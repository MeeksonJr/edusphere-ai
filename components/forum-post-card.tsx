"use client"

import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    ArrowUp,
    MessageSquare,
    CheckCircle2,
    Pin,
} from "lucide-react"

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

interface Props {
    post: ForumPost
    onClick: () => void
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

export function ForumPostCard({ post, onClick }: Props) {
    const score = post.upvotes - post.downvotes

    return (
        <AnimatedCard
            className="p-4 cursor-pointer hover:border-purple-500/30 transition-all group"
            onClick={onClick}
        >
            <div className="flex gap-4">
                {/* Vote count */}
                <div className="flex flex-col items-center shrink-0 w-12">
                    <ArrowUp className="h-4 w-4 text-foreground/30" />
                    <span className={`text-lg font-bold ${score > 0 ? "text-green-400" : score < 0 ? "text-red-400" : "text-foreground/40"}`}>
                        {score}
                    </span>
                    <span className="text-[10px] text-foreground/20">votes</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                        {post.is_pinned && <Pin className="h-3 w-3 text-amber-400 shrink-0 mt-1" />}
                        {post.is_solved && <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0 mt-1" />}
                        <h3 className="text-base font-semibold text-foreground group-hover:text-purple-400 transition-colors line-clamp-1">
                            {post.title}
                        </h3>
                    </div>

                    <p className="text-sm text-foreground/40 line-clamp-2 mb-2">
                        {post.body.replace(/[#*_`]/g, "").substring(0, 200)}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/30">
                        <div className="flex items-center gap-1.5">
                            <Avatar className="h-4 w-4">
                                <AvatarFallback className="bg-purple-500/20 text-purple-400 text-[8px]">
                                    {(post.author_name || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span>{post.author_name || "User"}</span>
                        </div>
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}</span>
                        </div>
                        {post.subject && (
                            <>
                                <span>·</span>
                                <Badge className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                                    {post.subject}
                                </Badge>
                            </>
                        )}
                        {post.tags?.map((tag) => (
                            <Badge key={tag} className="text-[10px] bg-white/5 text-foreground/30 border-white/10">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedCard>
    )
}
