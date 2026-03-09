"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Bot, X, Send, Loader2, Sparkles, MinimizeIcon, MaximizeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
}

export function AITutorWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [user, setUser] = useState<any>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  // Initialize session and load history once
  useEffect(() => {
    if (!supabase) return

    const loadUserAndSession = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      setUser(userData.user)

      // Look for the most recent session
      const { data: recentChats } = await supabase
        .from("ai_tutor_chats" as any)
        .select("session_id")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      const chats = recentChats as any[] | null
      let currentSessionId = chats && chats.length > 0 ? chats[0].session_id : crypto.randomUUID()
      setSessionId(currentSessionId)

      // Load history for this session
      const { data: historyData } = await supabase
        .from("ai_tutor_chats" as any)
        .select("*")
        .eq("session_id", currentSessionId)
        .order("created_at", { ascending: true })

      const history = historyData as any[] | null

      if (history && history.length > 0) {
        setMessages(
          history.map((h: any) => ({
            id: h.id,
            role: h.message_role,
            content: h.content,
          }))
        )
      } else {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hi there! I'm your AI Study Tutor. Ask me anything about your courses, homework, or study materials.",
          },
        ])
      }
    }

    loadUserAndSession()
  }, [supabase]) // removed user dependency because it triggered loop if user object changed ref

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen, isMinimized])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Create context string from current URL
      const currentContext = `User is currently on page: ${pathname}`

      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          context: currentContext,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error("No response stream")

      const assistantMessageId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ])

      let fullText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              fullText += data.text
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: fullText }
                    : msg
                )
              )
            }
            if (data.error) throw new Error(data.error)
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Tutor Error",
        description: error.message || "Failed to reach AI Tutor",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If not logged in, don't show the widget
  if (!user) return null

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white z-50 p-0 flex items-center justify-center transition-transform hover:scale-105"
      >
        <Sparkles className="h-6 w-6 relative z-10" />
      </Button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? "h-[60px]" : "h-[500px] max-h-[80vh]"
      }`}
    >
      <GlassSurface className="h-full flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl rounded-2xl bg-background/80 backdrop-blur-xl">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-foreground/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">AI Study Tutor</h3>
              <p className="text-xs text-foreground/60 flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-foreground/10"
              onClick={(e) => {
                e.stopPropagation()
                setIsMinimized(!isMinimized)
              }}
            >
              {isMinimized ? <MaximizeIcon className="h-4 w-4" /> : <MinimizeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        {!isMinimized && (
          <>
            <ScrollArea className="flex-1 p-4 h-[calc(100%-120px)]">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-none"
                          : msg.id === "welcome"
                            ? "bg-cyan-500/20 text-cyan-500 font-medium rounded-bl-none border border-cyan-500/40"
                            : "bg-foreground/5 text-foreground rounded-bl-none border border-foreground/10"
                      }`}
                    >
                      {msg.content ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="flex space-x-1 items-center h-5">
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-foreground/10 bg-background/50 h-[60px]">
              <form
                onSubmit={handleSubmit}
                className="flex items-center space-x-2 bg-foreground/5 p-1 rounded-xl border border-foreground/10 focus-within:border-cyan-500/50 transition-colors h-full"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 shadow-none px-3"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </>
        )}
      </GlassSurface>
    </div>
  )
}
