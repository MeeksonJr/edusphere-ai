"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    ArrowLeft, BookOpen, Users, Plus, X, ClipboardList,
    Loader2, Copy, Check, Calendar, CheckCircle2, Clock, FileText, Send
} from "lucide-react"
import Link from "next/link"

interface ClassDetail {
    id: string; name: string; subject: string | null; grade_level: string | null
    invite_code: string | null; description: string | null; teacher_id: string
}

interface Assignment {
    id: string; title: string; description: string | null; due_date: string | null
    max_points: number | null; assignment_type: string | null; is_published: boolean | null
    created_at: string | null
}

interface StudentRow {
    id: string; full_name: string | null; xp: number | null; level: number | null
}

interface Submission {
    id: string; assignment_id: string; student_id: string
    content: string | null; grade: number | null; feedback: string | null
    status: string | null; submitted_at: string | null
}

export default function ClassDetailPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const params = useParams()
    const classId = params.id as string

    const [loading, setLoading] = useState(true)
    const [classInfo, setClassInfo] = useState<ClassDetail | null>(null)
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [students, setStudents] = useState<StudentRow[]>([])
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [isTeacher, setIsTeacher] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"assignments" | "students">("assignments")
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [copied, setCopied] = useState(false)

    // Create assignment form
    const [aTitle, setATitle] = useState("")
    const [aDesc, setADesc] = useState("")
    const [aDueDate, setADueDate] = useState("")
    const [aMaxPoints, setAMaxPoints] = useState("100")
    const [aType, setAType] = useState("homework")

    // Submission form (student)
    const [submitText, setSubmitText] = useState("")
    const [submittingId, setSubmittingId] = useState<string | null>(null)

    // Grading (teacher)
    const [gradingId, setGradingId] = useState<string | null>(null)
    const [gradeValue, setGradeValue] = useState("")
    const [feedbackValue, setFeedbackValue] = useState("")

    useEffect(() => {
        loadAll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase, classId])

    const loadAll = async () => {
        if (!supabase || !classId) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)

        // Get class
        const { data: cls } = await supabase.from("classes").select("*").eq("id", classId).single()
        if (!cls) { router.push("/dashboard/institution"); return }
        setClassInfo(cls)
        setIsTeacher(cls.teacher_id === user.id)

        // Get assignments
        const { data: assgns } = await supabase.from("class_assignments")
            .select("*").eq("class_id", classId).order("due_date", { ascending: true })
        setAssignments(assgns || [])

        // Get enrolled students
        const { data: enrollments } = await supabase.from("class_enrollments")
            .select("student_id").eq("class_id", classId).eq("status", "active")
        if (enrollments && enrollments.length > 0) {
            const studentIds = enrollments.map(e => e.student_id)
            const { data: profiles } = await supabase.from("profiles")
                .select("id, full_name, xp, level").in("id", studentIds)
            setStudents(profiles || [])
        }

        // Get submissions
        const { data: subs } = await supabase.from("class_submissions")
            .select("*")
            .in("assignment_id", (assgns || []).map(a => a.id))
        setSubmissions(subs || [])

        setLoading(false)
    }

    const createAssignment = async () => {
        if (!supabase || !userId || !aTitle.trim()) return
        setCreating(true)
        await supabase.from("class_assignments").insert({
            class_id: classId,
            teacher_id: userId,
            title: aTitle.trim(),
            description: aDesc.trim() || null,
            due_date: aDueDate || null,
            max_points: parseInt(aMaxPoints) || 100,
            assignment_type: aType,
        })
        setATitle(""); setADesc(""); setADueDate(""); setAMaxPoints("100")
        setShowCreate(false)
        setCreating(false)
        loadAll()
    }

    const submitWork = async (assignmentId: string) => {
        if (!supabase || !userId || !submitText.trim()) return
        setSubmittingId(assignmentId)
        await supabase.from("class_submissions").insert({
            assignment_id: assignmentId,
            student_id: userId,
            content: submitText.trim(),
            status: "submitted",
        })
        setSubmitText("")
        setSubmittingId(null)
        loadAll()
    }

    const gradeSubmission = async (submissionId: string) => {
        if (!supabase) return
        await supabase.from("class_submissions").update({
            grade: parseFloat(gradeValue) || null,
            feedback: feedbackValue.trim() || null,
            status: "graded",
            graded_at: new Date().toISOString(),
        }).eq("id", submissionId)
        setGradingId(null); setGradeValue(""); setFeedbackValue("")
        loadAll()
    }

    const getSubmission = (assignmentId: string, studentId?: string) => {
        return submissions.find(s => s.assignment_id === assignmentId && s.student_id === (studentId || userId))
    }

    const formatDate = (d: string | null) => {
        if (!d) return "No due date"
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const copyInviteCode = () => {
        if (classInfo?.invite_code) {
            navigator.clipboard.writeText(classInfo.invite_code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }
    if (!classInfo) return null

    const typeColors: Record<string, string> = {
        homework: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        quiz: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        exam: "bg-red-500/10 text-red-400 border-red-500/20",
        project: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        essay: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Link href={isTeacher ? "/dashboard/institution/teacher" : "/dashboard/institution/student"} className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>

            <ScrollReveal direction="down">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">{classInfo.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-foreground/40 mt-1">
                            {classInfo.subject && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">{classInfo.subject}</Badge>}
                            {classInfo.grade_level && <span>Grade {classInfo.grade_level}</span>}
                            <span>·</span>
                            <span>{students.length} students</span>
                        </div>
                        {classInfo.description && <p className="text-sm text-foreground/50 mt-2">{classInfo.description}</p>}
                    </div>
                    {isTeacher && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyInviteCode} className="text-xs">
                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied ? "Copied!" : `Code: ${classInfo.invite_code || "N/A"}`}
                            </Button>
                            <Button size="sm" onClick={() => setShowCreate(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Assignment
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollReveal>

            {/* Tabs */}
            <div className="flex gap-2">
                <Button variant={activeTab === "assignments" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("assignments")}>
                    <ClipboardList className="h-4 w-4 mr-1" /> Assignments ({assignments.length})
                </Button>
                <Button variant={activeTab === "students" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("students")}>
                    <Users className="h-4 w-4 mr-1" /> Students ({students.length})
                </Button>
            </div>

            {/* Create assignment */}
            {showCreate && isTeacher && (
                <ScrollReveal direction="up">
                    <GlassSurface className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">New Assignment</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Title *</Label>
                                <Input placeholder="e.g. Chapter 5 Review" value={aTitle} onChange={e => setATitle(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Type</Label>
                                <select value={aType} onChange={e => setAType(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                                    <option value="homework">Homework</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="exam">Exam</option>
                                    <option value="project">Project</option>
                                    <option value="essay">Essay</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Due Date</Label>
                                <Input type="datetime-local" value={aDueDate} onChange={e => setADueDate(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Max Points</Label>
                                <Input type="number" value={aMaxPoints} onChange={e => setAMaxPoints(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea placeholder="Assignment instructions..." value={aDesc} onChange={e => setADesc(e.target.value)} rows={3} />
                        </div>
                        <Button onClick={createAssignment} disabled={creating || !aTitle.trim()} className="w-full">
                            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Create Assignment
                        </Button>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Assignments tab */}
            {activeTab === "assignments" && (
                <div className="space-y-3">
                    {assignments.length === 0 ? (
                        <GlassSurface className="p-12 text-center">
                            <ClipboardList className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                            <h3 className="font-semibold mb-1">No Assignments</h3>
                            <p className="text-sm text-foreground/40">
                                {isTeacher ? "Create your first assignment above" : "No assignments posted yet"}
                            </p>
                        </GlassSurface>
                    ) : (
                        assignments.map((a, i) => {
                            const sub = getSubmission(a.id)
                            const isPastDue = a.due_date && new Date(a.due_date) < new Date()
                            return (
                                <ScrollReveal key={a.id} direction="up" delay={0.05 * i}>
                                    <GlassSurface className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-sm">{a.title}</h3>
                                                    <Badge className={`text-[10px] ${typeColors[a.assignment_type || "homework"]}`}>
                                                        {a.assignment_type || "homework"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-foreground/40 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" /> {formatDate(a.due_date)}
                                                    </span>
                                                    <span>{a.max_points || 100} pts</span>
                                                    {isPastDue && !sub && !isTeacher && (
                                                        <Badge className="text-[10px] bg-red-500/10 text-red-400 border-red-500/20">Past Due</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {sub && (
                                                <Badge className={`text-[10px] ${sub.status === "graded" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    }`}>
                                                    {sub.status === "graded" ? (
                                                        <><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> {sub.grade}/{a.max_points}</>
                                                    ) : (
                                                        <><Clock className="h-2.5 w-2.5 mr-0.5" /> Submitted</>
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        {a.description && <p className="text-xs text-foreground/50 mb-3">{a.description}</p>}

                                        {/* Student: submit work */}
                                        {!isTeacher && !sub && (
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="Type your answer..."
                                                    value={submittingId === a.id ? submitText : ""}
                                                    onChange={e => { setSubmittingId(a.id); setSubmitText(e.target.value) }}
                                                    onFocus={() => setSubmittingId(a.id)}
                                                    className="flex-1 text-xs"
                                                />
                                                <Button size="sm" onClick={() => submitWork(a.id)} disabled={submittingId !== a.id || !submitText.trim()}>
                                                    <Send className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Student: see feedback */}
                                        {!isTeacher && sub?.status === "graded" && sub.feedback && (
                                            <div className="mt-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                                                <p className="text-xs text-green-400"><strong>Feedback:</strong> {sub.feedback}</p>
                                            </div>
                                        )}

                                        {/* Teacher: see submissions */}
                                        {isTeacher && (
                                            <div className="mt-3 space-y-2">
                                                {students.map(s => {
                                                    const sSub = getSubmission(a.id, s.id)
                                                    if (!sSub) return (
                                                        <div key={s.id} className="flex items-center gap-2 text-xs text-foreground/30 pl-2">
                                                            <FileText className="h-3 w-3" />
                                                            {s.full_name || "Student"} — Not submitted
                                                        </div>
                                                    )
                                                    return (
                                                        <div key={s.id} className="p-2 rounded-lg bg-white/[0.02]">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <Avatar className="h-5 w-5">
                                                                        <AvatarFallback className="bg-primary/20 text-primary text-[8px]">
                                                                            {(s.full_name || "S").charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium">{s.full_name}</span>
                                                                    {sSub.status === "graded" && (
                                                                        <Badge className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">
                                                                            {sSub.grade}/{a.max_points}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {sSub.status !== "graded" && (
                                                                    <Button variant="ghost" size="sm" className="text-xs h-6"
                                                                        onClick={() => { setGradingId(sSub.id); setGradeValue(""); setFeedbackValue("") }}>
                                                                        Grade
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-foreground/50 mt-1 pl-7">{sSub.content}</p>
                                                            {gradingId === sSub.id && (
                                                                <div className="mt-2 pl-7 flex gap-2 items-end">
                                                                    <div className="space-y-1">
                                                                        <Label className="text-[10px]">Grade</Label>
                                                                        <Input type="number" placeholder={`/ ${a.max_points}`} value={gradeValue}
                                                                            onChange={e => setGradeValue(e.target.value)} className="h-7 text-xs w-20" />
                                                                    </div>
                                                                    <div className="space-y-1 flex-1">
                                                                        <Label className="text-[10px]">Feedback</Label>
                                                                        <Input placeholder="Optional feedback..." value={feedbackValue}
                                                                            onChange={e => setFeedbackValue(e.target.value)} className="h-7 text-xs" />
                                                                    </div>
                                                                    <Button size="sm" className="h-7 text-xs" onClick={() => gradeSubmission(sSub.id)}>
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Save
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </GlassSurface>
                                </ScrollReveal>
                            )
                        })
                    )}
                </div>
            )}

            {/* Students tab */}
            {activeTab === "students" && (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-5">
                        {students.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                                <h3 className="font-semibold mb-1">No Students Enrolled</h3>
                                <p className="text-sm text-foreground/40">Share the class invite code with students</p>
                            </div>
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
                                        <div className="text-right">
                                            <div className="text-xs text-foreground/40">
                                                {submissions.filter(sub => sub.student_id === s.id && sub.status === "graded").length}/{assignments.length} graded
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </GlassSurface>
                </ScrollReveal>
            )}
        </div>
    )
}
