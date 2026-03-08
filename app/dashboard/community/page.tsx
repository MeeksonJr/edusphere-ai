"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
    Users,
    MessageSquare,
    Trophy,
    BookCopy,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Globe,
} from "lucide-react"

export default function CommunityPage() {
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState({
        groupCount: 0,
        postCount: 0,
        xpRank: 0,
        sharedSets: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            try {
                const { data } = await supabase.auth.getUser()
                if (!data.user) return
                setUser(data.user)

                // Fetch stats in parallel
                const [groupsRes, postsRes, flashcardsRes] = await Promise.all([
                    supabase
                        .from("study_group_members")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", data.user.id),
                    supabase
                        .from("forum_posts")
                        .select("id", { count: "exact", head: true })
                        .eq("author_id", data.user.id),
                    supabase
                        .from("flashcard_sets")
                        .select("id", { count: "exact", head: true })
                        .eq("user_id", data.user.id)
                        .eq("is_public", true),
                ])

                setStats({
                    groupCount: groupsRes.count || 0,
                    postCount: postsRes.count || 0,
                    xpRank: 0,
                    sharedSets: flashcardsRes.count || 0,
                })
            } catch (err) {
                console.error("Failed to load community stats:", err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [supabase])

    const features = [
        {
            title: "Study Groups",
            description: "Create or join groups with real-time chat, shared resources, and collaborative learning.",
            href: "/dashboard/community/groups",
            icon: Users,
            gradient: "from-cyan-500/20 to-blue-500/20",
            iconColor: "text-cyan-400",
            stat: `${stats.groupCount} joined`,
        },
        {
            title: "Community Forums",
            description: "Ask questions, share knowledge, and help others. Vote on the best answers.",
            href: "/dashboard/community/forums",
            icon: MessageSquare,
            gradient: "from-purple-500/20 to-pink-500/20",
            iconColor: "text-purple-400",
            stat: `${stats.postCount} posts`,
        },
        {
            title: "Leaderboard",
            description: "See who's earning the most XP. Compete globally or within your groups.",
            href: "/dashboard/community/leaderboard",
            icon: Trophy,
            gradient: "from-amber-500/20 to-orange-500/20",
            iconColor: "text-amber-400",
            stat: "View rankings",
        },
        {
            title: "Shared Flashcards",
            description: "Discover community-created flashcard sets. Share your own and help others learn.",
            href: "/dashboard/community/shared-flashcards",
            icon: BookCopy,
            gradient: "from-green-500/20 to-emerald-500/20",
            iconColor: "text-green-400",
            stat: `${stats.sharedSets} shared`,
        },
    ]

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading community..." />
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold">
                                <span className="text-foreground">Community</span>
                            </h1>
                            <p className="text-foreground/60 text-sm">Learn together, grow together</p>
                        </div>
                    </div>
                </div>
            </ScrollReveal>

            {/* Quick Stats */}
            <ScrollReveal direction="up" delay={0.1}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Groups Joined", value: stats.groupCount, icon: Users, color: "text-cyan-400" },
                        { label: "Forum Posts", value: stats.postCount, icon: MessageSquare, color: "text-purple-400" },
                        { label: "XP Rank", value: stats.xpRank > 0 ? `#${stats.xpRank}` : "—", icon: TrendingUp, color: "text-amber-400" },
                        { label: "Shared Sets", value: stats.sharedSets, icon: BookCopy, color: "text-green-400" },
                    ].map((stat) => (
                        <GlassSurface key={stat.label} className="p-4 text-center">
                            <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-foreground/50">{stat.label}</p>
                        </GlassSurface>
                    ))}
                </div>
            </ScrollReveal>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, i) => (
                    <ScrollReveal key={feature.title} direction="up" delay={0.15 + i * 0.05}>
                        <Link href={feature.href}>
                            <AnimatedCard className="p-6 h-full group cursor-pointer hover:border-cyan-500/30 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shrink-0`}>
                                        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-lg font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                                                {feature.title}
                                            </h3>
                                            <ArrowRight className="h-4 w-4 text-foreground/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <p className="text-sm text-foreground/50 mb-3">{feature.description}</p>
                                        <Badge className="text-xs bg-white/5 text-foreground/40 border-white/10">
                                            {feature.stat}
                                        </Badge>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </Link>
                    </ScrollReveal>
                ))}
            </div>

            {/* Activity Hint */}
            <ScrollReveal direction="up" delay={0.4}>
                <GlassSurface className="mt-8 p-6 text-center">
                    <Sparkles className="h-8 w-8 text-cyan-400/50 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">Start Connecting</h3>
                    <p className="text-sm text-foreground/50 max-w-md mx-auto">
                        Join a study group, ask a question in the forums, or share your flashcards with the community.
                        Every interaction earns you XP!
                    </p>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
