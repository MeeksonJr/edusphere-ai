"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, Pin, MessageCircle, Trash2, Loader2, MessageSquare
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

interface Discussion {
  id: string
  title: string
  content: string | null
  is_pinned: boolean | null
  created_at: string
  author_id: string
  author: { full_name: string | null; username: string | null }
  reply_count: number
}

export default function TeacherDiscussionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
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

      const { data: threads } = await supabase
        .from("classroom_discussions")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })

      if (threads && threads.length > 0) {
        const authorIds = [...new Set(threads.map(t => t.author_id))]
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, username").in("id", authorIds)

        // Get reply counts
        const threadIds = threads.map(t => t.id)
        const { data: replies } = await supabase
          .from("discussion_replies")
          .select("discussion_id")
          .in("discussion_id", threadIds)

        const replyCounts: Record<string, number> = {}
        replies?.forEach(r => { replyCounts[r.discussion_id] = (replyCounts[r.discussion_id] || 0) + 1 })

        setDiscussions(threads.map(t => ({
          ...t,
          author: profiles?.find(p => p.id === t.author_id) || { full_name: null, username: null },
          reply_count: replyCounts[t.id] || 0,
        })))
      } else {
        setDiscussions([])
      }
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!supabase || !form.title.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from("classroom_discussions").insert({
        classroom_id: classroomId, author_id: user.id,
        title: form.title.trim(), content: form.content.trim() || null,
      })
      if (error) throw error
      toast({ title: "Discussion posted!" })
      setForm({ title: "", content: "" })
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setCreating(false) }
  }

  const togglePin = async (id: string, current: boolean | null) => {
    if (!supabase) return
    await supabase.from("classroom_discussions").update({ is_pinned: !current }).eq("id", id)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    await supabase.from("classroom_discussions").delete().eq("id", id)
    toast({ title: "Deleted" })
    loadData()
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
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Discussions</span>
            </h1>
            <p className="text-foreground/60">{classroom?.name}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Plus className="mr-2 h-4 w-4" /> New Thread
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Start Discussion</DialogTitle>
                <DialogDescription>Create a new discussion thread for your classroom.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="disc-title">Title</Label>
                  <Input id="disc-title" placeholder="e.g. Study tips for midterms" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="disc-content">Content (optional)</Label>
                  <Textarea id="disc-content" placeholder="Share your thoughts…" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={creating || !form.title.trim()} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollReveal>

      {discussions.length === 0 ? (
        <GlassSurface className="p-12 text-center">
          <MessageSquare className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No discussions yet</h2>
          <p className="text-foreground/50">Start the conversation with your students.</p>
        </GlassSurface>
      ) : (
        <div className="space-y-3">
          {discussions.map((d, idx) => (
            <ScrollReveal key={d.id} direction="up" delay={idx * 0.03}>
              <GlassSurface className={`p-4 group hover:border-blue-500/20 transition-all ${d.is_pinned ? "border border-blue-500/20" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/dashboard/teacher/classrooms/${classroomId}/discussions/${d.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {d.is_pinned && <Pin className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />}
                      <h3 className="font-semibold text-foreground hover:text-blue-400 transition-colors truncate">{d.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground/50">
                      <span>{d.author.full_name || d.author.username || "Unknown"}</span>
                      <span>·</span>
                      <span>{new Date(d.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {d.reply_count} {d.reply_count === 1 ? "reply" : "replies"}
                      </span>
                    </div>
                  </Link>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => togglePin(d.id, d.is_pinned)} className="text-foreground/50 hover:text-blue-400">
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-500/10">
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
