"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, GraduationCap, Loader2, CheckCircle
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function JoinClassroomPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [inviteCode, setInviteCode] = useState("")
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [classroomName, setClassroomName] = useState("")

  const handleJoin = async () => {
    if (!supabase || !inviteCode.trim()) return
    setJoining(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Look up classroom by invite code
      // We need to use an RPC or a workaround since RLS blocks reading classrooms the student isn't part of
      // Use a simpler approach: call an API route
      const res = await fetch("/api/classrooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to join classroom", variant: "destructive" })
        return
      }

      setSuccess(true)
      setClassroomName(data.classroom_name || "Classroom")
      toast({ title: "Joined!", description: `Welcome to ${data.classroom_name}!` })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-lg mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <GlassSurface className="p-8 text-center">
          {success ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                You&apos;re in!
              </h1>
              <p className="text-foreground/60 mb-6">
                You&apos;ve successfully joined <strong className="text-foreground">{classroomName}</strong>.
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-violet-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Join a Classroom
              </h1>
              <p className="text-foreground/60 mb-6">
                Enter the 6-character invite code your teacher shared with you.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-code" className="sr-only">Invite Code</Label>
                  <Input
                    id="invite-code"
                    placeholder="e.g. ABC123"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    className="text-center text-2xl font-mono tracking-[0.3em] bg-background/50 h-14"
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={handleJoin}
                  disabled={joining || inviteCode.trim().length < 4}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white h-12"
                >
                  {joining ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <GraduationCap className="h-5 w-5 mr-2" />}
                  Join Classroom
                </Button>
              </div>
            </>
          )}
        </GlassSurface>
      </ScrollReveal>
    </div>
  )
}
