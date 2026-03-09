"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Users, Info, ArrowLeft, Trophy, Crown, Flame, Settings, Copy, Share2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function GroupDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!supabase) return
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // 1. Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from("study_groups" as any)
        .select("*")
        .eq("id", groupId)
        .single()

      if (groupError || !groupData) {
        toast({ title: "Error", description: "Group not found or you do not have access.", variant: "destructive" })
        router.push("/dashboard/groups")
        return
      }
      setGroup(groupData)

      // 2. Fetch members and their profiles to build the leaderboard
      // Because we don't have a direct foreign key from study_group_members to profiles by default in the typings,
      // we need to query members, then fetch their profiles.
      const { data: memberData, error: memberError } = await supabase
        .from("study_group_members" as any)
        .select("user_id, role, joined_at")
        .eq("group_id", groupId)

      if (memberError || !memberData) {
        setLoading(false)
        return
      }

      const userIds = memberData.map((m: any) => m.user_id)
      
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, total_xp, current_streak")
        .in("id", userIds)

      const combinedData = memberData.map((m: any) => {
        const profile = profilesData?.find((p: any) => p.id === m.user_id) || {}
        return {
          ...m,
          ...profile,
        }
      })

      // Sort by total XP descending for leaderboard
      combinedData.sort((a, b) => (b.total_xp || 0) - (a.total_xp || 0))
      
      setMembers(combinedData)
      setLoading(false)
    }

    fetchGroupData()
  }, [supabase, groupId, router, toast])

  const copyInviteCode = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code)
      toast({ title: "Copied!", description: "Invite code copied to clipboard." })
    }
  }

  const handleLeaveGroup = async () => {
    if (!supabase || !user) return

    if (group.owner_id === user.id) {
      toast({ title: "Cannot leave", description: "You are the owner. You must delete the group instead.", variant: "destructive" })
      return
    }

    const { error } = await supabase
      .from("study_group_members" as any)
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user.id)

    if (error) {
      toast({ title: "Error leaving group", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Left group", description: "You have left the study squad." })
      router.push("/dashboard/groups")
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (!group) return null

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
      case 1: return "bg-slate-300/20 border-slate-300/30 text-slate-300"
      case 2: return "bg-amber-700/20 border-amber-700/30 text-amber-600"
      default: return "bg-foreground/5 border-foreground/10 text-foreground/60"
    }
  }

  const myRole = members.find(m => m.user_id === user?.id)?.role

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Back Button & Header */}
      <ScrollReveal direction="up">
        <Button 
          variant="ghost" 
          className="mb-6 -ml-4 text-foreground/60 hover:text-foreground hover:bg-foreground/10"
          onClick={() => router.push("/dashboard/groups")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-foreground">{group.name}</span>
              </h1>
              {myRole === 'admin' && (
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-foreground/70 max-w-2xl">{group.description || "No description provided."}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <GlassSurface className="flex items-center justify-between px-4 py-2 border-cyan-500/30">
              <div className="flex flex-col mr-4">
                <span className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold mb-0.5">Invite Code</span>
                <span className="font-mono text-xl font-bold tracking-widest text-cyan-400">{group.invite_code}</span>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/60 hover:text-white hover:bg-white/10" onClick={copyInviteCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </GlassSurface>
            
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-full" onClick={handleLeaveGroup}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Group Leaderboard</h2>
            </div>
            
            <GlassSurface className="overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_min-content_min-content] gap-4 p-4 border-b border-foreground/10 font-medium text-sm text-foreground/60 px-6 uppercase tracking-wider">
                <div className="w-8 text-center">#</div>
                <div>Member</div>
                <div className="text-right whitespace-nowrap">Streak</div>
                <div className="text-right whitespace-nowrap">Total XP</div>
              </div>
              
              <div className="flex flex-col">
                {members.map((member, index) => (
                  <div 
                    key={member.user_id} 
                    className={`grid grid-cols-[auto_1fr_min-content_min-content] gap-4 p-4 px-6 items-center transition-colors hover:bg-foreground/5 ${member.user_id === user?.id ? 'bg-cyan-500/5' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${getRankStyle(index)}`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className={`h-10 w-10 border-2 ${index === 0 ? 'border-yellow-500' : 'border-background'}`}>
                        <AvatarImage src={member.avatar_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-medium">
                          {(member.full_name || member.username || "A")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">{member.full_name || member.username || "Anonymous Student"}</p>
                          {index === 0 && <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-foreground/50 truncate">
                          {member.username ? `@${member.username}` : (member.role === 'admin' ? 'Group Admin' : 'Member')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center justify-end font-medium">
                      <Flame className={`h-4 w-4 mr-1.5 ${member.current_streak > 2 ? 'text-orange-500' : 'text-foreground/30'}`} />
                      <span className="w-6 text-right">{member.current_streak || 0}</span>
                    </div>
                    
                    <div className="text-right font-bold text-cyan-400 font-mono w-16">
                      {member.total_xp || 0}
                    </div>
                  </div>
                ))}
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <ScrollReveal direction="up" delay={0.2}>
            <GlassSurface className="p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-foreground">
                <Info className="h-5 w-5 text-cyan-400" />
                About this Group
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Members</span>
                  <span className="font-medium text-foreground px-2 py-0.5 rounded-full bg-foreground/10">{members.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Created</span>
                  <span className="font-medium text-foreground">{new Date(group.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-4 border-t border-foreground/10">
                  <p className="text-xs text-foreground/50 leading-relaxed">
                    Share the invite code with friends so they can join this study squad. Points are earned by completing flashcards, pomodoro sessions, and quizzes.
                  </p>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
        
      </div>
    </div>
  )
}
