"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, ClipboardList, Calendar, Eye, EyeOff,
  Loader2, Trash2, FileText, Upload, HelpCircle
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

const typeIcons: Record<string, any> = {
  essay: FileText,
  upload: Upload,
  quiz: HelpCircle,
}

export default function ClassroomAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<any[]>([])
  const [classroom, setClassroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: "", description: "", assignment_type: "essay",
    max_points: "100", due_date: "",
  })

  useEffect(() => { loadData() }, [supabase, classroomId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: room } = await supabase
        .from("classrooms").select("*").eq("id", classroomId).single()
      setClassroom(room)

      const { data } = await supabase
        .from("classroom_assignments")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false })
      setAssignments(data || [])
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!supabase || !form.title.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("classroom_assignments").insert({
        classroom_id: classroomId,
        teacher_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        assignment_type: form.assignment_type,
        max_points: parseInt(form.max_points) || 100,
        due_date: form.due_date || null,
        is_published: false,
      })
      if (error) throw error
      toast({ title: "Assignment created!" })
      setForm({ title: "", description: "", assignment_type: "essay", max_points: "100", due_date: "" })
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setCreating(false) }
  }

  const togglePublish = async (assignmentId: string, current: boolean) => {
    if (!supabase) return
    try {
      const { error } = await supabase
        .from("classroom_assignments")
        .update({ is_published: !current })
        .eq("id", assignmentId)
      if (error) throw error
      toast({ title: !current ? "Published!" : "Unpublished" })
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase.from("classroom_assignments").delete().eq("id", assignmentId)
      if (error) throw error
      toast({ title: "Assignment deleted" })
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {classroom?.name || "Classroom"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 text-transparent bg-clip-text">Assignments</span>
            </h1>
            <p className="text-foreground/60">{classroom?.name}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Create a new assignment for your students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="a-title">Title</Label>
                  <Input id="a-title" placeholder="e.g. Chapter 5 Essay" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="a-desc">Description</Label>
                  <Textarea id="a-desc" placeholder="Instructions for students…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={form.assignment_type} onValueChange={v => setForm(p => ({ ...p, assignment_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="upload">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="a-pts">Max Points</Label>
                    <Input id="a-pts" type="number" value={form.max_points} onChange={e => setForm(p => ({ ...p, max_points: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="a-due">Due Date</Label>
                  <Input id="a-due" type="datetime-local" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !form.title.trim()} className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollReveal>

      {assignments.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <ClipboardList className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No assignments yet</h2>
            <p className="text-foreground/50">Create your first assignment to get started.</p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {assignments.map((a, idx) => {
            const Icon = typeIcons[a.assignment_type] || FileText
            const isPastDue = a.due_date && new Date(a.due_date) < new Date()
            return (
              <ScrollReveal key={a.id} direction="up" delay={idx * 0.03}>
                <GlassSurface className="p-5 group">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/dashboard/teacher/classrooms/${classroomId}/assignments/${a.id}`} className="font-semibold text-foreground hover:text-violet-400 transition-colors truncate block">
                          {a.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-foreground/50">
                          <span>{a.max_points} pts</span>
                          {a.due_date && (
                            <>
                              <span>·</span>
                              <span className={isPastDue ? "text-red-400" : ""}>
                                <Calendar className="h-3 w-3 inline mr-0.5" />
                                {new Date(a.due_date).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={a.is_published ? "border-emerald-500/30 text-emerald-500" : "border-amber-500/30 text-amber-500"}>
                        {a.is_published ? "Published" : "Draft"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => togglePublish(a.id, a.is_published)} className="text-foreground/50 hover:text-foreground">
                        {a.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassSurface>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
