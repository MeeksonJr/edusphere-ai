"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { StudyGroupChat } from "@/components/study-group-chat"
import {
    ArrowLeft,
    Users,
    Globe,
    Lock,
    Copy,
    Check,
    Crown,
    Shield,
    UserMinus,
} from "lucide-react"

interface StudyGroup {
    id: string
    name: string
    description: string | null
    subject: string | null
    is_public: boolean | null
    member_count: number | null
    max_members: number | null
    invite_code: string | null
    owner_id: string
    created_at: string | null
}

interface Member {
    id: string
    user_id: string
    role: string
    joined_at: string
    profile?: { full_name: string | null }
}

export default function GroupDetailPage() {
    const params = useParams()
    const groupId = params.id as string
    const { supabase } = useSupabase()
    const [user, setUser] = useState<any>(null)
    const [group, setGroup] = useState<StudyGroup | null>(null)
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [activeSection, setActiveSection] = useState<"chat" | "members">("chat")

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) return
            setUser(authData.user)

            // Fetch group
            const { data: g } = await supabase
                .from("study_groups")
                .select("*")
                .eq("id", groupId)
                .single()
            setGroup(g)

            // Fetch members
            const { data: m } = await supabase
                .from("study_group_members")
                .select("*")
                .eq("group_id", groupId)
                .order("joined_at", { ascending: true })

            if (m) {
                const userIds = m.map((mem: any) => mem.user_id)
                const { data: profiles } = await supabase
                    .from("profiles")
                    .select("id, full_name")
                    .in("id", userIds)

                const profileMap: Record<string, string> = {}
                    ; (profiles || []).forEach((p: any) => {
                        profileMap[p.id] = p.full_name || "User"
                    })

                setMembers(
                    m.map((mem: any) => ({
                        ...mem,
                        profile: { full_name: profileMap[mem.user_id] || "User" },
                    }))
                )
            }
            setLoading(false)
        }
        load()
    }, [supabase, groupId])

    const copyInviteCode = () => {
        if (group) {
            navigator.clipboard.writeText(group.invite_code || "")
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const leaveGroup = async () => {
        if (!supabase || !user || !group) return
        if (group.owner_id === user.id) return // Owner can't leave
        await supabase
            .from("study_group_members")
            .delete()
            .eq("group_id", groupId)
            .eq("user_id", user.id)
        window.location.href = "/dashboard/community/groups"
    }

    const roleIcon = (role: string) => {
        if (role === "owner") return <Crown className="h-3 w-3 text-amber-400" />
        if (role === "admin") return <Shield className="h-3 w-3 text-blue-400" />
        return null
    }

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading group..." />
            </div>
        )
    }

    if (!group) {
        return (
            <div className="p-6 md:p-8 lg:p-12 text-center">
                <h2 className="text-xl font-bold text-foreground">Group not found</h2>
                <Link href="/dashboard/community/groups">
                    <Button variant="ghost" className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Groups
                    </Button>
                </Link>
            </div>
        )
    }

    const isOwner = user?.id === group.owner_id
    const isMember = members.some((m) => m.user_id === user?.id)

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/community/groups">
                            <Button variant="ghost" size="icon" className="shrink-0">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-foreground/40">
                                {group.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                <span>{group.member_count || 0} members</span>
                                {group.subject && (
                                    <>
                                        <span>·</span>
                                        <Badge className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20">{group.subject}</Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={copyInviteCode} className="text-xs">
                            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copied ? "Copied!" : `Code: ${group.invite_code || "N/A"}`}
                        </Button>
                        {isMember && !isOwner && (
                            <Button variant="ghost" size="sm" onClick={leaveGroup} className="text-red-400 hover:text-red-300 text-xs">
                                <UserMinus className="h-3 w-3 mr-1" /> Leave
                            </Button>
                        )}
                    </div>
                </div>
            </ScrollReveal>

            {group.description && (
                <ScrollReveal direction="up" delay={0.05}>
                    <p className="text-sm text-foreground/50 mb-6 ml-14">{group.description}</p>
                </ScrollReveal>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {(["chat", "members"] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeSection === tab ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveSection(tab)}
                        className={
                            activeSection === tab
                                ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30"
                                : "text-foreground/50"
                        }
                    >
                        {tab === "chat" ? "Chat" : `Members (${members.length})`}
                    </Button>
                ))}
            </div>

            {activeSection === "chat" && isMember && user && (
                <ScrollReveal direction="up" delay={0.1}>
                    <StudyGroupChat groupId={groupId} userId={user.id} />
                </ScrollReveal>
            )}

            {activeSection === "members" && (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-4">
                        <div className="space-y-2">
                            {members.map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                                                {(m.profile?.full_name || "U").charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {m.profile?.full_name || "User"}
                                                {m.user_id === user?.id && <span className="text-foreground/30 ml-1">(You)</span>}
                                            </p>
                                            <p className="text-xs text-foreground/30">
                                                Joined {new Date(m.joined_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {roleIcon(m.role)}
                                        <Badge className="text-[10px] bg-white/5 text-foreground/40 border-white/10 capitalize">
                                            {m.role}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {!isMember && (
                <GlassSurface className="p-8 text-center">
                    <p className="text-foreground/50 mb-4">You need to be a member to view this group&apos;s content.</p>
                    <Link href="/dashboard/community/groups">
                        <Button className="bg-cyan-600 hover:bg-cyan-500">Back to Groups</Button>
                    </Link>
                </GlassSurface>
            )}
        </div>
    )
}
