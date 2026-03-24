"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Info, ArrowLeft, Trophy, Crown, Flame, Settings, Copy, Share2, LogOut, Send, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Message {
  id: string
  group_id: string
  user_id: string
  content: string
  created_at: string
  profile?: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  }
}

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

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => { scrollToBottom() }, [messages])

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

      // 3. Fetch chat messages
      const { data: msgs } = await supabase
        .from("study_group_messages")
        .select(`
          *,
          profile:profiles(full_name, username, avatar_url)
        `)
        .eq("group_id", groupId)
        .order("created_at", { ascending: true })
      
      // Type casting needed due to join with profiles
      setMessages((msgs as unknown as Message[]) || [])
      setLoading(false)
    }

    fetchGroupData()
  }, [supabase, groupId, router, toast])

  // Setup Realtime Subscription separately so it registers once user is loaded
  useEffect(() => {
    if (!supabase || !groupId) return

    const channel = supabase
      .channel(`group_${groupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_group_messages", filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const newMsg = payload.new as Message
          // Fetch profile for this newly inserted message sender
          const { data: prof } = await supabase.from("profiles").select("full_name, username, avatar_url").eq("id", newMsg.user_id).single()
          if (prof) newMsg.profile = prof
          setMessages(prev => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, groupId])

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !supabase || !user) return
    setSending(true)
    try {
      const { error } = await supabase.from("study_group_messages").insert({
        group_id: groupId,
        user_id: user.id,
        content: newMessage.trim(),
        message_type: "text"
      })
      if (error) throw error
      setNewMessage("")
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
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
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-[var(--main-height,100vh)] flex flex-col">
      {/* Header */}
      <ScrollReveal direction="up" className="flex-none mb-6">
        <Button 
          variant="ghost" 
          className="mb-4 -ml-4 text-foreground/60 hover:text-foreground hover:bg-foreground/10"
          onClick={() => router.push("/dashboard/groups")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="text-foreground">{group.name}</span>
              </h1>
              {myRole === 'admin' && (
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-foreground/70 text-sm max-w-2xl">{group.description || "No description provided."}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <GlassSurface className="flex items-center justify-between px-3 py-1.5 border-cyan-500/30 gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-foreground/50 font-semibold mb-0.5">Invite Code</span>
                <span className="font-mono text-lg font-bold tracking-widest text-cyan-400">{group.invite_code}</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-foreground/60 hover:text-white" onClick={copyInviteCode}>
                <Copy className="h-3 w-3" />
              </Button>
            </GlassSurface>
            
            <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-full" onClick={handleLeaveGroup}>
              <LogOut className="h-3.5 w-3.5 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Real-Time Chat View */}
        <div className="lg:col-span-2 flex flex-col h-[500px] lg:h-full">
          <ScrollReveal direction="up" delay={0.1} className="h-full">
            <GlassSurface className="flex flex-col h-full overflow-hidden border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]">
              <div className="p-4 border-b border-foreground/10 flex items-center justify-between bg-foreground/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Group Chat</h2>
                    <p className="text-[10px] text-foreground/50 font-medium tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {members.length} members online
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-foreground/10">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-foreground/40">
                    <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.user_id === user?.id
                    const prevMsg = index > 0 ? messages[index - 1] : null
                    const showHeader = !prevMsg || prevMsg.user_id !== msg.user_id || 
                      (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 5 * 60 * 1000)

                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${!showHeader ? 'mt-1' : 'mt-4'}`}>
                        {showHeader ? (
                          <Avatar className="h-8 w-8 shrink-0 border border-foreground/10">
                            <AvatarImage src={msg.profile?.avatar_url || ""} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-[10px]">
                              {(msg.profile?.full_name || msg.profile?.username || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          {!isMe && showHeader && (
                            <span className="text-[10px] uppercase tracking-wider text-foreground/50 mb-1 ml-1 font-semibold">
                              {msg.profile?.full_name || msg.profile?.username || "Unknown"}
                            </span>
                          )}
                          <div className={`px-4 py-2.5 shadow-sm text-sm ${
                            isMe 
                              ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-foreground/5 border border-foreground/10 text-foreground rounded-2xl rounded-tl-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          {showHeader && (
                            <span className="text-[9px] text-foreground/40 mt-1 mx-1 font-medium">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 bg-foreground/5 border-t border-foreground/10">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Input 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Message the squad..."
                    className="bg-background/50 border-foreground/20 text-sm h-11 focus-visible:ring-cyan-500/50"
                    disabled={sending}
                    maxLength={1000}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim() || sending} 
                    className="bg-cyan-500 hover:bg-cyan-600 text-white h-11 w-11 p-0 shrink-0 shadow-lg shadow-cyan-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>

        {/* Sidebar: Leaderboard & Info */}
        <div className="space-y-6 flex flex-col h-[500px] lg:h-full">
          {/* About */}
          <ScrollReveal direction="up" delay={0.2} className="shrink-0">
            <GlassSurface className="p-5 border-foreground/10">
              <h3 className="font-semibold text-sm flex items-center gap-1.5 mb-3 text-foreground">
                <Info className="h-4 w-4 text-cyan-400" />
                About this Group
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/60">Members</span>
                  <span className="font-medium text-foreground px-2 py-0.5 rounded-full bg-foreground/10">{members.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground/60">Created</span>
                  <span className="font-medium text-foreground">{new Date(group.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>

          {/* Leaderboard */}
          <ScrollReveal direction="up" delay={0.3} className="flex-1 min-h-0">
            <GlassSurface className="h-full flex flex-col overflow-hidden border-yellow-500/20">
              <div className="p-4 border-b border-foreground/10 bg-gradient-to-r from-yellow-500/5 to-transparent">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Leaderboard
                </h3>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin scrollbar-thumb-foreground/10">
                {members.map((member, index) => (
                  <div 
                    key={member.user_id} 
                    className={`flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-foreground/5 ${member.user_id === user?.id ? 'bg-cyan-500/5 border border-cyan-500/20' : 'border border-transparent'}`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-[10px] border ${getRankStyle(index)}`}>
                      {index + 1}
                    </div>
                    
                    <Avatar className={`h-8 w-8 shrink-0 ${index === 0 ? 'ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-background' : ''}`}>
                      <AvatarImage src={member.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-[10px] font-medium">
                        {(member.full_name || member.username || "A")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {member.full_name || member.username || "Student"}
                        </p>
                        {index === 0 && <Crown className="h-3 w-3 text-yellow-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-foreground/50 truncate flex-1">
                          {member.username ? `@${member.username}` : (member.role === 'admin' ? 'Admin' : 'Member')}
                        </span>
                        <div className="flex items-center text-orange-500 shrink-0">
                          <Flame className="h-3 w-3 mr-0.5" />
                          <span className="text-[10px] font-bold">{member.current_streak || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-cyan-400 font-mono">
                        {member.total_xp || 0}
                      </div>
                      <div className="text-[9px] text-foreground/40 uppercase tracking-wider">XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassSurface>
          </ScrollReveal>
        </div>
        
      </div>
    </div>
  )
}
