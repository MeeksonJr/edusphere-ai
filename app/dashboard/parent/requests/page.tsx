"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle, XCircle, Clock, ArrowLeft, Users, Loader2
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface LinkRequest {
  id: string
  parent_id: string
  student_id: string
  status: string | null
  created_at: string
  parent_profile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

export default function ParentRequestsPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [requests, setRequests] = useState<LinkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [supabase])

  const loadRequests = async () => {
    if (!supabase) return
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get link requests where I am the student
      const { data: links } = await supabase
        .from("parent_student_links")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "pending")

      if (links && links.length > 0) {
        const parentIds = links.map(l => l.parent_id)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", parentIds)

        const enriched = links.map(link => ({
          ...link,
          parent_profile: profiles?.find(p => p.id === link.parent_id) || {
            full_name: null, username: null, avatar_url: null
          }
        }))
        setRequests(enriched)
      }
    } catch (err: any) {
      console.error("Error loading requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (linkId: string, action: "linked" | "rejected") => {
    if (!supabase) return
    setProcessing(linkId)
    try {
      const { error } = await supabase
        .from("parent_student_links")
        .update({ status: action })
        .eq("id", linkId)

      if (error) throw error

      toast({
        title: action === "linked" ? "Link approved!" : "Request rejected",
        description: action === "linked"
          ? "The parent can now view your learning progress."
          : "The link request has been declined."
      })
      loadRequests()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setProcessing(null)
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
    <div className="p-6 md:p-8 lg:p-12 max-w-3xl mx-auto">
      <ScrollReveal direction="up">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-foreground/50 hover:text-foreground mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
            Parent Link Requests
          </span>
        </h1>
        <p className="text-foreground/60 mb-8">
          Review and approve requests from parents who want to monitor your progress.
        </p>
      </ScrollReveal>

      {requests.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center">
            <Users className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">No pending requests</h2>
            <p className="text-foreground/50">
              You don&apos;t have any parent link requests waiting for approval.
            </p>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {requests.map((req, idx) => (
            <ScrollReveal key={req.id} direction="up" delay={idx * 0.05}>
              <GlassSurface className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                      {(req.parent_profile.full_name || req.parent_profile.username || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {req.parent_profile.full_name || req.parent_profile.username || "Parent"}
                      </p>
                      <p className="text-sm text-foreground/50">
                        Wants to view your learning progress
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequest(req.id, "linked")}
                      disabled={processing === req.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequest(req.id, "rejected")}
                      disabled={processing === req.id}
                      className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Decline
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
