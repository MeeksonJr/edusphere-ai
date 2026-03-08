"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    School, Users, BookOpen, GraduationCap, Copy, Check,
    Loader2, UserMinus, Shield, ChevronRight
} from "lucide-react"
import Link from "next/link"

interface Institution { id: string; name: string; domain: string | null; invite_code: string | null; plan: string | null; owner_id: string }
interface ProfileRow { id: string; full_name: string | null; institution_role: string | null; xp: number | null; level: number | null }
interface ClassRow { id: string; name: string; subject: string | null; grade_level: string | null; teacher_id: string; is_active: boolean | null }

export default function AdminDashboardPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [institution, setInstitution] = useState<Institution | null>(null)
    const [teachers, setTeachers] = useState<ProfileRow[]>([])
    const [students, setStudents] = useState<ProfileRow[]>([])
    const [classes, setClasses] = useState<ClassRow[]>([])
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from("profiles").select("institution_id, institution_role").eq("id", user.id).single()
            if (!profile?.institution_id || profile.institution_role !== "admin") {
                router.push("/dashboard/institution")
                return
            }

            const { data: inst } = await supabase.from("institutions").select("*").eq("id", profile.institution_id).single()
            setInstitution(inst)

            // Get all members
            const { data: members } = await supabase
                .from("profiles")
                .select("id, full_name, institution_role, xp, level")
                .eq("institution_id", profile.institution_id)

            setTeachers((members || []).filter(m => m.institution_role === "teacher"))
            setStudents((members || []).filter(m => m.institution_role === "student"))

            // Get all classes
            const { data: cls } = await supabase.from("classes").select("*").eq("institution_id", profile.institution_id)
            setClasses(cls || [])

            setLoading(false)
        }
        load()
    }, [supabase, router])

    const copyInviteCode = () => {
        if (institution?.invite_code) {
            navigator.clipboard.writeText(institution.invite_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const removeUser = async (userId: string) => {
        if (!supabase || !confirm("Remove this user from the institution?")) return
        await supabase.from("profiles").update({ institution_id: null, institution_role: null }).eq("id", userId)
        setTeachers(t => t.filter(x => x.id !== userId))
        setStudents(s => s.filter(x => x.id !== userId))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!institution) return null

    const stats = [
        { label: "Teachers", value: teachers.length, icon: GraduationCap, color: "from-blue-500/20 to-cyan-500/20" },
        { label: "Students", value: students.length, icon: Users, color: "from-teal-500/20 to-green-500/20" },
        { label: "Classes", value: classes.length, icon: BookOpen, color: "from-purple-500/20 to-pink-500/20" },
        { label: "Plan", value: (institution.plan || "free").charAt(0).toUpperCase() + (institution.plan || "free").slice(1), icon: Shield, color: "from-amber-500/20 to-orange-500/20" },
    ]

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <ScrollReveal direction="down">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <School className="h-6 w-6 text-primary" />
                            {institution.name}
                        </h1>
                        <p className="text-sm text-foreground/50">{institution.domain || "No domain set"}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyInviteCode}>
                        {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? "Copied!" : `Invite: ${institution.invite_code || "N/A"}`}
                    </Button>
                </div>
            </ScrollReveal>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <ScrollReveal key={stat.label} direction="up" delay={0.05 * i}>
                        <GlassSurface className="p-4 text-center">
                            <div className={`mx-auto w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                                <stat.icon className="h-5 w-5 text-foreground/70" />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-foreground/40">{stat.label}</div>
                        </GlassSurface>
                    </ScrollReveal>
                ))}
            </div>

            {/* Teachers */}
            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-5">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-400" /> Teachers ({teachers.length})
                    </h2>
                    {teachers.length === 0 ? (
                        <p className="text-sm text-foreground/40 text-center py-6">No teachers yet. Share the invite code!</p>
                    ) : (
                        <div className="space-y-2">
                            {teachers.map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-blue-500/20 text-blue-400 text-xs">
                                                {(t.full_name || "T").charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{t.full_name || "Unknown"}</div>
                                            <Badge className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">Teacher</Badge>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeUser(t.id)} className="text-red-400 hover:text-red-300">
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>

            {/* Students */}
            <ScrollReveal direction="up" delay={0.15}>
                <GlassSurface className="p-5">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="h-5 w-5 text-teal-400" /> Students ({students.length})
                    </h2>
                    {students.length === 0 ? (
                        <p className="text-sm text-foreground/40 text-center py-6">No students enrolled yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {students.map(s => (
                                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-teal-500/20 text-teal-400 text-xs">
                                                {(s.full_name || "S").charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{s.full_name || "Unknown"}</div>
                                            <div className="text-xs text-foreground/40">Level {s.level || 1} · {s.xp || 0} XP</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeUser(s.id)} className="text-red-400 hover:text-red-300">
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>

            {/* Classes */}
            <ScrollReveal direction="up" delay={0.2}>
                <GlassSurface className="p-5">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-purple-400" /> Classes ({classes.length})
                    </h2>
                    {classes.length === 0 ? (
                        <p className="text-sm text-foreground/40 text-center py-6">No classes created yet. Teachers can create classes from their portal.</p>
                    ) : (
                        <div className="space-y-2">
                            {classes.map(c => (
                                <Link key={c.id} href={`/dashboard/institution/classes/${c.id}`}>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
                                        <div>
                                            <div className="text-sm font-medium">{c.name}</div>
                                            <div className="text-xs text-foreground/40">
                                                {c.subject && <span>{c.subject}</span>}
                                                {c.grade_level && <span> · Grade {c.grade_level}</span>}
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-foreground/30" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
