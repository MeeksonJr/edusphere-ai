"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  GraduationCap, Plus, Users, ClipboardList, Copy, Loader2, Trash2
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Classroom {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_at: string
  student_count: number
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function TeacherPortalPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newClassroom, setNewClassroom] = useState({ name: "", description: "" })

  useEffect(() => {
    loadClassrooms()
  }, [supabase])

  const loadClassrooms = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: rooms } = await supabase
        .from("classrooms")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false })

      if (rooms) {
        // Get student counts for each classroom
        const enriched = await Promise.all(rooms.map(async (room) => {
          const { count } = await supabase
            .from("classroom_students")
            .select("*", { count: "exact", head: true })
            .eq("classroom_id", room.id)

          return { ...room, student_count: count || 0 }
        }))
        setClassrooms(enriched)
      }
    } catch (err: any) {
      console.error("Error loading classrooms:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClassroom = async () => {
    if (!supabase || !newClassroom.name.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const inviteCode = generateInviteCode()

      const { error } = await supabase
        .from("classrooms")
        .insert({
          teacher_id: user.id,
          name: newClassroom.name.trim(),
          description: newClassroom.description.trim() || null,
          invite_code: inviteCode,
        })

      if (error) throw error

      toast({ title: "Classroom created!", description: `Invite code: ${inviteCode}` })
      setNewClassroom({ name: "", description: "" })
      setDialogOpen(false)
      loadClassrooms()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: "Copied!", description: `Invite code ${code} copied to clipboard.` })
  }

  const handleDeleteClassroom = async (id: string) => {
    if (!supabase) return
    try {
      const { error } = await supabase.from("classrooms").delete().eq("id", id)
      if (error) throw error
      toast({ title: "Classroom deleted" })
      loadClassrooms()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
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
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 text-transparent bg-clip-text">
                Teacher Portal
              </span>
            </h1>
            <p className="text-foreground/60">
              Create classrooms, share invite codes, and track student progress
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                New Classroom
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a Classroom</DialogTitle>
                <DialogDescription>
                  Set up a new classroom. Students can join using the invite code.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="classroom-name">Classroom Name</Label>
                  <Input
                    id="classroom-name"
                    placeholder="e.g. Calculus II – Section A"
                    value={newClassroom.name}
                    onChange={e => setNewClassroom(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="classroom-desc">Description (optional)</Label>
                  <Textarea
                    id="classroom-desc"
                    placeholder="Brief description of the class…"
                    value={newClassroom.description}
                    onChange={e => setNewClassroom(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateClassroom}
                  disabled={creating || !newClassroom.name.trim()}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Classroom
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ScrollReveal>

      {/* Classrooms Grid */}
      {classrooms.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <GraduationCap className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No classrooms yet</h2>
            <p className="text-foreground/50 mb-6 max-w-md mx-auto">
              Create your first classroom to start managing your students and tracking their progress.
            </p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Classroom
            </Button>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom, idx) => (
            <ScrollReveal key={classroom.id} direction="up" delay={idx * 0.05}>
              <GlassSurface className="p-6 hover:border-violet-500/20 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClassroom(classroom.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {classroom.name}
                </h3>
                {classroom.description && (
                  <p className="text-sm text-foreground/50 mb-3 line-clamp-2">
                    {classroom.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-foreground/60">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">{classroom.student_count} students</span>
                  </div>
                </div>

                {/* Invite Code */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-foreground/5">
                  <code className="text-sm font-mono text-violet-400 flex-1 tracking-widest">
                    {classroom.invite_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyInviteCode(classroom.invite_code)}
                    className="h-8 w-8 p-0 text-foreground/50 hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Link href={`/dashboard/teacher/classrooms/${classroom.id}`}>
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View Roster
                  </Button>
                </Link>
              </GlassSurface>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
