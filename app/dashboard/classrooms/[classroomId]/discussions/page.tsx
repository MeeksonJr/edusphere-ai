"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Plus, MessageCircle, MessageSquare, Pin, Loader2
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

export default function StudentDiscussionsPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [discussions, setDiscussions] = useState<any[]>([])
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
        const threadIds = threads.map(t => t.id)
        const { data: replies } = await supabase.from("discussion_replies").select("discussion_id").in("discussion_id", threadIds)
        const counts: Record<string, number> = {}
        replies?.forEach(r => { counts[r.discussion_id] = (counts[r.discussion_id] || 0) + 1 })

        setDiscussions(threads.map(t => ({
          ...t,
          author: profiles?.find(p => p.id === t.author_id) || { full_name: null, username: null },
          reply_count: counts[t.id] || 0,
        })))
      } else { setDiscussions([]) }
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

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                {classroom?.name} — Discussions
              </span>
            </h1>
            <p className="text-foreground/60">{discussions.length} thread{discussions.length !== 1 ? "s" : ""}</p>
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
                <DialogDescription>Share a question or topic with your classroom.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="s-title">Title</Label>
                  <Input id="s-title" placeholder="e.g. Help with chapter 3" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="s-content">Content (optional)</Label>
                  <Textarea id="s-content" placeholder="More details…" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} />
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
          <p className="text-foreground/50">Be the first to start a conversation!</p>
        </GlassSurface>
      ) : (
        <div className="space-y-3">
          {discussions.map((d: any, idx: number) => (
            <ScrollReveal key={d.id} direction="up" delay={idx * 0.03}>
              <Link href={`/dashboard/classrooms/${classroomId}/discussions/${d.id}`}>
                <GlassSurface className={`p-4 hover:border-blue-500/20 transition-all cursor-pointer ${d.is_pinned ? "border border-blue-500/20" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {d.is_pinned && <Pin className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />}
                    <h3 className="font-semibold text-foreground truncate">{d.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/50">
                    <span>{d.author?.full_name || d.author?.username || "Unknown"}</span>
                    <span>·</span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {d.reply_count}
                    </span>
                  </div>
                </GlassSurface>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
