"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users, UserPlus, TrendingUp, Flame, BookOpen,
  Clock, CheckCircle, XCircle, AlertCircle, Loader2, Eye
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"

interface LinkedStudent {
  id: string
  student_id: string
  status: string | null
  created_at: string
  profile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
    total_xp: number | null
    current_streak: number | null
    level: number | null
  }
}

export default function ParentPortalPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([])
  const [pendingLinks, setPendingLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [linkCode, setLinkCode] = useState("")
  const [linking, setLinking] = useState(false)
  const [accountType, setAccountType] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [supabase])

  const loadData = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get account type
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single()
      setAccountType(profile?.account_type || "student")

      // Fetch linked students (where I am parent)
      const { data: links } = await supabase
        .from("parent_student_links")
        .select("*")
        .eq("parent_id", user.id)

      if (links && links.length > 0) {
        const studentIds = links.map(l => l.student_id)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, total_xp, current_streak, level")
          .in("id", studentIds)

        const enriched = links.map(link => ({
          ...link,
          profile: profiles?.find(p => p.id === link.student_id) || {
            full_name: null, username: null, avatar_url: null,
            total_xp: null, current_streak: null, level: null
          }
        }))

        setLinkedStudents(enriched.filter(l => l.status === "linked"))
        setPendingLinks(enriched.filter(l => l.status === "pending"))
      }
    } catch (err: any) {
      console.error("Error loading parent data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkStudent = async () => {
    if (!supabase || !linkCode.trim()) return
    setLinking(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Link code is the student's username
      const { data: studentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .eq("username", linkCode.trim())
        .single()

      if (fetchError || !studentProfile) {
        toast({ title: "Student not found", description: "No student with that username exists.", variant: "destructive" })
        return
      }

      if (studentProfile.id === user.id) {
        toast({ title: "Invalid", description: "You can't link to yourself.", variant: "destructive" })
        return
      }

      // Create a link request
      const { error: insertError } = await supabase
        .from("parent_student_links")
        .insert({ parent_id: user.id, student_id: studentProfile.id, status: "pending" })

      if (insertError) {
        if (insertError.code === "23505") {
          toast({ title: "Already linked", description: "A link request already exists for this student.", variant: "destructive" })
        } else {
          throw insertError
        }
        return
      }

      toast({ title: "Link request sent!", description: `Sent to ${studentProfile.full_name || studentProfile.username}. They need to approve it.` })
      setLinkCode("")
      loadData()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setLinking(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">
                Parent Portal
              </span>
            </h1>
            <p className="text-foreground/60">
              Monitor your child&apos;s learning progress in real time
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Link a Student */}
      <ScrollReveal direction="up" delay={0.05}>
        <GlassSurface className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-400" />
            Link a Student
          </h2>
          <p className="text-foreground/50 text-sm mb-4">
            Enter your child&apos;s EduSphere username to send a link request. They will need to approve it from their dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="link-code" className="sr-only">Student Username</Label>
              <Input
                id="link-code"
                placeholder="Enter student's username…"
                value={linkCode}
                onChange={e => setLinkCode(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <Button
              onClick={handleLinkStudent}
              disabled={linking || !linkCode.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {linking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Send Link Request
            </Button>
          </div>
        </GlassSurface>
      </ScrollReveal>

      {/* Pending Requests */}
      {pendingLinks.length > 0 && (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6 mb-8 border border-amber-500/20">
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Pending Requests ({pendingLinks.length})
            </h2>
            <div className="space-y-3">
              {pendingLinks.map(link => (
                <div key={link.id} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {(link.profile.full_name || link.profile.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{link.profile.full_name || link.profile.username || "Unknown"}</p>
                      <p className="text-sm text-foreground/50">Awaiting student approval</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500">Pending</Badge>
                </div>
              ))}
            </div>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Linked Students */}
      {linkedStudents.length === 0 && pendingLinks.length === 0 ? (
        <ScrollReveal direction="up" delay={0.15}>
          <GlassSurface className="p-12 text-center">
            <Users className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No linked students yet</h2>
            <p className="text-foreground/50 max-w-md mx-auto">
              Use the form above to send a link request to your child. Once they approve, you&apos;ll see their learning progress here.
            </p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {linkedStudents.map((student, idx) => (
            <ScrollReveal key={student.id} direction="up" delay={0.1 + idx * 0.05}>
              <GlassSurface className="p-6 hover:border-emerald-500/20 transition-all cursor-pointer group">
                {/* Student Avatar & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {(student.profile.full_name || student.profile.username || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                      {student.profile.full_name || student.profile.username || "Student"}
                    </p>
                    <p className="text-sm text-foreground/50">
                      @{student.profile.username || "unknown"}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg bg-foreground/5">
                    <TrendingUp className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{student.profile.total_xp || 0}</p>
                    <p className="text-xs text-foreground/50">XP</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-foreground/5">
                    <Flame className="h-4 w-4 text-orange-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{student.profile.current_streak || 0}</p>
                    <p className="text-xs text-foreground/50">Streak</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-foreground/5">
                    <BookOpen className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">Lv.{student.profile.level || 1}</p>
                    <p className="text-xs text-foreground/50">Level</p>
                  </div>
                </div>

                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <CheckCircle className="h-3 w-3 mr-1" /> Linked
                </Badge>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
