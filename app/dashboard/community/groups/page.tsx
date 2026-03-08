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
    Users,
    Plus,
    Search,
    ArrowLeft,
    Lock,
    Globe,
    ChevronRight,
    UserPlus,
} from "lucide-react"
import { CreateGroupDialog } from "@/components/create-group-dialog"

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

export default function StudyGroupsPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [myGroups, setMyGroups] = useState<StudyGroup[]>([])
    const [publicGroups, setPublicGroups] = useState<StudyGroup[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [joiningCode, setJoiningCode] = useState("")
    const [joinError, setJoinError] = useState("")
    const [activeTab, setActiveTab] = useState<"my" | "discover">("my")

    const loadGroups = useCallback(async () => {
        if (!supabase) return
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) return
        setUser(authData.user)

        // My groups: groups where I'm a member
        const { data: memberRows } = await supabase
            .from("study_group_members")
            .select("group_id")
            .eq("user_id", authData.user.id)

        const myGroupIds = (memberRows || []).map((r: any) => r.group_id)

        if (myGroupIds.length > 0) {
            const { data } = await supabase
                .from("study_groups")
                .select("*")
                .in("id", myGroupIds)
                .order("updated_at", { ascending: false })
            setMyGroups(data || [])
        } else {
            setMyGroups([])
        }

        // Discover: public groups I'm NOT in
        const { data: pub } = await supabase
            .from("study_groups")
            .select("*")
            .eq("is_public", true)
            .order("member_count", { ascending: false })
            .limit(20)

        setPublicGroups(
            (pub || []).filter((g: any) => !myGroupIds.includes(g.id))
        )
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        loadGroups()
    }, [loadGroups])

    const joinGroup = async (groupId: string) => {
        if (!supabase || !user) return
        const { error } = await supabase.from("study_group_members").insert({
            group_id: groupId,
            user_id: user.id,
            role: "member",
        })
        if (!error) {
            // Increment member count manually
            const target = [...myGroups, ...publicGroups].find((g) => g.id === groupId)
            if (target) {
                await supabase
                    .from("study_groups")
                    .update({ member_count: (target.member_count || 0) + 1 })
                    .eq("id", groupId)
            }
            loadGroups()
        }
    }

    const joinByCode = async () => {
        if (!supabase || !user || !joiningCode.trim()) return
        setJoinError("")
        const { data: group } = await supabase
            .from("study_groups")
            .select("id")
            .eq("invite_code", joiningCode.trim())
            .single()
        if (!group) {
            setJoinError("Invalid invite code")
            return
        }
        await joinGroup(group.id)
        setJoiningCode("")
    }

    const filtered = (groups: StudyGroup[]) =>
        search
            ? groups.filter(
                (g) =>
                    g.name.toLowerCase().includes(search.toLowerCase()) ||
                    (g.subject || "").toLowerCase().includes(search.toLowerCase())
            )
            : groups

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <LoadingSpinner size="lg" text="Loading study groups..." />
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
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Study Groups</h1>
                            <p className="text-sm text-foreground/50">Collaborate and learn together</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowCreate(true)}
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Group
                    </Button>
                </div>
            </ScrollReveal>

            {/* Search + Join by Code */}
            <ScrollReveal direction="up" delay={0.1}>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                        <Input
                            placeholder="Search groups..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Invite code"
                            value={joiningCode}
                            onChange={(e) => setJoiningCode(e.target.value)}
                            className="w-36 bg-white/5 border-white/10"
                        />
                        <Button variant="outline" onClick={joinByCode}>
                            <UserPlus className="h-4 w-4 mr-1" /> Join
                        </Button>
                    </div>
                </div>
                {joinError && <p className="text-sm text-red-400 mb-4">{joinError}</p>}
            </ScrollReveal>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(["my", "discover"] as const).map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab(tab)}
                        className={activeTab === tab ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-foreground/50"}
                    >
                        {tab === "my" ? "My Groups" : "Discover"}
                        <Badge className="ml-2 text-xs bg-white/10 text-foreground/50">
                            {tab === "my" ? myGroups.length : publicGroups.length}
                        </Badge>
                    </Button>
                ))}
            </div>

            {/* Group Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered(activeTab === "my" ? myGroups : publicGroups).map((group, i) => (
                    <ScrollReveal key={group.id} direction="up" delay={0.05 * i}>
                        <AnimatedCard
                            className="p-5 h-full cursor-pointer hover:border-cyan-500/30 transition-all"
                            onClick={() =>
                                activeTab === "my"
                                    ? router.push(`/dashboard/community/groups/${group.id}`)
                                    : joinGroup(group.id)
                            }
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div className="flex items-center gap-1 text-foreground/30">
                                    {group.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                    <span className="text-xs">{group.is_public ? "Public" : "Private"}</span>
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-foreground mb-1 line-clamp-1">{group.name}</h3>
                            <p className="text-sm text-foreground/40 mb-3 line-clamp-2">{group.description || "No description"}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {group.subject && (
                                        <Badge className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                                            {group.subject}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-foreground/30">
                                        {group.member_count || 0}/{group.max_members || 10} members
                                    </span>
                                </div>
                                {activeTab === "my" ? (
                                    <ChevronRight className="h-4 w-4 text-foreground/20" />
                                ) : (
                                    <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                                        Join
                                    </Badge>
                                )}
                            </div>
                        </AnimatedCard>
                    </ScrollReveal>
                ))}
            </div>

            {filtered(activeTab === "my" ? myGroups : publicGroups).length === 0 && (
                <GlassSurface className="p-12 text-center mt-4">
                    <Users className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                        {activeTab === "my" ? "No groups yet" : "No groups to discover"}
                    </h3>
                    <p className="text-sm text-foreground/40 mb-4">
                        {activeTab === "my"
                            ? "Create a group or join one with an invite code."
                            : "Be the first to create a public group!"}
                    </p>
                    {activeTab === "my" && (
                        <Button onClick={() => setShowCreate(true)} className="bg-cyan-600 hover:bg-cyan-500">
                            <Plus className="h-4 w-4 mr-2" /> Create Group
                        </Button>
                    )}
                </GlassSurface>
            )}

            <CreateGroupDialog
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={loadGroups}
            />
        </div>
    )
}
