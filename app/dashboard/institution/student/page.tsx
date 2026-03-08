"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, ChevronRight, Loader2, Search, UserPlus } from "lucide-react"
import Link from "next/link"

interface EnrolledClass {
    id: string; name: string; subject: string | null
    grade_level: string | null; teacher_name: string | null
}

export default function StudentInstitutionPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [classes, setClasses] = useState<EnrolledClass[]>([])
    const [joinCode, setJoinCode] = useState("")
    const [joining, setJoining] = useState(false)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from("profiles")
                .select("institution_id, institution_role").eq("id", user.id).single()

            if (!profile?.institution_id || profile.institution_role !== "student") {
                router.push("/dashboard/institution")
                return
            }

            await loadClasses(user.id)
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const loadClasses = async (studentId: string) => {
        if (!supabase) return
        const { data: enrollments } = await supabase
            .from("class_enrollments")
            .select("class_id")
            .eq("student_id", studentId)
            .eq("status", "active")

        if (!enrollments || enrollments.length === 0) {
            setClasses([])
            return
        }

        const classIds = enrollments.map(e => e.class_id)
        const { data: classData } = await supabase
            .from("classes")
            .select("id, name, subject, grade_level, teacher_id")
            .in("id", classIds)

        if (classData) {
            // Get teacher names
            const teacherIds = [...new Set(classData.map(c => c.teacher_id))]
            const { data: teacherProfiles } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", teacherIds)

            const teacherMap: Record<string, string> = {}
            teacherProfiles?.forEach(p => { teacherMap[p.id] = p.full_name || "Unknown" })

            setClasses(classData.map(c => ({
                ...c,
                teacher_name: teacherMap[c.teacher_id] || "Unknown"
            })))
        }
    }

    const handleJoinClass = async () => {
        if (!supabase || !joinCode.trim()) return
        setJoining(true)
        setError("")

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const { data: cls } = await supabase.from("classes")
                .select("id")
                .eq("invite_code", joinCode.trim().toLowerCase())
                .single()

            if (!cls) {
                setError("Class not found. Check the invite code.")
                setJoining(false)
                return
            }

            const { error: enrollErr } = await supabase.from("class_enrollments").insert({
                class_id: cls.id,
                student_id: user.id,
            })

            if (enrollErr) {
                if (enrollErr.code === "23505") {
                    setError("You're already enrolled in this class.")
                } else {
                    setError(enrollErr.message)
                }
            } else {
                setJoinCode("")
                await loadClasses(user.id)
            }
        } catch (e: any) {
            setError(e.message)
        }
        setJoining(false)
    }

    const filtered = classes.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <ScrollReveal direction="down">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-400">
                    My Classes
                </h1>
                <p className="text-sm text-foreground/50">Your enrolled classes and assignments</p>
            </ScrollReveal>

            {/* Join class */}
            <ScrollReveal direction="up" delay={0.05}>
                <GlassSurface className="p-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter class invite code..."
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleJoinClass()}
                            className="flex-1"
                        />
                        <Button onClick={handleJoinClass} disabled={joining || !joinCode.trim()} size="sm">
                            {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                            Join
                        </Button>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </GlassSurface>
            </ScrollReveal>

            {classes.length > 3 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                    <Input
                        placeholder="Search classes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            )}

            {filtered.length === 0 ? (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                        <h3 className="font-semibold mb-1">No Classes Yet</h3>
                        <p className="text-sm text-foreground/40">Ask your teacher for a class invite code</p>
                    </GlassSurface>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((cls, i) => (
                        <ScrollReveal key={cls.id} direction="up" delay={0.05 * i}>
                            <Link href={`/dashboard/institution/classes/${cls.id}`}>
                                <AnimatedCard className="h-full cursor-pointer">
                                    <GlassSurface className="p-5 h-full">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold mb-1">{cls.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    {cls.subject && (
                                                        <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                                            {cls.subject}
                                                        </Badge>
                                                    )}
                                                    {cls.grade_level && (
                                                        <span className="text-xs text-foreground/40">Grade {cls.grade_level}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-foreground/40 mt-2">
                                                    Teacher: {cls.teacher_name}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-foreground/30" />
                                        </div>
                                    </GlassSurface>
                                </AnimatedCard>
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    )
}
