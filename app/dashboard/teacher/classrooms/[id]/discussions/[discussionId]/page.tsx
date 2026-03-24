"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Send, Trash2, Loader2, MessageCircle, Pin
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface Reply {
  id: string
  content: string
  created_at: string
  author_id: string
  author: { full_name: string | null; username: string | null }
}

export default function TeacherDiscussionDetailPage({ params }: { params: Promise<{ id: string; discussionId: string }> }) {
  const { id: classroomId, discussionId } = use(params)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [discussion, setDiscussion] = useState<any>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [supabase, discussionId])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      const { data: disc } = await supabase.from("classroom_discussions").select("*").eq("id", discussionId).single()
      if (disc) {
        const { data: authorProfile } = await supabase.from("profiles").select("full_name, username").eq("id", disc.author_id).single()
        setDiscussion({ ...disc, author: authorProfile || { full_name: null, username: null } })
      }

      const { data: reps } = await supabase
        .from("discussion_replies")
        .select("*")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true })

      if (reps && reps.length > 0) {
        const authorIds = [...new Set(reps.map(r => r.author_id))]
        const { data: profiles } = await supabase.from("profiles").select("id, full_name, username").in("id", authorIds)
        setReplies(reps.map(r => ({
          ...r,
          author: profiles?.find(p => p.id === r.author_id) || { full_name: null, username: null }
        })))
      } else { setReplies([]) }
    } catch (err: any) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleReply = async () => {
    if (!supabase || !replyContent.trim()) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from("discussion_replies").insert({
        discussion_id: discussionId, author_id: user.id, content: replyContent.trim(),
      })
      if (error) throw error
      setReplyContent("")
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSending(false) }
  }

  const deleteReply = async (replyId: string) => {
    if (!supabase) return
    await supabase.from("discussion_replies").delete().eq("id", replyId)
    loadData()
  }

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>
  if (!discussion) return <div className="p-8 text-center text-foreground/50">Discussion not found.</div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
      <ScrollReveal direction="up">
        <Link href={`/dashboard/teacher/classrooms/${classroomId}/discussions`} className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Discussions
        </Link>

        <GlassSurface className={`p-6 mb-6 ${discussion.is_pinned ? "border border-blue-500/20" : ""}`}>
          <div className="flex items-center gap-2 mb-2">
            {discussion.is_pinned && <Pin className="h-4 w-4 text-blue-400" />}
            <h1 className="text-2xl font-bold text-foreground">{discussion.title}</h1>
          </div>
          {discussion.content && (
            <p className="text-foreground/70 whitespace-pre-wrap mb-3">{discussion.content}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-foreground/50">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {(discussion.author?.full_name || discussion.author?.username || "?")[0].toUpperCase()}
            </div>
            <span className="font-medium">{discussion.author?.full_name || discussion.author?.username}</span>
            <span>·</span>
            <span>{new Date(discussion.created_at).toLocaleString()}</span>
          </div>
        </GlassSurface>
      </ScrollReveal>

      {/* Replies */}
      <ScrollReveal direction="up" delay={0.05}>
        <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>
      </ScrollReveal>

      <div className="space-y-3 mb-6">
        {replies.map((r, idx) => (
          <ScrollReveal key={r.id} direction="up" delay={0.05 + idx * 0.02}>
            <GlassSurface className="p-4 group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center text-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                  {(r.author.full_name || r.author.username || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{r.author.full_name || r.author.username}</span>
                    <span className="text-xs text-foreground/40">{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">{r.content}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteReply(r.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 hover:bg-red-500/10 flex-shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </GlassSurface>
          </ScrollReveal>
        ))}
      </div>

      {/* Reply Box */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4">
          <Textarea
            placeholder="Write a reply…"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            rows={3}
            className="bg-background/50 mb-3"
          />
          <Button onClick={handleReply} disabled={sending || !replyContent.trim()} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Reply
          </Button>
        </GlassSurface>
      </ScrollReveal>
    </div>
  )
}
