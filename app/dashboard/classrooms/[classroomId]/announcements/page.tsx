"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Megaphone, Pin } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default function StudentAnnouncementsPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params)
  const { supabase } = useSupabase()
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [classroom, setClassroom] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) return <div className="p-8 flex justify-center min-h-[60vh]"><LoadingSpinner /></div>

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-1">
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">Announcements</span>
        </h1>
        <p className="text-foreground/60 mb-8">{classroom?.name}</p>
      </ScrollReveal>

      {announcements.length === 0 ? (
        <GlassSurface className="p-12 text-center">
          <Megaphone className="h-14 w-14 text-foreground/20 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">No announcements</h2>
          <p className="text-foreground/50">Your teacher hasn&apos;t posted any announcements yet.</p>
        </GlassSurface>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, idx) => (
            <ScrollReveal key={a.id} direction="up" delay={idx * 0.03}>
              <GlassSurface className={`p-5 ${a.is_pinned ? "border border-amber-500/20" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  {a.is_pinned && <Pin className="h-3.5 w-3.5 text-amber-400" />}
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                </div>
                {a.content && <p className="text-sm text-foreground/60 whitespace-pre-wrap">{a.content}</p>}
                <p className="text-xs text-foreground/40 mt-2">{new Date(a.created_at).toLocaleString()}</p>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
