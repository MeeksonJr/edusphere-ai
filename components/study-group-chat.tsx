"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"

interface Message {
    id: string
    content: string
    user_id: string
    message_type: string | null
    created_at: string | null
    user_name?: string
}

interface Props {
    groupId: string
    userId: string
}

export function StudyGroupChat({ groupId, userId }: Props) {
    const { supabase } = useSupabase()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [profiles, setProfiles] = useState<Record<string, string>>({})
    const bottomRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Load messages & profiles
    useEffect(() => {
        if (!supabase) return

        const loadMessages = async () => {
            const { data } = await supabase
                .from("study_group_messages")
                .select("*")
                .eq("group_id", groupId)
                .order("created_at", { ascending: true })
                .limit(100)

            if (data) {
                setMessages(data)
                // Load profiles for unique user IDs
                const userIds = [...new Set(data.map((m: any) => m.user_id))]
                if (userIds.length > 0) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("id, full_name")
                        .in("id", userIds)
                    if (profileData) {
                        const map: Record<string, string> = {}
                        profileData.forEach((p: any) => {
                            map[p.id] = p.full_name || "User"
                        })
                        setProfiles(map)
                    }
                }
            }
            setTimeout(scrollToBottom, 100)
        }

        loadMessages()

        // Subscribe to Realtime
        const channel = supabase
            .channel(`group-chat-${groupId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "study_group_messages",
                    filter: `group_id=eq.${groupId}`,
                },
                async (payload: any) => {
                    const msg = payload.new as Message
                    // Load profile name if not cached
                    if (!profiles[msg.user_id]) {
                        const { data: prof } = await supabase
                            .from("profiles")
                            .select("full_name")
                            .eq("id", msg.user_id)
                            .single()
                        if (prof) {
                            setProfiles((prev) => ({ ...prev, [msg.user_id]: prof.full_name || "User" }))
                        }
                    }
                    setMessages((prev) => [...prev, msg])
                    setTimeout(scrollToBottom, 100)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, groupId]) // eslint-disable-line react-hooks/exhaustive-deps

    const sendMessage = async () => {
        if (!supabase || !newMessage.trim() || sending) return
        setSending(true)
        try {
            await supabase.from("study_group_messages").insert({
                group_id: groupId,
                user_id: userId,
                content: newMessage.trim(),
                message_type: "text",
            })
            setNewMessage("")
        } catch (err) {
            console.error("Failed to send message:", err)
        } finally {
            setSending(false)
        }
    }

    const formatTime = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    }

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        const today = new Date()
        if (d.toDateString() === today.toDateString()) return "Today"
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }

    // Group messages by date
    const groupedMessages: { date: string; msgs: Message[] }[] = []
    messages.forEach((m) => {
        const date = formatDate(m.created_at || new Date().toISOString())
        const last = groupedMessages[groupedMessages.length - 1]
        if (last && last.date === date) {
            last.msgs.push(m)
        } else {
            groupedMessages.push({ date, msgs: [m] })
        }
    })

    return (
        <div className="flex flex-col h-[500px] bg-black/20 rounded-xl border border-white/5 overflow-hidden">
            {/* Messages */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {groupedMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-foreground/30 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {groupedMessages.map((group) => (
                    <div key={group.date}>
                        <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-foreground/30">{group.date}</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>
                        {group.msgs.map((msg) => {
                            const isOwn = msg.user_id === userId
                            const name = profiles[msg.user_id] || "User"
                            return (
                                <div key={msg.id} className={`flex gap-2 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                                    {!isOwn && (
                                        <Avatar className="h-7 w-7 shrink-0">
                                            <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs">
                                                {name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                                        {!isOwn && <p className="text-xs text-foreground/40 mb-0.5 ml-1">{name}</p>}
                                        <div
                                            className={`px-3 py-2 rounded-2xl text-sm ${isOwn
                                                ? "bg-cyan-600/30 text-foreground rounded-br-md"
                                                : "bg-white/5 text-foreground/80 rounded-bl-md"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <p className={`text-[10px] text-foreground/20 mt-0.5 ${isOwn ? "text-right mr-1" : "ml-1"}`}>
                                            {formatTime(msg.created_at || new Date().toISOString())}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border-white/10"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        size="icon"
                        className="bg-cyan-600 hover:bg-cyan-500 shrink-0"
                    >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
