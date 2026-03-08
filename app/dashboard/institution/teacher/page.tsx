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
import { Label } from "@/components/ui/label"
import {
    BookOpen, Plus, Users, ClipboardList, ChevronRight,
    Loader2, X, Copy, Check
} from "lucide-react"
import Link from "next/link"

interface ClassRow {
    id: string; name: string; subject: string | null; grade_level: string | null
    invite_code: string | null; is_active: boolean | null; created_at: string | null
    enrollment_count?: number
}

export default function TeacherPortalPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [classes, setClasses] = useState<ClassRow[]>([])
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    // Create form
    const [className, setClassName] = useState("")
    const [subject, setSubject] = useState("")
    const [gradeLevel, setGradeLevel] = useState("")
    const [description, setDescription] = useState("")

    const [userId, setUserId] = useState<string | null>(null)
    const [institutionId, setInstitutionId] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from("profiles")
                .select("institution_id, institution_role").eq("id", user.id).single()

            if (!profile?.institution_id || profile.institution_role !== "teacher") {
                router.push("/dashboard/institution")
                return
            }

            setUserId(user.id)
            setInstitutionId(profile.institution_id)
            await loadClasses(user.id)
            setLoading(false)
        }
        load()
    }, [supabase, router])

    const loadClasses = async (teacherId: string) => {
        if (!supabase) return
        const { data } = await supabase.from("classes")
            .select("*")
            .eq("teacher_id", teacherId)
            .order("created_at", { ascending: false })

        if (data) {
            // Get enrollment counts
            const withCounts = await Promise.all(data.map(async (c) => {
                const { count } = await supabase.from("class_enrollments")
                    .select("*", { count: "exact", head: true })
                    .eq("class_id", c.id)
                return { ...c, enrollment_count: count || 0 }
            }))
            setClasses(withCounts)
        }
    }

    const handleCreate = async () => {
        if (!supabase || !userId || !institutionId || !className.trim()) return
        setCreating(true)

        const { error } = await supabase.from("classes").insert({
            name: className.trim(),
            subject: subject.trim() || null,
            grade_level: gradeLevel.trim() || null,
            description: description.trim() || null,
            teacher_id: userId,
            institution_id: institutionId,
        })

        if (!error) {
            setClassName(""); setSubject(""); setGradeLevel(""); setDescription("")
            setShowCreate(false)
            await loadClasses(userId)
        }
        setCreating(false)
    }

    const copyCode = (id: string, code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            Teacher Portal
                        </h1>
                        <p className="text-sm text-foreground/50">Manage your classes and assignments</p>
                    </div>
                    <Button onClick={() => setShowCreate(true)} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> New Class
                    </Button>
                </div>
            </ScrollReveal>

            {/* Create dialog */}
            {showCreate && (
                <ScrollReveal direction="up">
                    <GlassSurface className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Create a New Class</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Class Name *</Label>
                                <Input placeholder="e.g. AP Chemistry" value={className} onChange={e => setClassName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Subject</Label>
                                <Input placeholder="e.g. Chemistry" value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Grade Level</Label>
                                <Input placeholder="e.g. 11" value={gradeLevel} onChange={e => setGradeLevel(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Input placeholder="Brief description..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <Button onClick={handleCreate} disabled={creating || !className.trim()} className="w-full">
                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Class
                        </Button>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Classes list */}
            {classes.length === 0 ? (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                        <h3 className="font-semibold mb-1">No Classes Yet</h3>
                        <p className="text-sm text-foreground/40 mb-4">Create your first class to start assigning work</p>
                        <Button size="sm" onClick={() => setShowCreate(true)}>
                            <Plus className="h-4 w-4 mr-1" /> Create Class
                        </Button>
                    </GlassSurface>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((cls, i) => (
                        <ScrollReveal key={cls.id} direction="up" delay={0.05 * i}>
                            <AnimatedCard className="h-full">
                                <GlassSurface className="p-5 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold">{cls.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {cls.subject && (
                                                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                                        {cls.subject}
                                                    </Badge>
                                                )}
                                                {cls.grade_level && (
                                                    <span className="text-xs text-foreground/40">Grade {cls.grade_level}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost" size="sm"
                                            onClick={() => cls.invite_code && copyCode(cls.id, cls.invite_code)}
                                            className="text-xs"
                                        >
                                            {copiedId === cls.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-foreground/40 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" /> {cls.enrollment_count} students
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Code: {cls.invite_code || "N/A"}
                                        </span>
                                    </div>

                                    <div className="mt-auto flex gap-2">
                                        <Link href={`/dashboard/institution/classes/${cls.id}`} className="flex-1">
                                            <Button variant="outline" className="w-full text-xs" size="sm">
                                                <ClipboardList className="h-3 w-3 mr-1" /> View Class
                                                <ChevronRight className="h-3 w-3 ml-auto" />
                                            </Button>
                                        </Link>
                                    </div>
                                </GlassSurface>
                            </AnimatedCard>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    )
}
