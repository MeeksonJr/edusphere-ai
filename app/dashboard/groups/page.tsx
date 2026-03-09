"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Plus, Hash, Trophy, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { Badge } from "@/components/ui/badge"

export default function StudyGroupsPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  
  const [newGroup, setNewGroup] = useState({ name: "", description: "" })
  const [inviteCode, setInviteCode] = useState("")

  useEffect(() => {
    const fetchUserAndGroups = async () => {
      if (!supabase) return
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      // Fetch groups the user is a member of
      const { data: memberData, error } = await supabase
        .from("study_group_members" as any)
        .select(`
          role,
          joined_at,
          study_groups (*)
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false })

      if (error) {
        toast({ title: "Error fetching groups", description: error.message, variant: "destructive" })
      } else {
        // Compute group counts if possible, but for now just list the groups
        const formattedGroups = memberData?.map((m: any) => ({
          ...m.study_groups,
          userRole: m.role,
          joinedAt: m.joined_at,
        })) || []
        
        setGroups(formattedGroups)
      }
      setLoading(false)
    }

    fetchUserAndGroups()
  }, [supabase, toast])

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !user) return

    if (!newGroup.name.trim()) {
      toast({ title: "Name required", description: "Please enter a group name", variant: "destructive" })
      return
    }

    try {
      setIsLoadingAction(true)
      const code = generateInviteCode()

      // 1. Create the group
      const groupDataResult = await supabase
        .from("study_groups" as any)
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          invite_code: code,
          owner_id: user.id,
        })
        .select()
        .single()

      if (groupDataResult.error) throw groupDataResult.error
      const groupData = groupDataResult.data as any

      // 2. Add creator as admin
      const { error: memberError } = await supabase
        .from("study_group_members" as any)
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: "admin",
        })

      if (memberError) throw memberError

      toast({ title: "Group Created!", description: `Invite code: ${code}` })
      setIsCreateOpen(false)
      setNewGroup({ name: "", description: "" })
      
      router.push(`/dashboard/groups/${groupData.id}`)
    } catch (error: any) {
      toast({ title: "Error creating group", description: error.message, variant: "destructive" })
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !user) return

    if (!inviteCode.trim()) {
      toast({ title: "Code required", description: "Please enter an invite code", variant: "destructive" })
      return
    }

    try {
      setIsLoadingAction(true)

      // 1. Find group by code
      const findResult = await supabase
        .from("study_groups" as any)
        .select("id, name")
        .eq("invite_code", inviteCode.trim().toUpperCase())
        .single()
        
      if (findResult.error || !findResult.data) {
        throw new Error("Invalid invite code")
      }
      
      const groupData = findResult.data as any

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("study_group_members" as any)
        .select("id")
        .eq("group_id", groupData.id)
        .eq("user_id", user.id)
        .single()

      if (existingMember) {
        toast({ title: "Already a member", description: "You are already in this group" })
        router.push(`/dashboard/groups/${groupData.id}`)
        return
      }

      // 2. Join group
      const { error: joinError } = await supabase
        .from("study_group_members" as any)
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: "member",
        })

      if (joinError) throw joinError

      toast({ title: "Joined group!", description: `Welcome to ${groupData.name}` })
      setIsJoinOpen(false)
      setInviteCode("")
      
      router.push(`/dashboard/groups/${groupData.id}`)
    } catch (error: any) {
      toast({ title: "Error joining group", description: error.message, variant: "destructive" })
    } finally {
      setIsLoadingAction(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-foreground">Study Groups</span>
            </h1>
            <p className="text-foreground/70">Form study squads, compete on leaderboards, and achieve goals together.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="glass-surface border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
              onClick={() => setIsJoinOpen(true)}
            >
              <Hash className="mr-2 h-4 w-4" aria-hidden="true" />
              Join Group
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Group
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Group List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-surface p-6 h-48 animate-pulse rounded-2xl border border-foreground/10"></div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-12 text-center border border-cyan-500/20">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-cyan-400" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-3">No Groups Yet</h3>
            <p className="text-foreground/60 mb-8 max-w-md mx-auto text-lg">
              Learning is better together. Join an existing group using an invite code or create your own squad!
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="glass-surface border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                onClick={() => setIsJoinOpen(true)}
              >
                Join with Code
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                onClick={() => setIsCreateOpen(true)}
              >
                Create New Group
              </Button>
            </div>
          </GlassSurface>
        </ScrollReveal>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, index) => (
            <ScrollReveal key={group.id} direction="up" delay={index * 0.1}>
              <AnimatedCard variant="3d" className="h-full group cursor-pointer" onClick={() => router.push(`/dashboard/groups/${group.id}`)}>
                <div className="p-6 flex flex-col h-full border border-foreground/10 hover:border-cyan-500/40 rounded-2xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-foreground/5 p-3 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
                      <Users className="h-6 w-6 text-cyan-400" />
                    </div>
                    {group.userRole === "admin" && (
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">Admin</Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-400 transition-colors">{group.name}</h3>
                  <p className="text-foreground/60 text-sm mb-6 flex-grow line-clamp-3">
                    {group.description || "No description provided."}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-foreground/10 flex items-center justify-between text-sm">
                    <div className="flex items-center text-foreground/50">
                      <Hash className="h-3.5 w-3.5 mr-1" />
                      <span className="font-mono text-xs">{group.invite_code}</span>
                    </div>
                    <div className="flex items-center text-cyan-400 font-medium">
                      <Trophy className="h-3.5 w-3.5 mr-1.5" />
                      View Leaderboard
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="glass-surface border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl">Create Study Group</DialogTitle>
            <DialogDescription>
              Form a new squad and invite your friends to start studying together.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g. CS 101 Study Squad"
                className="bg-background/50 border-foreground/20 text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What is this group focusing on?"
                className="bg-background/50 border-foreground/20 text-foreground resize-none"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                disabled={isLoadingAction || !newGroup.name.trim()}
              >
                {isLoadingAction ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
        <DialogContent className="glass-surface border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl">Join Study Group</DialogTitle>
            <DialogDescription>
              Enter the 6-character invite code shared by the group creator.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoinGroup} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="invite">Invite Code</Label>
              <Input
                id="invite"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. X7K9A2"
                maxLength={6}
                className="bg-background/50 border-foreground/20 text-foreground font-mono uppercase text-center tracking-widest text-lg"
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsJoinOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                disabled={isLoadingAction || inviteCode.length < 5}
              >
                {isLoadingAction ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Hash className="h-4 w-4 mr-2" />}
                Join Group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  )
}
