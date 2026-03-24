"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, Pin, Megaphone, Trash2, Loader2
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export default function TeacherAnnouncementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [classroom, setClassroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })

  useEffect(() => { loadData() }, [supabase, classroomId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: room } = await supabase.from("classrooms").select("*").eq("id", classroomId).single()
      setClassroom(room)
      const { data } = await supabase
        .from("classroom_announcements")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
      setAnnouncements(data || [])
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!supabase || !form.title.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from("classroom_announcements").insert({
        classroom_id: classroomId, teacher_id: user.id,
        title: form.title.trim(), content: form.content.trim() || null,
      })
      if (error) throw error
      toast({ title: "Announcement posted!" })
      setForm({ title: "", content: "" })
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setCreating(false) }
  }

  const togglePin = async (id: string, current: boolean) => {
    if (!supabase) return
    try {
      await supabase.from("classroom_announcements").update({ is_pinned: !current }).eq("id", id)
      loadData()
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }) }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    try {
      await supabase.from("classroom_announcements").delete().eq("id", id)
      toast({ title: "Deleted" })
      loadData()
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }) }
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {classroom?.name || "Classroom"}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">Announcements</span>
            </h1>
            <p className="text-foreground/60">{classroom?.name}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
                <DialogDescription>Send a message to all students in this classroom.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="ann-title">Title</Label>
                  <Input id="ann-title" placeholder="e.g. Exam next Friday" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="ann-content">Content</Label>
                  <Textarea id="ann-content" placeholder="Details…" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !form.title.trim()} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Megaphone className="h-4 w-4 mr-2" />}
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollReveal>

      {announcements.length === 0 ? (
        <GlassSurface className="p-12 text-center">
          <Megaphone className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No announcements yet</h2>
          <p className="text-foreground/50">Post your first announcement for your students.</p>
        </GlassSurface>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, idx) => (
            <ScrollReveal key={a.id} direction="up" delay={idx * 0.03}>
              <GlassSurface className={`p-5 group ${a.is_pinned ? "border border-amber-500/20" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {a.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                    </div>
                    {a.content && <p className="text-sm text-foreground/60 whitespace-pre-wrap">{a.content}</p>}
                    <p className="text-xs text-foreground/40 mt-2">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => togglePin(a.id, a.is_pinned)} className="text-foreground/50 hover:text-amber-400">
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
